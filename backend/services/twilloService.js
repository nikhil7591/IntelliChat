// phone number
const twillo = require('twilio');

// Twilio creaditials from env
const accountSID = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;

const serviceSID = process.env.TWILLO_SERVICE_SID;

const client = twillo(accountSID,authToken);

// send otp to phone number
const sendOTPToPhoneNumber = async(phoneNumber)=>{
    try {
        console.log('Sending OTP to this number',phoneNumber);
        if(!phoneNumber){
            throw new Error('Phone number is required');
        }
        const response = await client.verify.v2.services(serviceSID).verifications.create({
            to:phoneNumber,
            channel:'sms'
        });
        console.log('This is my OTP response', response);
        return response;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send OTP');
    }
};

const verifyOtp = async(phoneNumber,otp)=>{
    try {
        console.log('This is my OTP',otp);
        console.log('This is my Phone number',phoneNumber);
        const response = await client.verify.v2.services(serviceSID).verificationChecks.create({
            to:phoneNumber,
            code:otp
        });
        console.log('This is my OTP response', response);
        return response;
    } catch (error) {
        console.error(error);
        throw new Error('OTP verification failed');
    }
};

module.exports = {
    sendOTPToPhoneNumber,
    verifyOtp
}

