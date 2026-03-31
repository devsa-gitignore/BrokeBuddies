const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.init();
    }

    async init() {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            // Test account fallback
            try {
                const testAccount = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                console.log('--- TEST EMAIL SERVICE LOGS ---');
                console.log('Using Ethereal Test Account:', testAccount.user);
            } catch (err) {
                console.error('Failed to create test email account:', err.message);
            }
        }
    }

    async sendEmail({ to, subject, text, html }) {
        if (!this.transporter) await this.init();

        try {
            const mailOptions = {
                from: `"HackFire Team" <${process.env.EMAIL_USER || 'noreply@hackfire.com'}>`,
                to,
                subject,
                text,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email successfully sent to ${to}`);

            if (nodemailer.getTestMessageUrl(info)) {
                console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
            }
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendInvitationEmail(email, teamName, inviterName, acceptUrl, teamCode) {
        const subject = `Invitation to join team ${teamName} at HackFire`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0F0F0F; color: #FFFFFF;">
                <h2 style="color: #FFB703;">You've been invited!</h2>
                <p><strong>${inviterName}</strong> has invited you to join their team <strong>${teamName}</strong> for the upcoming hackathon on HackFire.</p>
                
                <div style="background: #1A1A1A; padding: 15px; border-radius: 8px; border: 1px solid #333; margin: 20px 0;">
                    <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Join using Team Code:</p>
                    <p style="margin: 5px 0 0 0; color: #FB8500; font-size: 24px; font-weight: bold; letter-spacing: 3px;">${teamCode}</p>
                </div>

                <div style="margin: 30px 0;">
                    <p>Alternatively, click the link below to accept instantly:</p>
                    <a href="${acceptUrl}" style="background-color: #FB8500; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept via Link</a>
                </div>
                
                <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: <br/> ${acceptUrl}</p>
                <hr style="border: 0; border-top: 1px solid #333;" />
                <p style="font-size: 12px; color: #888;">If you were not expecting this invitation, you can safely ignore this email.</p>
            </div>
        `;
        return this.sendEmail({ to: email, subject, html });
    }
}

module.exports = new EmailService();
