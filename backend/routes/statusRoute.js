const express = require("express");
const statusController = require("../controllers/statusController");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/CloudinaryConfig");

const router = express.Router();

// Root status endpoint - returns all statuses
router.post("/",authMiddleware,multerMiddleware, statusController.createStatus);
router.get("/", authMiddleware, statusController.getStatus);


// protected route
router.put("/:statusId/view",authMiddleware, statusController.viewStatus);
router.delete("/:statusId",authMiddleware, statusController.deleteStatus);

module.exports = router;
