const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/CloudinaryConfig");

const router = express.Router();

// Health check and diagnostics endpoint
router.get("/health/check", (req, res) => {
  const envVars = {
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPass: !!process.env.EMAIL_PASS,
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
    hasCloudinaryName: !!process.env.CLOUDINARY_NAME,
    nodeEnv: process.env.NODE_ENV || "not set",
    port: process.env.PORT || 8000,
  };
  
  console.log("🔍 Health check requested:", envVars);
  
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: envVars,
  });
});

// Public routes
router.post("/send-otp", authController.sentOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/logout", authController.logout);

// Protected routes
router.put('/update-profile', authMiddleware, multerMiddleware, authController.updateProfile);
router.get('/check-auth', authMiddleware, authController.checkAuthenticated);
router.get('/users', authMiddleware, authController.getAllUsers);

module.exports = router;
