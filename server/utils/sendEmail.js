const nodemailer = require('nodemailer');

/**
 * Utility function to send an email.
 * If EMAIL_USER and EMAIL_PASS environment variables are not set,
 * it will log the email details to the terminal/console.
 */
const sendEmail = async ({ to, subject, html, text }) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Check if SMTP credentials are provided
    if (!emailUser || !emailPass) {
        console.log('\n==================================================');
        console.log(`[DEVELOPMENT EMAIL LOG - SIMULATION]`);
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('--------------------------------------------------');
        if (text) {
            console.log(`Text Content:\n${text}`);
        }
        if (html) {
            console.log('--------------------------------------------------');
            console.log(`HTML Content:\n${html}`);
        }
        console.log('==================================================\n');
        return { success: true, simulated: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: `"Smart Crop Support" <${emailUser}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP] Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[SMTP ERROR] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;
