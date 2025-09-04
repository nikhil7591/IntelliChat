const otpGenerate = require("../utils/otpGenerater");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const response = require("../utils/responseHandler");
const sendOTPToEmail = require("../services/emailService");
const twilloService = require("../services/twilloService");
const generateToken = require("../utils/generateToken");
const { uploadFileToCloundinary } = require("../config/CloudinaryConfig");

// step -1 send otp
const sentOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenerate();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({ email });
      }
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save();
      await sendOTPToEmail(email, otp);
      return response(res, 200, "OTP send to your email address", { email });
    }

    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, "Phone Number and Phone Suffix are required");
    }

    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User({ phoneNumber, phoneSuffix });
    }
    await twilloService.sendOTPToPhoneNumber(fullPhoneNumber);
    await user.save();
    return response(res, 200, "OTP sent successfully", {
      phoneNumber: fullPhoneNumber,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return response(res, 500, "Internal server Error");
  }
};

// Step -2 verify otp
const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;
  try {
    let user;

    // Email verification
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return response(res, 404, "User not found");
      }
      const now = new Date();
      if (
        !user.emailOtp ||
        String(user.emailOtp) !== String(otp) ||
        now > new Date(user.emailOtpExpiry)
      ) {
        return response(res, 400, "Invalid or expired OTP");
      }
      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
    }
    // Phone verification
    else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "Phone Number and Phone Suffix are required");
      }

      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

      // After Twilio verification, find or create user
      user = await User.findOne({ phoneNumber });
      if (!user) {
        return response(res, 404, "User not found");
      }
      const result = await twilloService.verifyOtp(fullPhoneNumber, otp);
      if (result.status !== "approved") {
        return response(res, 400, "Invalid OTP");
      }
      user.isVerified = true;
      await user.save();
    }

    // Generate and set authentication token
    const token = generateToken(user?._id);
    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return response(res, 200, "OTP verified successfully", { user, token });
  } catch (error) {
    console.error("Verify OTP error: General exception", error);
    return response(res, 500, "Internal server Error");
  }
};

// update user profile
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

// chech Authenticated
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
    return response(res, 200, "User retrieved and Allowed to use WhatsApp", user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

// logout
const logout = (req, res) => {
  try {
    res.cookie("auth_token", "", { expires: new Date(0) });
    return response(res, 200, "User Logout Successfully! ");
  } catch (error) {}
};

// get all users
const getAllUsers = async (req, res) => {
  const loggedInUser = req.user.userId;
  try {
    const users = await User.find({ _id: { $ne: loggedInUser } })
      .select(
        "username profilePicture lastSeen isOnline about phoneNumber phoneSuffix"
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
