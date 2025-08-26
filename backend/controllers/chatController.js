const response = require("../utils/responseHandler");
const { uploadFileToCloundinary } = require("../config/CloudinaryConfig");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageStatus } = req.body;
    const file = req.file;
    const participants = [senderId, receiverId].sort();
    // check if conversation exists
    let conversation = await Conversation.findOne({
      participants: participants,
    });
    if (!conversation) {
      conversation = new Conversation({
        participants,
      });
      await conversation.save();
    }

    let imageOrVideoUrl = null;
    let contentType = null;

    // handel file upload
    if (file) {
      const uploadFile = await uploadFileToCloundinary(file);
      if (!uploadFile?.secure_url) {
        return response(res, 400, "Failed to upload file");
      }
      imageOrVideoUrl = uploadFile.secure_url;
      if (file.mimetype.startsWith("image")) {
        contentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        contentType = "video";
      } else {
        return response(res, 400, "Invalid file type");
      }
    } else if (content?.trim()) {
      contentType = "text";
    } else {
      return response(res, 400, "Message content is required");
    }

    const message = new Message({
      conversation: conversation?._id,
      sender: senderId,
      receiver: receiverId,
      content,
      contentType,
      imageOrVideoUrl,
      messageStatus,
    });
    await message.save();

    // update conversation last message
    if (message?.content) {
      conversation.lastMessage = message?._id;
    }
    conversation.unreadCount += 1;
    await conversation.save();

    const populatedMessage = await Message.findOne(message?._id)
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture");
      
      // Emit socket event for real time
    if(req.io && req.socketUserMap){
      // Broadcast to all connecting user except the creator
      const receiverSocketzid = req.socketUserMap.get(receiverId);
      if(receiverSocketzid){
        req.io.to(receiverSocketzid).emit("receiver_message",populatedMessage);
        message.messageStatus = "delivered";
        await message.save();
      }
    }

    return response(res, 201, "Message sent successfully", populatedMessage);
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};

// get all conversations
exports.getAllConversation = async (req, res) => {
  const userID = req.user.userId;
  try {
    const conversations = await Conversation.find({
      participants: { $in: [userID] },
    })
      .populate("participants", "username profilePicture isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender receiver",
          select: "username profilePicture",
        },
      })
      .sort({ updatedAt: -1 });
    return response(
      res,
      201,
      "Conversations fetched successfully",
      conversations
    );
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};

// get messages of specific conversation
exports.getMessages = async (req, res) => {
  const userID = req.user.userId;
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return response(res, 404, "Conversation not found");
    }
    if (!conversation.participants.includes(userID)) {
      return response(res, 403, "Not authorised to view this conversation");
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .sort("createdAt");

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userID,
        messageStatus: { $in: ["send", "delivered"] },
      },
      { $set: { messageStatus: "read" } }
    );

    conversation.unreadCount = 0;
    await conversation.save();

    return response(res, 200, "Message retrived", messages);
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};

exports.markAsRead = async (req, res) => {
  const { messageIds } = req.body;
  const userID = req.user.userId;

  try {
    // get relavant message to determine senders
    let messages = await Message.find({
      _id: { $in: messageIds },
      receiver: userID,
    });

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: userID,
      },
      { $set: { messageStatus: "read" } }
    );

    // notify to original sender
    if(req.io && req.socketUserMap){
      // Broadcast to all connecting user except the creator
     for(const message of messages){
      const senderSocketId = req.socketUserMap.get(message.sender.toString());
      if(senderSocketId){
        const updatedMessage = {
          _id: message._id,
          messageStatus: "read",
        };
        req.io.to(senderSocketId).emit("message_read",updatedMessage);
        await message.save();
      }
     }
    }

    return response(res, 200, "Message marked as read", messages);
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal server error");
  }
};

// delete user message
exports.deletMessage = async(req,res)=>{
    const {messageId} = req.params;
    const userID = req.user.userId;
    try {
        const message = await Message.findById(messageId);
        if(!message){
            return response(res,404,"Message is not found")
        }
        if(message.sender.toString() !== userID){
            return response(res,403,"Not authorized to delete this message");
        }
        await message.deleteOne();

            // Emit socket event
    if (req.io && req.socketUserMap) {
      const recevierSocketId = req.socketUserMap.get(message.receiver.toString());
      if(recevierSocketId){
        req.io.to(recevierSocketId).emit("message_deleted",messageId)
      }
    }
        return response(res,200,"Message deleted successfully");


    } catch (error) {
        console.log(error);
    return response(res, 500, "Internal server error");
    }
}



