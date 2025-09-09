// import React, { useState } from "react";
// import useThemeStore from '../../store/themeStore';
// import { logoutUser } from '../../services/user.service';
// import useUserStore from '../../store/useUserStore';
// import { toast } from 'react-toastify';
// import Layout from '../../components/Layout'
// import { FaComment, FaQuestionCircle, FaSearch, FaUser, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
// import { Link } from "react-router-dom";

// const Setting = () => {
//     const [isThemeDialogOpen, setIsDialogOpen] = useState(false);
//     const { theme } = useThemeStore();
//     const { user, clearUser } = useUserStore();

//     const toggleThemeDialog = () => {
//         setIsDialogOpen(!isThemeDialogOpen)
//     }

//     const handleLogout = async () => {
//         try {
//             await logoutUser();
//             clearUser();
//             toast.success("User logged out successfully")
//         } catch (error) {
//             console.error("Failed to logout", error);
//             toast.error("Failed to logout");
//         }
//     }

//     const menuItems = [
//         {
//             icon: FaUser,
//             label: "Account",
//             href: "/user-profile",
//         },
//         {
//             icon: FaComment,
//             label: "Chats",
//             href: "/",
//         },
//         {
//             icon: FaQuestionCircle,
//             label: "Help",
//             href: "/help",
//         }
//     ];

//     return (
//         <Layout
//             isThemeDialogOpen={isThemeDialogOpen}
//             toggleThemeDialog={toggleThemeDialog}
//         >
//             <div className={`flex h-screen ${theme === 'dark' ? "bg-[rgb(17,27,33)] text-white" : "text-black bg-white"}`}>
//                 <div className={`w-[400px] border-r ${theme === 'dark' ? "border-gray-600" : "border-gray-200"} flex flex-col`}>

//                     {/* Header */}
//                     <div className="p-4">
//                         <h1 className="text-xl font-semibold mb-4">Settings</h1>
//                         <div className="relative mb-4">
//                             <FaSearch className="absolute left-3 top-2.5 h-4 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Search settings"
//                                 className={`w-full ${theme === 'dark' ? "bg-[#202c33] text-white" : "bg-gray-100 text-black"} border-none pl-10 placeholder-gray-400 rounded-2xl p-2 focus:outline-none`}
//                             />
//                         </div>
//                     </div>

//                     {/* User Profile Section */}
//                     <div className={`flex items-center gap-4 p-4 mx-3 ${theme === 'dark' ? "hover:bg-[#202c33]" : "hover:bg-gray-100"} rounded-lg cursor-pointer mb-4`}>
//                         <img
//                             src={user?.profilePicture || "/default-avatar.png"}
//                             alt="profile"
//                             className="w-14 h-14 rounded-full object-cover"
//                         />
//                         <div className="flex-1">
//                             <h2 className="font-semibold">{user?.username}</h2>
//                             <p className="text-sm text-gray-400">{user?.about || "Hey there! I am using WhatsApp."}</p>
//                         </div>
//                     </div>

//                     {/* Menu Items */}
//                     <div className="flex-1 overflow-y-auto px-3">
//                         <div className="space-y-1">
//                             {menuItems.map((item) => (
//                                 <Link
//                                     to={item.href}
//                                     key={item.label}
//                                     className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 ${theme === 'dark'
//                                             ? "text-white hover:bg-[#202c33]"
//                                             : "text-black hover:bg-gray-100"
//                                         }`}
//                                 >
//                                     <item.icon className="h-5 w-5 flex-shrink-0" />
//                                     <div className={`flex-1 border-b ${theme === 'dark' ? "border-gray-700" : "border-gray-200"} pb-4`}>
//                                         <span className="text-base">{item.label}</span>
//                                     </div>
//                                 </Link>
//                             ))}

//                             {/* theme button */}
//                             <button
//                                 onClick={toggleThemeDialog}
//                                 className={`w-full flex items-center gap-3 p-2 rounded ${theme === 'dark'
//                                     ? "text-white hover:bg-[#202c33]"
//                                     : "text-black hover:bg-gray-100"}`}
//                             >
//                                 {theme === 'dark' ?(
//                                     <FaMoon className="h-5 w-5"/>
//                                 ):(
//                                     <FaSun className="h-5 w-5"/>
//                                 )}
//                                 <div
//                                 className={`flex flex-col text-start border-b ${theme === 'dark' ?"border-gray-700":"border-gray-200"}`}
//                                 >
//                                     Theme
//                                     <span className="ml-auto text-sm text-gray-400">{theme.charAt(0).toUpperCase()+ theme.slice(1)}</span>
//                                 </div>
//                             </button>

