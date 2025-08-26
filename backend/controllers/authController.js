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

      return response(res, 200, "OTP Send to your Email", { email });
    }
    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, "Phone Number ans Phone Suffix are required");
    }
    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await new User({ phoneNumber, phoneSuffix });
    }
    await twilloService.sendOTPToPhoneNumber(fullPhoneNumber);

    await user.save();

    return response(res, 200, "Otp sen Successfully", user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

// Step -2 verify otp

const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;
  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return response(res, 404, "User not Found");
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
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "Phone Number ans Phone Suffix are required");
      }
      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber });
      if (!user) {
        return response(res, 404, "User not Found");
      }
      const result = await twilloService.verifyOtp(fullPhoneNumber, otp);
      if (result.status !== "approved") {
        return response(res, 404, "Invalid OTP");
      }
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user?._id);
    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return response(res, 200, "OTP Verified Successfully", { token, user });
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

const updateProfile = async(req,res)=>{
  const {username,agreed,about} = req.body;
  const userID = req.user.userId;
  
  console.log("req.user:", req.user);
  console.log("userID:", userID);
  
  try {
    const user = await User.findById(userID);
    
    // // Check if user exists
    // if (!user) {
    //   return response(res, 404, "User not found");
    // }
    
    const file = req.file;
    if(file){
      const uploadResult = await uploadFileToCloundinary(file);
      console.log(uploadResult);
      user.profilePicture = uploadResult?.secure_url;
      
    }else if(req.body.profilePicture){
      user.profilePicture = req.body.profilePicture;
    }

    if (username) user.username = username;
    if(agreed) user.agreed = agreed;
    if(about) user.about = about;
    await user.save();
    // console.log(user);
    return response(res, 200,"User profile update successfully", user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
}

const updateExistingUsers = async (req, res) => {
  try {
    // Update users without username
    await User.updateMany(
      { username: { $exists: false } },
      { $set: { username: "User" } }
    );
    
    // Update users without phoneNumber (if they have email)
    await User.updateMany(
      { phoneNumber: { $exists: false }, email: { $exists: true } },
      { $set: { phoneNumber: "N/A" } }
    );
    
    // Update users without phoneSuffix
    await User.updateMany(
      { phoneSuffix: { $exists: false } },
      { $set: { phoneSuffix: "+91" } }
    );
    
    return response(res, 200, "Users updated successfully");
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

const checkAuthenticated = async (req, res) => {
  try {
    const userIdFromToken = req.user?.userId;
    if (!userIdFromToken) {
      return response(
        res,
        401,
        "unauthorization please login before access ou app"
      );
    }

    const user = await User.findById(userIdFromToken);
    if (!user) {
      return response(res, 404, "User not found");
    }
    return response(
      res,
      200,
      "user retrived and allow to use WhatsApp",
      user
    );
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
};

const logout = (req,res)=>{
  try {
    res.cookie("auth_token","",{expire:new Date(0)});
    return response(res,200,'User logut Successfully');
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
}

const getAllUsers = async(req,res)=>{
  const loggedInUser = req.user.userId;
  try {
    // Get all users without select to see what's available
    const allUsers = await User.find({_id:{$ne:loggedInUser}}).lean();
    console.log("All users data:", allUsers);
    
    const users = await User.find({_id:{$ne:loggedInUser}}).select(
      "username profilePicture lastSeen isOnline about phoneNumber phoneSuffix"
    ).lean();
    console.log("Selected users data:", users);
    
    const userWithConversation = await Promise.all(
      users.map(async (user)=>{
        const conversation = await Conversation.findOne({
          participants : {$all :[loggedInUser,user?._id]}
        }).populate({
          path:"lastMessage",
          select : 'content createdAt sender receiver'
        }).lean();
        
        // Add default values for missing fields
        return {
          ...user,
          username: user.username || "User",
          phoneNumber: user.phoneNumber || "N/A",
          phoneSuffix: user.phoneSuffix || "+91",
          conversation: conversation|| null
        };
      })
      
    );
    return response(res,200,"users retrived successfully", userWithConversation);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server Error");
  }
}

module.exports = {
    sentOtp,
    verifyOtp,
    updateProfile,
    logout,
    checkAuthenticated,
    getAllUsers,
    updateExistingUsers
}
