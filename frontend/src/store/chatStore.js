import { create } from "zustand";
import { getSocket } from "../services/chat.service";
import axiosInstance from "../services/url.service";
import { useId } from "react";

export const useChatStore = create((set, get) => ({
  conversations: [], // list of all conversation
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),

  // socket event listner setup
  initSocketListeners: () => {
    const socket = getSocket();
    if (!socket) {
      return;
    }

    // remove existing listerners to pervent duplicate handlers
    socket.off("receive_message");
    socket.off("user_typing");
    socket.off("user_status");
    socket.off("message_send");
    socket.off("message_error");
    socket.off("message_deleted");

    // listen for incoming message
    socket.on("receive_message", (message) => {
      set((state) => {
        // Check if message already exists to prevent duplicates
        const messageExists = state.messages.some(msg => msg._id === message._id || 
          (msg.tempId && msg.tempId === message.tempId));
        
        if (messageExists) {
          // If message exists, update it
          return {
            messages: state.messages.map(msg => 
              (msg._id === message._id || (msg.tempId && msg.tempId === message.tempId)) 
                ? { ...message, tempId: undefined } 
                : msg
            )
          };
        } else {
          // If message doesn't exist, add it
          return {
            messages: [...state.messages, message]
          };
        }
      });
    });

    // confirm message dilivery
    socket.on("message_send", (message) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === message._id ? { ...msg } : msg
        ),
      }));
    });
    // update message status
    socket.on("message_status_update", ({ messageId, messageStatus }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, messageStatus } : msg
        ),
      }));
    });

    // handle reaction on message
    socket.on("reaction_upadte", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      }));
    });

    // handle remove message from local state
    socket.on("message_deleted", ({ deletedMessageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
      }));
    });

    // handle any message sending error
    socket.on("message_error", (error) => {
      console.error("message error", error);
    });

    // listner fot typing user
    socket.on("user_typing", ({ userId, conversationId, isTyping }) => {
      set((state) => {
        const newTypingUsers = new Map(state.typingUsers);
        if (!newTypingUsers.has(conversationId)) {
          newTypingUsers.set(conversationId, new Set());
        }
        const typingSet = newTypingUsers.get(conversationId);
        if (isTyping) {
          typingSet.add(userId);
        } else {
          typingSet.delete(userId);
        }
        return { typingUsers: newTypingUsers };
      });
    });

    // track user's online/offline status
    socket.on("user_status", ({ userId, isOnline, lastSeen }) => {
      set((state) => {
        const newOnlineUsers = new Map(state.onlineUsers);
        newOnlineUsers.set(userId, { isOnline, lastSeen });
        return { onlineUsers: newOnlineUsers };
      });
    });
  },

  // refresh user statuses for all conversations
  refreshUserStatuses: () => {
    const socket = getSocket();
    if (!socket) return;

    const { conversations, currentUser } = get();
    if (conversations?.data?.length > 0) {
      conversations.data?.forEach((conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id !== currentUser?._id
        );
        if (otherUser?._id) {
          socket.emit("get_user_status", otherUser._id, (status) => {
            set((state) => {
              const newOnlineUsers = new Map(state.onlineUsers);
              newOnlineUsers.set(status.userId, {
                isOnline: status.isOnline,
                lastSeen: status.lastSeen,
              });
              return { onlineUsers: newOnlineUsers };
            });
          });
        }
      });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  // fetchConversation
  fectchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/chat/conversations");
      set({ conversations: data, loading: false });
      // Refresh user statuses after conversations are loaded
      get().refreshUserStatuses();
      return data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      return null;
    }
  },

  // fetch message
  fetchMessages: async (conversationId) => {
    if (!conversationId) return;
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get(
        `/chat/conversations/${conversationId}/messages`
      );
      const messageArray = data.data || data || [];
      set({
        messages: messageArray,
        currentConversation: conversationId,
        loading: false,
      });

      // mark unread message as read
      const { markMessagesAsRead } = get();
      markMessagesAsRead();

      return messageArray;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      return [];
    }
  },

  // send message in real time
  sendMessage: async (formData) => {
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");
    const media = formData.get("media");
    const content = formData.get("content");
    const messageStatus = formData.get("messageStatus");
    const socket = getSocket();
    const { conversations, fectchConversations } = get();
    
    // Find or create conversation
    let conversation = conversations?.data?.find(
      (conv) =>
        conv.participants.some((p) => p._id === senderId) &&
        conv.participants.some((p) => p._id === receiverId)
    );
    
    let conversationId = conversation?._id || null;
    // temp message brfore actula respomse
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: senderId },
      receiver: { _id: receiverId },
      conversation: conversationId,
      imageOrVideoUrl:
        media && typeof media !== "string" ? URL.createObjectURL(media) : null,
      content: content,
      contentType: media
        ? media.type.startsWith("image")
          ? "image"
          : "vedio"
        : "text",
      createdAt: new Date().toISOString(),
      messageStatus,
    };
    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));
    try {
      const { data } = await axiosInstance.post(
        "/chat/send-message",
        formData,
        { headers: { "Content-Type": "mulipart/form-data" } }
      );
      const messageData = data.data || data;

      // Refresh conversations to get the new one if it was created
      if (!conversationId) {
        await fectchConversations();
      }

      // replace optimistic message with real one
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? messageData : msg
        ),
      }));
      return messageData;
    } catch (error) {
      console.error("Error sending message", error);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...msg, messageStatus: "failed" } : msg
        ),
        error: error?.response?.data?.message || error?.message,
      }));
      throw error;
    }
  },

  // receive Message
  receiveMessage: (message) => {
    if (!message) return;
    const { currentConversation, currentUser, messages, fectchConversations } = get();
    
    // If this is a new conversation, refresh the conversations list
    if (!currentConversation || currentConversation !== message.conversation) {
      fectchConversations();
    }
    const messageExits = message.some((msg) => msg._id === message._id);
    if (messageExits) return;

    if (message.conversation === currentConversation) {
      set((state) => ({
        message: [...state.messages, message],
      }));

      // automaticaly mark as read
      if (message.receiver?._id === currentUser?._id) {
        get().markMessagesAsRead();
      }
    }

    // update conversation preview and unread count
    set((state) => {
      const updateConversation = state.conversations?.data?.map((conv) => {
        if (conv._id === message.conversation) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount:
              message?.receiver?._id === currentUser?._id
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount || 0,
          };
        }
        return conv;
      });
      return {
        conversations: {
          ...state.conversations,
          data: updateConversation,
        },
      };
    });
  },

  // mark as read
  markMessagesAsRead: async () => {
    const { messages, currentUser } = get();
    if (!messages.length || !currentUser) return;
    const unreadIds = messages
      .filter(
        (msg) =>
          msg.messageStatus !== "read" && msg.receiver?._id === currentUser?._id
      )
      .map((msg) => msg._id)
      .filter(Boolean);

    if (unreadIds.length === 0) return;

    try {
      const { data } = await axiosInstance.put("/chat/messages/read", {
        messageIds: unreadIds,
      });
      console.log("message mark as read", data);
      set((state) => ({
        messages: state.messages.map((msg) =>
          unreadIds.includes(msg._id) ? { ...msg, messageStatus: "read" } : msg
        ),
      }));

      const socket = getSocket();
      if (socket) {
        socket.emit("message_read", {
          messageIds: unreadIds,
          senderId: messages[0]?.sender?._id,
        });
      }
    } catch (error) {
      console.error("Failed to mark message as read", error);
    }
  },

  // delete message
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/chat/messages/${messageId}`);
      set((state) => ({
        messages: state.messages?.filter((msg) => msg?._id !== messageId),
      }));
      return true;
    } catch (error) {
      console.error("error delete message", error);
      set({ error: error.response?.data?.message || error.message });
      return false;
    }
  },

  // add/change reaction
  addReaction: async (messageId, emoji) => {
    const socket = getSocket();
    const { currentUser } = get();
    if (socket && currentUser) {
      socket.emit("add_reaction", {
        messageId,
        emoji,
        userId: currentUser?._id,
      });
    }
  },

  // start and stop typing
  startTyping: (receiverId) => {
    const { currentConversation } = get();
    const socket = getSocket();
    if (socket && currentConversation && receiverId) {
      socket.emit("typing_start", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },
  stopTyping: (receiverId) => {
    const { currentConversation } = get();
    const socket = getSocket();
    if (socket && currentConversation && receiverId) {
      socket.emit("typing_stop", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },

  isUserTyping: (userId) => {
    const { typingUsers, currentConversation } = get();
    if (!userId || !currentConversation || !typingUsers.has(currentConversation)) {
      return false;
    }
    const typingSet = typingUsers.get(currentConversation);
    return typingSet ? typingSet.has(userId) : false;
  },

  // is user online
  isUserOnline: (userId) => {
    if (!userId) return null;
    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.isOnline || false;
  },

  // last seen
  getUserLastSeen: (userId) => {
    if (!userId) return null;
    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.lastSeen || null;
  },

  // clean unfound
  cleanup: () => {
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      onlineUsers: new Map(),
      typingUsers: new Map(),
    });
  },
}));
