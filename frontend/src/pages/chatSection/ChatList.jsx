import React, { useState } from "react";
import useLayoutStore from "../../store/layoutStore";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
// import {contact} from "mongoose";
import { FaPlus, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import formatTimestamp from "../../utils/formatTime"

const ChatList = ({ contacts }) => {
    const setSelectedContact = useLayoutStore((state) => state.setSelectedContact);
    const selectedContact = useLayoutStore((state) => state.selectedContact);
    const { theme } = useThemeStore();
    const { user } = useUserStore();
    const [searchTerms, setSearchTerms] = useState("");
    
    const filteredContacts = contacts?.filter((contact) => (
        contact?.username?.toLowerCase().includes(searchTerms.toLowerCase())
    ));

    // Function to truncate message
    const truncateMessage = (message, maxLength = 30) => {
        if (!message) return "";
        return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
    };

    return (
        <div
            className={`w-full border-r h-screen ${theme === 'dark' ? "bg-[rgb(17,27,33)] border-gray-600" : "bg-white border-gray-200"}`}
        >
            {/* Header Section */}
            <div
                className={`p-4 flex justify-between ${theme === 'dark' ? "text-white" : "text-gray-800"}`}
            >
                <h2 className="text-xl font-semibold">
                    Chats
                </h2>
                <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                    <FaPlus />
                </button>
            </div>

            {/* Search Section */}
            <div className="p-2">
                <div className="relative">
                    <FaSearch
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? "text-gray-400" : "text-gray-800"}`}
                    />
                    <input
                        type="text"
                        placeholder="Search or start a new chat"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? "bg-gray-800 text-white border-gray-700 placeholder-gray-500" : "text-black border-gray-200 placeholder-gray-400"}`}
                        value={searchTerms}
                        onChange={(e) => setSearchTerms(e.target.value)}
                    />
                </div>
            </div>

            {/* Chat List Section */}
            <div className="overflow-y-auto h-[calc(100vh-120px)]">
                {filteredContacts?.map((contact) => (
                    <motion.div
                        key={contact?._id}
                        onClick={() => setSelectedContact(contact)}
                        className={`p-3 flex items-center cursor-pointer transition-colors ${
                            theme === 'dark' 
                                ? selectedContact?._id === contact?._id 
                                    ? "bg-gray-700" 
                                    : "hover:bg-gray-800" 
                                : selectedContact?._id === contact?._id 
                                    ? "bg-gray-200" 
                                    : "hover:bg-gray-100"
                        }`}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <img
                                src={contact?.profilePicture}
                                alt={contact?.username}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/48x48?text=U";
                                }}
                            />
                        </div>

                        {/* Chat Content */}
                        <div className="ml-3 flex-1 min-w-0 overflow-hidden">
                            {/* Username and Timestamp Row */}
                            <div className="flex justify-between items-baseline mb-1">
                                <h1 className={`font-semibold truncate ${theme === 'dark' ? "text-white" : "text-black"}`}>
                                    {contact?.username || "Unknown User"}
                                </h1>
                                {contact?.conversation?.lastMessage && (
                                    <span className={`text-xs flex-shrink-0 ml-2 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`}>
                                        {formatTimestamp(contact?.conversation?.lastMessage?.createdAt)}
                                    </span>
                                )}
                            </div>

                            {/* Last Message and Unread Count Row */}
                            <div className="flex justify-between items-center">
                                <p className={`text-sm ${theme === 'dark' ? "text-gray-400" : "text-gray-500"} flex-1 min-w-0`}>
                                    {contact?.conversation?.lastMessage?.content 
                                        ? truncateMessage(contact.conversation.lastMessage.content, 35)
                                        : "No messages yet"
                                    }
                                </p>

                                {/* Unread Count Badge */}
                                {contact?.conversation && 
                                 contact?.conversation?.unreadCount > 0 && 
                                 contact?.conversation?.lastMessage?.receiver === user?._id && (
                                    <div className="ml-2 flex-shrink-0">
                                        <div className={`w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-xs font-semibold min-w-[20px]`}>
                                            {contact.conversation.unreadCount > 99 ? "99+" : contact.conversation.unreadCount}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* No Contacts Found */}
                {filteredContacts?.length === 0 && (
                    <div className={`text-center py-8 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`}>
                        <p>No chats found</p>
                        {searchTerms && (
                            <p className="text-sm mt-2">
                                Try searching for a different name
                            </p>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {!filteredContacts && (
                    <div className={`text-center py-8 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`}>
                        <p>Loading chats...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;

