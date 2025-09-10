import React, { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import useThemeStore from "../store/themeStore";
import { updateUserProfile } from "../services/user.service";
import { toast } from "react-toastify";
import EmojiPicker, { Emoji } from "emoji-picker-react";
import Layout from "./Layout";
import { motion } from "framer-motion";
import { FaCamera, FaCheck, FaPencilAlt, FaSmile, FaSpinner } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const avatars = [
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
];

const UserDetails = () => {
    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [showAvatarSelection, setShowAvatarSelection] = useState(false);
    const [hasProfileChanges, setHasProfileChanges] = useState(false); // Track changes
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [showNameEmoji, setShowNameEmoji] = useState(false);
    const [showAboutEmoji, setShowAboutEmoji] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { user, setUser } = useUserStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        if (user) {
            setName(user.username || "");
            setAbout(user.about || "");
            // Set initial avatar state
            if (!user.profilePicture) {
                setSelectedAvatar(avatars[0]);
            }
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreview(URL.createObjectURL(file));
            setSelectedAvatar(null);
            setHasProfileChanges(true);
        }
    };

    const handleAvatarSelect = (avatar) => {
        setSelectedAvatar(avatar);
        setPreview(null);
        setProfilePicture(null);
        setShowAvatarSelection(false);
        setHasProfileChanges(true); // Mark that changes were made
    };

    const getDisplayImage = () => {
        // Priority: preview > selectedAvatar > user profilePicture > default avatar
        if (preview) return preview;
        if (selectedAvatar) return selectedAvatar;
        if (user?.profilePicture) return user.profilePicture;
        return avatars[0];
    };

    const handleSave = async (field) => {
        try {
            setIsUpdating(true);
            const formData = new FormData();
            
            if (field === 'name') {
                formData.append("username", name);
                setIsEditingName(false);
                setShowNameEmoji(false);
            } else if (field === 'about') {
                formData.append("about", about);
                setIsEditingAbout(false);
                setShowAboutEmoji(false);
            } else if (field === 'profile') {
                if (profilePicture) {
                    // Uploading a custom file
                    formData.append("media", profilePicture);
                } else if (selectedAvatar) {
                    // Using an avatar URL - you might need to adjust this based on your backend
                    formData.append("profilePicture", selectedAvatar);
                    // Alternative: if your backend expects different field name
                    // formData.append("avatarUrl", selectedAvatar);
                }
            }

            const updated = await updateUserProfile(formData);
            setUser(updated?.data);
            
            // Reset states after successful update
            setProfilePicture(null);
            setPreview(null);
            setHasProfileChanges(false);

            toast.success("Profile updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDiscardChanges = () => {
        setProfilePicture(null);
        setPreview(null);
        // Reset to current user profile or default avatar
        if (user?.profilePicture) {
            setSelectedAvatar(null);
        } else {
            setSelectedAvatar(avatars[0]);
        }
        setHasProfileChanges(false);
    };

    const handleEmojiSelect = (emoji, field) => {
        if (field === 'name') {
            setName((prev) => prev + emoji.emoji);
            setShowNameEmoji(false);
        } else {
            setAbout((prev) => prev + emoji.emoji);
            setShowAboutEmoji(false);
        }
    };

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`w-full min-h-screen flex border-r ${theme === 'dark' ? "bg-[rgb(17,27,33)] border-gray-600 text-white" : "bg-gray-100 border-gray-200 text-black"}`}
            >
                <div className="w-full rounded-lg p-6">
                    <div className="flex items-center mb-6">
                        <h1 className="text-2xl font-bold">Profile</h1>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <img
                                    src={getDisplayImage()}
                                    alt="profile picture"
                                    className={`w-52 h-52 rounded-full mb-2 object-cover transition-opacity ${isUpdating ? 'opacity-50' : ''}`}
                                />

                                {/* Loading overlay */}
                                {isUpdating && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <FaSpinner className="h-8 w-8 mx-auto mb-2 animate-spin" />
                                            <span className="text-sm">Updating...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Camera overlay */}
                                {!isUpdating && (
                                    <label htmlFor="profileUpload"
                                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="text-white text-center">
                                            <FaCamera className="h-8 w-8 mx-auto mb-2" />
                                            <span className="text-sm">Change</span>
                                        </div>
                                        <input type="file" id="profileUpload"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Avatar selection button */}
                            <button
                                onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                                disabled={isUpdating}
                                className={`mt-2 px-4 py-2 rounded text-sm ${
                                    theme === 'dark' 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                        : 'bg-gray-200 hover:bg-gray-300 text-black'
                                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Choose Avatar
                            </button>

                            {/* Avatar selection grid */}
                            {showAvatarSelection && (
                                <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                                    <p className="text-sm mb-3 text-center">Select an avatar:</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {avatars.map((avatar, index) => (
                                            <img
                                                key={index}
                                                src={avatar}
                                                alt={`Avatar ${index + 1}`}
                                                className={`w-16 h-16 rounded-full cursor-pointer hover:ring-2 hover:ring-green-500 transition-all ${
                                                    selectedAvatar === avatar ? 'ring-2 ring-green-500' : ''
                                                }`}
                                                onClick={() => handleAvatarSelect(avatar)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save/Discard buttons - show when there are profile changes */}
                        {hasProfileChanges && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    onClick={() => handleSave("profile")}
                                    disabled={isUpdating}
                                    className={`px-4 py-2 rounded flex items-center gap-2 text-white ${isUpdating
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {isUpdating && <FaSpinner className="animate-spin" />}
                                    {isUpdating ? 'Updating...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleDiscardChanges}
                                    disabled={isUpdating}
                                    className={`px-4 py-2 rounded text-white ${isUpdating
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gray-400 hover:bg-gray-500'
                                    }`}
                                >
                                    Discard
                                </button>
                            </div>
                        )}

                        {/* Name update section */}
                        <div className={`relative p-4 ${theme === 'dark' ? "bg-gray-800" : "bg-white"} shadow-sm rounded-lg`}>
                            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-500 text-start">
                                Your Name
                            </label>
                            <div className="flex items-center">
                                {isEditingName ? (
                                    <input 
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? "bg-gray-700 text-white" : "bg-white text-black"}`}
                                    />
                                ) : (
                                    <span className="w-full px-3 py-2 font-bold">{user?.username || name}</span>
                                )}
                                
                                {isEditingName ? (
                                    <>
                                        <button onClick={() => handleSave("name")} className="ml-2 focus:outline-none">
                                            <FaCheck className="h-5 w-5 text-green-500" />
                                        </button>
                                        <button onClick={() => setShowNameEmoji(!showNameEmoji)} className="ml-2 focus:outline-none">
                                            <FaSmile className="h-5 w-5 text-yellow-500" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsEditingName(false);
                                                setShowNameEmoji(false);
                                            }}
                                            className="ml-2 focus:outline-none"
                                        >
                                            <MdCancel className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditingName(true)} className="ml-2 focus:outline-none">
                                        <FaPencilAlt className="h-5 w-5 text-gray-500" />
                                    </button>
                                )}
                            </div>
                            
                            {showNameEmoji && (
                                <div className="absolute z-10 -top-80">
                                    <EmojiPicker onEmojiClick={(emoji) => handleEmojiSelect(emoji, "name")} />
                                </div>
                            )}
                        </div>

                        {/* About update section */}
                        <div className={`relative p-4 ${theme === 'dark' ? "bg-gray-800" : "bg-white"} shadow-sm rounded-lg`}>
                            <label htmlFor="about" className="block text-sm font-medium mb-1 text-gray-500 text-start">
                                About
                            </label>
                            <div className="flex items-center">
                                {isEditingAbout ? (
                                    <input 
                                        type="text"
                                        id="about"
                                        value={about}
                                        onChange={(e) => setAbout(e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? "bg-gray-700 text-white" : "bg-white text-black"}`}
                                    />
                                ) : (
                                    <span className="w-full px-3 py-2 font-bold">{user?.about || about}</span>
                                )}
                                
                                {isEditingAbout ? (
                                    <>
                                        <button onClick={() => handleSave("about")} className="ml-2 focus:outline-none">
                                            <FaCheck className="h-5 w-5 text-green-500" />
                                        </button>
                                        <button onClick={() => setShowAboutEmoji(!showAboutEmoji)} className="ml-2 focus:outline-none">
                                            <FaSmile className="h-5 w-5 text-yellow-500" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsEditingAbout(false);
                                                setShowAboutEmoji(false);
                                            }}
                                            className="ml-2 focus:outline-none"
                                        >
                                            <MdCancel className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditingAbout(true)} className="ml-2 focus:outline-none">
                                        <FaPencilAlt className="h-5 w-5 text-gray-500" />
                                    </button>
                                )}
                            </div>
                            
                            {showAboutEmoji && (
                                <div className="absolute z-10 -top-80">
                                    <EmojiPicker onEmojiClick={(emoji) => handleEmojiSelect(emoji, "about")} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Layout>
    );
};

export default UserDetails;
