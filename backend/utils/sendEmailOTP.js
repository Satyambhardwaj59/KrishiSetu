const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other service like sendgrid
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailOTP = async (to, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn(`Mock Email sent perfectly: OTP ${otp} to ${to}`);
    return;
  }

  const mailOptions = {
    from: `"KrishiSetu" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your KrishiSetu Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>KrishiSetu Login Verification</h2>
        <p>Your One Time Password (OTP) to login is:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px;">
          <h1 style="letter-spacing: 5px; color: #16a34a; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          This OTP is valid for 5 minutes. Do not share this with anyone.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error sending email OTP: ${error.message}`);
    throw new Error('Could not send email OTP');
  }
};

module.exports = sendEmailOTP;
