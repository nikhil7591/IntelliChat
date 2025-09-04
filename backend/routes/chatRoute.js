const express = require("express");
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/CloudinaryConfig");

const router = express.Router();

router.post("/send-message",authMiddleware,multerMiddleware, chatController.sendMessage);
router.get('/conversations',authMiddleware,chatController.getAllConversation);
router.get('/conversations/:conversationId/messages',authMiddleware,chatController.getMessages);
 

// protected route
router.put("/messages/read",authMiddleware, chatController.markAsRead);
router.delete("/messages/:messageId",authMiddleware, chatController.deletMessage);

module.exports = router;
