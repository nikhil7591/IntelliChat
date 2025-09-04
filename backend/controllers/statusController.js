const response = require("../utils/responseHandler");
const { uploadFileToCloundinary } = require("../config/CloudinaryConfig");
const Status = require("../models/Status");
const Message = require("../models/Message");

exports.createStatus = async (req, res) => {
  try {
    const { content, contentType } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    // Validate input
    if (!content && !file) {
      return response(res, 400, "Either content or media file is required");
    }

    let mediaUrl = null;
    let finalContentType = contentType || "text";
    // handel file upload
    if (file) {
      const uploadFile = await uploadFileToCloundinary(file);
      if (!uploadFile?.secure_url) {
        return response(res, 400, "Failed to upload file");
      }
      mediaUrl = uploadFile.secure_url;
      if (file.mimetype.startsWith("image")) {
        finalContentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        finalContentType = "video";
      } else {
        return response(res, 400, "Invalid file type");
      }
    } else if (content?.trim()) {
      finalContentType = "text";
    } else {
      return response(res, 400, "Message content is required");
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const status = new Status({
      user: userId,
      content: mediaUrl || content,
      contentType: finalContentType,
      expiresAt,
    });
    await status.save();

    const populatedStatus = await Status.findOne(status?._id)
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture");

    // Emit socket event
    if (req.io && req.socketUserMap) {
      // Broadcast to all connecting user except the creator
      for (const [connectedUserId, socketId] of req.socketUserMap) {
        if (connectedUserId !== userId) {
          req.io.to(socketId).emit("new_status", populatedStatus);
        }
      }
    }

    return response(res, 201, "Status create successfully", populatedStatus);
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};

//

exports.getStatus = async (req, res) => {
  try {
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });
    return response(res, 200, "status retrived successfully", statuses);
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};

exports.viewStatus = async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user.userId;
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status not found");
    }
    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);
      await status.save();

      const updateStatus = await Status.findById(statusId)
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture");

      // Emit socket event
      if (req.io && req.socketUserMap) {
        // Broadcast to all connecting user except the creator
        const statusOwnerSocketId = req.socketUserMap.get(
          status.user._id.toString()
        );
        if (statusOwnerSocketId) {
          const viewData = {
            statusId,
            viewerId: userId,
            totalViewers: updateStatus.viewers.length,
            viewers: updateStatus.viewers,
          };
          res.io.to(statusOwnerSocketId).emit("status_viewed", viewData);
        } else {
          console.log("Status Owner not connected");
        }
      }
    } else {
      console.log("user already viewed the status");
    }

    return response(res, 200, "Status viewed successfully");
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};

exports.deleteStatus = async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user.userId;
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status not found");
    }
    if (status.user.toString() !== userId) {
      return response(res, 403, "Not authorized to delete this Status");
    }

    await status.deleteOne();

    // Emit socket event
    if (req.io && req.socketUserMap) {
      // Broadcast to all connecting user except the creator
      for (const [connectedUserId, socketId] of req.socketUserMap) {
        if (connectedUserId !== userId) {
          req.io.to(socketId).emit("status_deleted", statusId);
        }
      }
    }

    return response(res, 200, "Status delete successfully");
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};
