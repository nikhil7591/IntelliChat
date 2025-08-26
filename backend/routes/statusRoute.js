const express = require("express");
const statusController = require("../controllers/statusController");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/CloudinaryConfig");

const router = express.Router();

// Root status endpoint - returns all statuses
router.get("/", authMiddleware, statusController.getStatus);
router.post("/send-message",authMiddleware,multerMiddleware, statusController.createStatus);
router.get('/conversations',authMiddleware,statusController.getStatus);

// router.post('/update-existing-users',authMiddleware,authController.updateExistingUsers);

// protected route
router.put("/:statusId/view",authMiddleware, statusController.viewStatus);
router.delete("/:statusId",authMiddleware, statusController.deleteStatus);

module.exports = router;