//                             {/* Logout Button */}
//                             <button
//                                 onClick={handleLogout}
//                                 className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 ${theme === 'dark'
//                                         ? "text-white hover:bg-[#202c33]"
//                                         : "text-black hover:bg-gray-100"
//                                     }`}
//                             >
//                                 <FaSignOutAlt className="h-5 w-5 flex-shrink-0" />
//                                 <div className={`flex-1 border-b ${theme === 'dark' ? "border-gray-700" : "border-gray-200"} pb-4`}>
//                                     <span className="text-base">Logout</span>
//                                 </div>
//                             </button>
//                         </div>
//                     </div>
//                 </div>


//             </div>
//         </Layout>
//     )
// }

// export default Setting;


import React, { useState } from "react";
import useThemeStore from '../../store/themeStore';
import { logoutUser } from '../../services/user.service';
import useUserStore from '../../store/useUserStore';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout'
import { FaComment, FaQuestionCircle, FaSearch, FaUser, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";

const Setting = () => {
    const [isThemeDialogOpen, setIsDialogOpen] = useState(false);
    console.log("isThemeDialogOpen",isThemeDialogOpen);
    const { theme, setTheme } = useThemeStore();
    const { user, clearUser } = useUserStore();

    const toggleThemeDialog = () => {
        setIsDialogOpen(!isThemeDialogOpen)
    }

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setIsDialogOpen(false);
    }

    const handleLogout = async () => {
        try {
            await logoutUser();
            clearUser();
            toast.success("User logged out successfully")
        } catch (error) {
            console.error("Failed to logout", error);
            toast.error("Failed to logout");
        }
    }

    const menuItems = [
        {
            icon: FaUser,
            label: "Account",
            href: "/user-profile",
        },
        {
            icon: FaComment,
            label: "Chats",
            href: "/",
        },
        {
            icon: FaQuestionCircle,
            label: "Help",
            href: "/help",
        }
    ];

    return (
        <Layout
            isThemeDialogOpen={isThemeDialogOpen}
            toggleThemeDialog={toggleThemeDialog}
        >
            <div className={`flex h-screen ${theme === 'dark' ? "bg-[rgb(17,27,33)] text-white" : "text-black bg-white"}`}>
                {/* Sidebar */}
                <div className={`w-[400px] border-r ${theme === 'dark' ? "border-gray-600" : "border-gray-200"} flex flex-col`}>

                    {/* Header */}
                    <div className="p-4">
                        <h1 className="text-xl font-semibold mb-4">Settings</h1>
                        <div className="relative mb-4">
                            <FaSearch className="absolute left-3 top-2.5 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search settings"
                                className={`w-full ${theme === 'dark' ? "bg-[#202c33] text-white" : "bg-gray-100 text-black"} border-none pl-10 placeholder-gray-400 rounded-2xl p-2 focus:outline-none`}
                            />
                        </div>
                    </div>

                    {/* User Profile Section */}
                    <div className={`flex items-center gap-4 p-4 mx-3 ${theme === 'dark' ? "hover:bg-[#202c33]" : "hover:bg-gray-100"} rounded-lg cursor-pointer mb-4`}>
                        <img
                            src={user?.profilePicture || "/default-avatar.png"}
                            alt="profile"
                            className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <h2 className="font-semibold">{user?.username}</h2>
                            <p className="text-sm text-gray-400">{user?.about || "Hey there! I am using WhatsApp."}</p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto px-3">
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    to={item.href}
                                    key={item.label}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 ${theme === 'dark'
                                            ? "text-white hover:bg-[#202c33]"
                                            : "text-black hover:bg-gray-100"
                                        }`}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    <div className={`flex-1 border-b ${theme === 'dark' ? "border-gray-700" : "border-gray-200"} pb-4`}>
                                        <span className="text-base">{item.label}</span>
                                    </div>
                                </Link>
                            ))}

                            {/* Theme Button - Fixed Layout */}
                            <button
                                onClick={toggleThemeDialog}
                                className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors duration-200 ${theme === 'dark'
                                        ? "text-white hover:bg-[#202c33]"
                                        : "text-black hover:bg-gray-100"
                                    }`}
                            >
                                {theme === 'dark' ? (
                                    <FaMoon className="h-5 w-5 flex-shrink-0" />
                                ) : (
                                    <FaSun className="h-5 w-5 flex-shrink-0" />
                                )}
                                <div className={`flex-1 border-b ${theme === 'dark' ? "border-gray-700" : "border-gray-200"} pb-4`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-base">Theme</span>
                                        <span className="text-sm text-gray-400">
                                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center gap-3 p-2 rounded text-red-500 ${theme === 'dark'
                                        ? "text-white hover:bg-[#202c33]"
                                        : "text-black hover:bg-gray-100"
                                    }mt-10 md:mt-36`}
                            >
                                <FaSignOutAlt className="h-5 w-5 " />
                                Log out 
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>

        </Layout>
    )
}

export default Setting;
