const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/CloudinaryConfig");

const router = express.Router();

router.post("/send-otp", authController.sentOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/logout", authController.logout);
router.get('/check-auth',authMiddleware,authController.checkAuthenticated)
router.get('/users',authMiddleware,authController.getAllUsers);
// router.post('/update-existing-users',authMiddleware,authController.updateExistingUsers);

// protected route
router.put(
  "/update-profile",
  authMiddleware,
  multerMiddleware,
  authController.updateProfile
);

module.exports = router;
