const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/CloudinaryConfig");

const router = express.Router();

router.post("/send-otp", authController.sentOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/logout", authController.logout);

// protected route
router.put(
  "/update-profile",
  authMiddleware,
  multerMiddleware,
  authController.updateProfile
);

module.exports = router;
