import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useThemeStore from "../store/themeStore";
import useUserStore from "../store/useUserStore";
import useLayoutStore from "../store/layoutStore";
import { FaUser, FaWhatsapp, FaUserCircle, FaCog, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdRadioButtonChecked } from "react-icons/md";

const Sidebar = () => {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { theme, setTheme } = useThemeStore();
    const { user } = useUserStore();
    const { activeTab, setActiveTab, selectedContact, isAIMode, setIsAIMode } = useLayoutStore();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (location.pathname === '/') {
            setActiveTab("chats");
        } else if (location.pathname === '/status') {
            setActiveTab("status");
        } else if (location.pathname === "/user-profile") {
            setActiveTab("profile");
        } else if (location.pathname === "/setting") {
            setActiveTab("setting");
        }
    }, [location, setActiveTab])

    if (isMobile && selectedContact) {
        return null;
    }

    const SidebarContent = (
        <>
            <Link
                to='/'
                className={`flex items-center justify-center ${isMobile ? "" : "mb-4"} ${
                    activeTab === "chats" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
                } focus:outline-none transition-all duration-200`}
            >
                <FaWhatsapp 
                    className={`h-6 w-6 ${
                        activeTab === "chats" 
                            ? theme === "dark" ? "text-gray-800" : "text-gray-800" 
                            : theme === 'dark' ? "text-gray-300" : "text-gray-800"
                    }`} 
                />
            </Link>

            <Link
                to='/status'
                className={`flex items-center justify-center ${isMobile ? "" : "mb-4"} ${
                    activeTab === "status" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
                } focus:outline-none transition-all duration-200`}
            >
                <MdRadioButtonChecked 
                    className={`h-6 w-6 ${
                        activeTab === "status" 
                            ? theme === "dark" ? "text-gray-800" : "text-gray-800" 
                            : theme === 'dark' ? "text-gray-300" : "text-gray-800"
                    }`} 
                />
            </Link>

            {!isMobile && <div className="flex-grow" />}

            <Link
                to='/setting'
                className={`flex items-center justify-center ${isMobile ? "" : "mb-4"} ${
                    activeTab === "setting" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
                } focus:outline-none transition-all duration-200`}
            >
                <FaCog 
                    className={`h-6 w-6 ${
                        activeTab === "setting" 
                            ? theme === "dark" ? "text-gray-800" : "text-gray-800" 
                            : theme === 'dark' ? "text-gray-300" : "text-gray-800"
                    }`} 
                />
            </Link>

            <Link
                to='/user-profile'
                className={`flex items-center justify-center ${isMobile ? "" : "mb-4"} ${
                    activeTab === "profile" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
                } focus:outline-none transition-all duration-200`}
            >
                {user?.profilePicture ? (
                    <img 
                        src={user?.profilePicture}
                        alt="user"
                        className={`h-8 w-8 rounded-full object-cover ${
                            activeTab === "profile" ? "ring-2 ring-gray-400" : ""
                        }`}
                    />
                ) : (
                    <FaUserCircle 
                        className={`h-6 w-6 ${
                            activeTab === "profile" 
                                ? theme === "dark" ? "text-gray-800" : "text-gray-800" 
                                : theme === 'dark' ? "text-gray-300" : "text-gray-800"
                        }`} 
                    />
                )}
            </Link>
        </>
    )

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`${isMobile ? "fixed bottom-0 left-0 right-0 h-16" : "w-16 h-screen border-r-2"} 
            ${theme === 'dark' ? "bg-gray-800 border-gray-600" : "bg-[rgb(239,242,254)] border-gray-300"}
            bg-opacity-90 flex items-center py-4 shadow-lg 
            ${isMobile ? "flex-row justify-around" : "flex-col justify-between"}
            z-40
            `}
        >
            {SidebarContent}
        </motion.div>
    )
}

export default Sidebar;
