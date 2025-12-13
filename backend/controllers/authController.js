const otpGenerate = require("../utils/otpGenerater");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const response = require("../utils/responseHandler");
const sendOTPToEmail = require("../services/emailService");
const generateToken = require("../utils/generateToken");
const { uploadFileToCloundinary } = require("../config/CloudinaryConfig");

// Step 1: Send OTP to email (Email-only authentication)
const sentOtp = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Validate email is provided
    if (!email) {
      return response(res, 400, "Email address is required");
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return response(res, 400, "Please provide a valid email address");
    }

    // Generate 6-digit OTP
    const otp = otpGenerate();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    // Store OTP and expiry in database
    user.emailOtp = otp;
    user.emailOtpExpiry = expiry;
    await user.save();

    // Send OTP via email
    try {
      await sendOTPToEmail(email, otp);
      console.log(`✅ OTP successfully sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Email sending failed:", {
        error: emailError.message,
        email: email,
        timestamp: new Date().toISOString(),
      });
      // Don't throw - let's provide helpful error
      return response(res, 500, `Email service error: ${emailError.message}`);
    }

    return response(res, 200, "OTP sent to your email address", { email });
  } catch (error) {
    console.error("Send OTP error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return response(res, 500, `Server error: ${error.message}`);
  }
};

// Step 2: Verify OTP sent to email
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    // Validate required fields
    if (!email || !otp) {
      return response(res, 400, "Email and OTP are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return response(res, 404, "User not found");
    }

    // Validate OTP
    const now = new Date();
    
    // Check if OTP exists
    if (!user.emailOtp) {
      return response(res, 400, "No OTP found. Please request a new OTP.");
    }

    // Check if OTP matches (convert both to strings for comparison)
    if (String(user.emailOtp) !== String(otp)) {
      return response(res, 400, "Invalid OTP");
    }

    // Check if OTP has expired
    if (now > new Date(user.emailOtpExpiry)) {
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
      return response(res, 400, "OTP has expired. Please request a new OTP.");
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);
    
    // Set authentication token in cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });

    return response(res, 200, "OTP verified successfully", { 
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      token 
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return response(res, 500, "Internal server error");
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { username, agreed, about } = req.body;
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, "User not found");
    }
    const file = req.file;
    if (file) {
      const uploadResult = await uploadFileToCloundinary(file);
      console.log("Upload Result:", uploadResult);
      user.profilePicture = uploadResult?.secure_url;
    } else if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture;
    }
    if (username) {
      user.username = username;
    }
    if (agreed) {
      user.agreed = agreed;
    }
    if (about) {
      user.about = about;
    }
    await user.save();
    return response(res, 200, "User profile updated successfully", user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

// Check Authenticated
const checkAuthenticated = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return response(res, 401, "User not authenticated");
    }
    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, "User not found");
    }
    return response(res, 200, "User retrieved and Allowed to use IntelliChat", user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

// Logout
const logout = (req, res) => {
  try {
    res.cookie("auth_token", "", { expires: new Date(0) });
    return response(res, 200, "User Logout Successfully!");
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  const loggedInUser = req.user.userId;
  try {
    const users = await User.find({ _id: { $ne: loggedInUser } })
      .select(
        "username profilePicture lastSeen isOnline about"
      )
      .lean();
    const userWithConversation = await Promise.all(
      users.map(async (user) => {
        const conversation = await Conversation.findOne({
          participants: { $all: [loggedInUser, user?._id] },
        })
          .populate({
            path: "lastMessage",
            select: "content createdAt sender receiver",
          })
          .lean();
        // Add default values for missing fields
        return {
          ...user,
          conversation: conversation || null,
        };
      })
    );
    return response(res, 200, "All user list", userWithConversation);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

module.exports = {
  sentOtp,
  verifyOtp,
  updateProfile,
  logout,
  checkAuthenticated,
  getAllUsers,
};
