const Problem = require('../models/Problem');
const Hackathon = require('../models/Hackathon');

// @desc    Create a problem statement
// @route   POST /api/hackathons/:hackathonId/problems
// @access  Private (Admin)
exports.createProblem = async (req, res) => {
    try {
        const { title, description, category, domain, difficulty } = req.body;
        const hackathonId = req.params.id;

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        const problem = await Problem.create({
            title,
            description,
            category,
            domain,
            difficulty,
            hackathon: hackathonId
        });

        // Add problem to hackathon's problems array
        hackathon.problems.push(problem._id);
        await hackathon.save();

        res.status(201).json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all problems for a hackathon
// @route   GET /api/hackathons/:hackathonId/problems
// @access  Public
exports.getProblemsByHackathon = async (req, res) => {
    try {
        const { domain } = req.query;
        const query = { hackathon: req.params.id };
        if (domain) {
            query.domain = domain;
        }

        const problems = await Problem.find(query);
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a problem statement
// @route   PUT /api/problems/:problemId
// @access  Private (Admin)
exports.updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a problem statement
// @route   DELETE /api/problems/:problemId
// @access  Private (Admin)
exports.deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Remove from Hackathon's problems array
        await Hackathon.findByIdAndUpdate(problem.hackathon, {
            $pull: { problems: problem._id }
        });

        await problem.deleteOne();
        res.json({ message: 'Problem removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique domains for problem statements in a hackathon
// @route   GET /api/hackathons/:id/problem-domains
// @access  Public
exports.getProblemDomains = async (req, res) => {
    try {
        const domains = await Problem.find({ hackathon: req.params.id }).distinct('domain');
        res.json({ success: true, domains });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
