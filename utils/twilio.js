require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const sendSms = (phoneNumber, code) => {
  return new Promise((resolve, reject) => {
    const client = require('twilio')(accountSid, authToken);
    client.messages
      .create({
        body: `Melody Mocktail.
Your One-Time Password (OTP) is: ${code}
Please use this OTP to complete your authentication process.
-Melody Mocktail`,
        messagingServiceSid: 'MG7f5e3f97b110a5280136b22cce2e2c4d',
        to: phoneNumber,
      })
      .then((message) => {
        resolve({
          status: 200,
          message: 'Otp sent succesful',
        });
      })
      .catch((err) => {
        if (err.code === 21211) {
          resolve({
            status: 400,
            message: 'Invalid Phone Number',
          });
        }
      });
  });
};

module.exports = {
  sendSms,
};
