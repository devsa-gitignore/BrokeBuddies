const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const { generateCertificateFile } = require('../services/certificateService');

const CERT_DIR = path.resolve(process.cwd(), 'src', 'utils', 'certificates');

// ─── Internal helper ────────────────────────────────────────────────────────
async function createCertForUser(req, user, hackathon, certificateType) {
    // Check if already generated
    const existing = await Certificate.findOne({
        user: user._id,
        hackathon: hackathon._id,
        type: certificateType
    });

    const getAbsoluteUrl = (filename) => `${req.protocol}://${req.get('host')}/api/certificates/file/${filename}`;

    if (existing && existing.certificateUrl && existing.certificateUrl.includes('.png')) {
        // Extract filename from stored URL or reconstruct
        const filename = existing.certificateUrl.split('/').pop();
        return { skipped: true, cert: existing, absoluteUrl: getAbsoluteUrl(filename) };
    }

    // If existing but no real file (legacy record), we'll regenerate below
    console.log(existing ? `Found legacy/invalid cert record for ${user.name}, regenerating...` : `Generating new cert for ${user.name}...`);

    const { filePath, verifyCode, filename } = await generateCertificateFile(
        user._id.toString(),
        hackathon._id.toString(),
        {
            participantName: user.name,
            hackathonName: hackathon.name,
            category: certificateType,
            organizerName: hackathon.hostedBy || 'Organizer',
            headJudgeName: 'Head Judge',
            baseUrl: `${req.protocol}://${req.get('host')}`
        }
    );

    // Store relative path in DB for flexibility, but return absolute in API
    const certificateUrl = `/api/certificates/file/${filename}`;

    const cert = await Certificate.create({
        user: user._id,
        hackathon: hackathon._id,
        type: certificateType,
        certificateUrl,
        qrVerificationCode: verifyCode,
        generatedAt: new Date()
    });

    return { skipped: false, cert, absoluteUrl: getAbsoluteUrl(filename) };
}

// @desc    Bulk generate participation certificates for all verified attendees
// @route   POST /api/hackathons/:hackathonId/certificates/generate
// @access  Private (Admin)
exports.bulkGenerateCertificates = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const hackathon = await Hackathon.findById(hackathonId).select('name hostedBy');
        if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

        // 1. Try fetching from Attendance first
        let attendees = await Attendance.find({ hackathonId }).populate('userId');
        let userList = attendees.map(a => a.userId).filter(u => u !== null);

        // 2. Fallback: If no attendance, fetch all registered team members for demo purposes
        if (userList.length === 0) {
            console.log('No attendance found, falling back to registered teams for demo...');
            const Team = require('../models/Team');
            const teams = await Team.find({ hackathon: hackathonId }).populate('members');

            const userMap = new Map();
            teams.forEach(team => {
                team.members.forEach(member => {
                    if (member) userMap.set(member._id.toString(), member);
                });
            });
            userList = Array.from(userMap.values());
        }

        if (userList.length === 0) {
            return res.status(404).json({ success: false, message: 'No participants (teams or attendees) found for this hackathon' });
        }

        const results = { generated: 0, skipped: 0, failed: 0, certificates: [] };

        for (const user of userList) {
            try {
                const { skipped, cert, absoluteUrl } = await createCertForUser(req, user, hackathon, 'participation');
                if (skipped) results.skipped++;
                else results.generated++;
                results.certificates.push({ userId: user._id, name: user.name, certificateUrl: absoluteUrl });
            } catch (err) {
                console.error(`Cert gen failed for ${user._id}:`, err.message);
                results.failed++;
            }
        }

        res.status(200).json({ success: true, message: 'Bulk certificate generation complete', results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get certificates for a specific user and hackathon
// @route   GET /api/certificates/:userId/:hackathonId
// @access  Private
exports.getStudentCertificates = async (req, res) => {
    try {
        const { userId, hackathonId } = req.params;
        const certificates = await Certificate.find({ user: userId, hackathon: hackathonId })
            .populate('hackathon', 'name hostedBy');

        // Convert to absolute URLs for response
        const formattedCerts = certificates.map(c => {
            const filename = c.certificateUrl.split('/').pop();
            return {
                ...c._doc,
                certificateUrl: `${req.protocol}://${req.get('host')}/api/certificates/file/${filename}`
            };
        });

        res.status(200).json({ success: true, certificates: formattedCerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify a certificate via its QR verification code
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
exports.verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const cert = await Certificate.findOne({ qrVerificationCode: certificateId })
            .populate('user', 'name email')
            .populate('hackathon', 'name hostedBy');

        if (!cert) return res.status(404).json({ success: false, message: 'Invalid or expired certificate' });

        res.status(200).json({
            success: true,
            valid: true,
            details: {
                userName: cert.user?.name,
                userEmail: cert.user?.email,
                hackathonName: cert.hackathon?.name,
                hostedBy: cert.hackathon?.hostedBy,
                type: cert.type,
                generatedAt: cert.generatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Serve the generated certificate PNG file
// @route   GET /api/certificates/file/:filename
// @access  Public (for demo ease)
exports.downloadCertificate = (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(CERT_DIR, filename);

        console.log(`[CertServing] CWD: ${process.cwd()}`);
        console.log(`[CertServing] Requested: ${filename}`);
        console.log(`[CertServing] Full Path: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.error(`[CertServing] File NOT found: ${filePath}`);
            return res.status(404).json({ success: false, message: 'Certificate file not found' });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error(`[CertServing] Error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Legacy stubs
exports.generateCertificate = (req, res) => res.status(501).json({ message: 'Use bulk generate endpoint instead' });
exports.generateWinnerCertificates = (req, res) => res.status(501).json({ message: 'Handled via bulk generate with type param' });
