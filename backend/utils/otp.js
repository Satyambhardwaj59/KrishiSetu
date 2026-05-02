const logger = require('./logger');

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

const sendSmsOTP = async (phone, otp) => {
  try {
    // client.messages.create({
    //   body: `Your KrishiSetu login OTP is ${otp}. It is valid for 5 minutes.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });

    // Fallback Mock Logger when Twilio is commented
    logger.info(`Mock SMS OTP sent perfectly: OTP ${otp} to phone ${phone}`);
  } catch (error) {
    logger.error('Error sending SMS OTP:', error);
    throw new Error('Failed to send SMS OTP');
  }
};

module.exports = { sendSmsOTP };
