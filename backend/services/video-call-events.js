const handleVideoCallEvent = (socket, io, onlineUsers) => {
    // Handle call initiation
    socket.on("initiate_call", ({ callerId, receiverId, callType, callId, callerInfo }) => {
        try {
            console.log(`Call initiated: ${callerId} -> ${receiverId}, type: ${callType}`);
            
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                // Notify receiver of incoming call
                io.to(receiverSocketId).emit("incoming_call", {
                    callerId,
                    callerName: callerInfo.username,
                    callerAvatar: callerInfo.profilePicture,
                    callType,
                    callId
                });
            } else {
                // Receiver is offline - notify caller
                socket.emit("call_failed", {
                    reason: "user_offline",
                    callId
                });
            }
        } catch (error) {
            console.error("Error initiating call:", error);
            socket.emit("call_failed", {
                reason: "server_error",
                callId: callId
            });
        }
    });

    // Handle call acceptance
    socket.on("accept_call", ({ callerId, callId, receiverInfo }) => {
        try {
            console.log(`Call accepted: ${callId}`);
            
            const callerSocketId = onlineUsers.get(callerId);
            
            if (callerSocketId) {
                io.to(callerSocketId).emit("call_accepted", {
                    callId,
                    receiverName: receiverInfo.username,
                    receiverAvatar: receiverInfo.profilePicture
                });
            } else {
                // Caller disconnected
                socket.emit("call_failed", {
                    reason: "caller_disconnected",
                    callId
                });
            }
        } catch (error) {
            console.error("Error accepting call:", error);
            socket.emit("call_failed", {
                reason: "server_error",
                callId
            });
        }
    });

    // Handle call rejection
    socket.on("reject_call", ({ callerId, callId }) => {
        try {
            console.log(`Call rejected: ${callId}`);
            
            const callerSocketId = onlineUsers.get(callerId);
            
            if (callerSocketId) {
                io.to(callerSocketId).emit("call_rejected", {
                    callId
                });
            }
        } catch (error) {
            console.error("Error rejecting call:", error);
        }
    });

    // Handle call end
    socket.on("end_call", ({ callId, participantId }) => {
        try {
            console.log(`Call ended: ${callId}`);
            
            const participantSocketId = onlineUsers.get(participantId);
            
            if (participantSocketId) {
                io.to(participantSocketId).emit("call_ended", {
                    callId
                });
            }
        } catch (error) {
            console.error("Error ending call:", error);
        }
    });

    // Handle WebRTC offer
    socket.on("webrtc_offer", ({ offer, receiverId, callId }) => {
        try {
            console.log(`WebRTC offer for call: ${callId}`);
            
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("webrtc_offer", {
                    offer,
                    senderId: [...onlineUsers.entries()]
                        .find(([_, socketId]) => socketId === socket.id)?.[0],
                    callId
                });
            } else {
                socket.emit("call_failed", {
                    reason: "signaling_failed",
                    callId
                });
            }
        } catch (error) {
            console.error("Error handling WebRTC offer:", error);
            socket.emit("call_failed", {
                reason: "signaling_failed",
                callId
            });
        }
    });

    // Handle WebRTC answer
    socket.on("webrtc_answer", ({ answer, receiverId, callId }) => {
        try {
            console.log(`WebRTC answer for call: ${callId}`);
            
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("webrtc_answer", {
                    answer,
                    senderId: [...onlineUsers.entries()]
                        .find(([_, socketId]) => socketId === socket.id)?.[0],
                    callId
                });
            } else {
                socket.emit("call_failed", {
                    reason: "signaling_failed",
                    callId
                });
            }
        } catch (error) {
            console.error("Error handling WebRTC answer:", error);
            socket.emit("call_failed", {
                reason: "signaling_failed",
                callId
            });
        }
    });

    // Handle ICE candidates
    socket.on("webrtc_ice_candidate", ({ candidate, receiverId, callId }) => {
        try {
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("webrtc_ice_candidate", {
                    candidate,
                    senderId: [...onlineUsers.entries()]
                        .find(([_, socketId]) => socketId === socket.id)?.[0],
                    callId
                });
            }
        } catch (error) {
            console.error("Error handling ICE candidate:", error);
        }
    });
};

module.exports = { handleVideoCallEvent };
