// Email OTP Service using Brevo (Sendinblue) - Works perfectly on Render
const SibApiV3Sdk = require("sib-api-v3-sdk");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Brevo client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Verify that BREVO_API_KEY is configured
if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY not found in environment variables");
  console.log("⚠️  Please add BREVO_API_KEY to your .env and Render environment");
  console.log("📍 Get a free API key from: https://www.brevo.com");
} else {
  console.log("✅ Brevo email service initialized and ready");
}

/**
 * Send OTP to user's email using Brevo
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPToEmail = async (email, otp) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #075e54; margin: 0; font-size: 28px;">🔐 IntelliChat Verification</h1>
        </div>

        <!-- Main Content -->
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Hi there,</p>
          
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            Your one-time password (OTP) to verify your IntelliChat account is:
          </p>

          <!-- OTP Box -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="font-size: 12px; margin: 0 0 10px 0; opacity: 0.9;">Your OTP Code</p>
            <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">${otp}</p>
          </div>

          <!-- Important Info -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <p style="color: #856404; font-size: 14px; margin: 0;">
              <strong>⏱️ This OTP is valid for 5 minutes.</strong> Please do not share this code with anyone.
            </p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 25px 0;">
            If you didn't request this OTP, please ignore this email and your account will remain secure.
          </p>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              IntelliChat Security Team<br/>
              <small>This is an automated message. Please do not reply to this email.</small>
            </p>
          </div>

        </div>

        <!-- Bottom Info -->
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          For security reasons, we never ask for OTP via email or phone calls.
        </p>

      </div>
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Your IntelliChat OTP Verification Code";
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: "IntelliChat",
      email: "noreply@intellichat.app",
    };
    sendSmtpEmail.to = [
      {
        email: email,
      },
    ];
    sendSmtpEmail.replyTo = {
      email: "support@intellichat.app",
    };

    // Send email via Brevo
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ OTP email sent successfully via Brevo:", {
      to: email,
      messageId: response.messageId,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error("❌ Error sending OTP email via Brevo:", {
      email,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = sendOTPToEmail;
