import React, { useState, useEffect } from "react";
import useLoginStore from "../../store/useLoginStore";
import countries from "../../utils/countriles";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import useUserStore from "../../store/useUserStore";
import { set, useForm } from "react-hook-form";
import useThemeStore from "../../store/themeStore";
import { data, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaWhatsapp, FaChevronDown, FaEye, FaEyeSlash, FaUser, FaArrowLeft, FaPlus } from 'react-icons/fa';
import Flag from "../../components/Flag";
import { sendOtp, verifyOtp, updateUserProfile } from "../../services/user.service";
import Spinner from "../../utils/Spinner";
import { toast } from "react-toastify";

// validationschema 
const loginValidationSchema = yup.object().shape({
    phoneNumber: yup.string().nullable().notRequired().matches(/^\d+$/, "Phone number must be digits").transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
    ),
    email: yup.string().nullable().notRequired().email("Please enter valid email").transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
    )
}).test(
    "at-least-one",
    "Either email or phone number is required",
    function (value) {
        return !!(value.phoneNumber || value.email)
    }
);

const otpValidationSchema = yup.object().shape({
    otp: yup.string().length(6, "OTP must be exactly 6 digits").required("OTP is required")
});

const profileValidationSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    agreed: yup.bool().oneOf([true], "You must agree to the terms")
});

const avatars = [
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]

const Login = () => {
    const { step, setStep, setUserPhoneData, userPhoneData, resetLoginState } = useLoginStore();
    console.log(step);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [email, setEmail] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useUserStore();
    const { theme, setTheme } = useThemeStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


    const {
        register: loginRegister,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors }
    } = useForm({
        resolver: yupResolver(loginValidationSchema)
    })

    const {
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors },
        setValue: setOtpValue,
        register: otpRegister
    } = useForm({
        resolver: yupResolver(otpValidationSchema),
        defaultValues: {
            otp: ""
        }
    })

    const {
        register: profileRegister,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        watch
    } = useForm({
        resolver: yupResolver(profileValidationSchema)
    })

    const filterCountries = countries.filter(
        (country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.dialCode.includes(searchTerm)
    )

    // onLoginsubmit handlers
    const onLoginSubmit = async () => {
        try {
            setLoading(true);
            if (email) {
                const response = await sendOtp(null, null, email);
                if (response.status === "success") {
                    toast.info("OTP sent to your email");
                    setUserPhoneData({ email });
                    setStep(2);

                }
            } else {
                const response = await sendOtp(phoneNumber, selectedCountry.dialCode, null);
                if (response.status === "success") {
                    toast.info("OTP sent to your phone number");
                    setUserPhoneData({ phoneNumber, phoneSuffix: selectedCountry.dialCode });
                    setStep(2);
                }
            }
        } catch (error) {
            console.log(error);
            setError(error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    }

    // onOtpSubmit handlers
    const onOtpSubmit = async (data) => {
        try {
            setLoading(true);
            if (!userPhoneData) {
                throw new Error("Phone or email data is missing");
            };
            const otpString = otp.join("");
            console.log('Submitting OTP:', {
                phoneNumber: userPhoneData.phoneNumber,
                phoneSuffix: userPhoneData.phoneSuffix,
                otp: otpString,
                email: userPhoneData.email
            });
            let response;
            if (userPhoneData?.email) {
                response = await verifyOtp(null, null, otpString, userPhoneData.email);
            } else {
                response = await verifyOtp(userPhoneData.phoneNumber, userPhoneData.phoneSuffix, otpString, null);
            }
            if (response.status === "success") {
                toast.success("OTP verified successfully");
                const user = response.data;
                if (user?.username && user?.profilePicture) {
                    setUser(user);
                    toast.success("Welcome back to WhatsApp");
                    navigate("/");
                    resetLoginState();
                } else {
                    setStep(3);
                }
            }
        } catch (error) {
            console.log(error);
            setError(error.message || "Failed to Verify OTP");
        } finally {
            setLoading(false);
        }
    }

    // handleChange
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setProfilePicture(URL.createObjectURL(file));
        }
    }

    // onProfileSubmit handlers
    const onProfileSubmit = async (data) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("username", data.username);
            formData.append("agreed", data.agreed);
            if (profilePictureFile) {
                formData.append("media", profilePictureFile);
            } else {
                formData.append("profilePicture", selectedAvatar);
            }
            await updateUserProfile(formData);
            toast.success("Welcome back to WhatsApp");

            navigate("/");
            resetLoginState();
        } catch (error) {
            console.log(error);
            setError(error.message || "Failed to update userProfile");
        } finally {
            setLoading(false);
        }
    }

    // otp handlechange
    const handleOtpChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpValue("otp", newOtp.join(""));
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    }

    // Progress bar 
    const ProgressBar = () => (
        <div className={`w-full ${theme === 'dark' ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2.5 mb-6`}>
            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(step / 3) * 100}%` }}
            >
            </div>
        </div>
    )

    // handle Back btton
    const handleBack = () => {
        setStep(1);
        setUserPhoneData(null);
        setOtp(["", "", "", "", "", ""]);
        setError("");
    }

    // handle country select
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setShowDropdown(false);
        setSearchTerm("");
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? "bg-gray-900" : "bg-gradient-to-br from-green-400 to-blue-500 "} flex items-center justify-center p-4 overflow-hidden`}>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`${theme === 'dark' ? "bg-gray-800 text-white" : "bg-white"} p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10`}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                >
                    <FaWhatsapp className="w-16 h-16 text-white" />
                </motion.div>
                <h1 className={`text-3xl font-bold text-center mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    WhatsApp Login
                </h1>

                <ProgressBar />
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {step === 1 && (
                    <form className="space-y-4" onSubmit={handleLoginSubmit(onLoginSubmit)}>
                        <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}>
                            Enter your phone number to receive an OTP
                        </p>

                        <div className="relative">
                            <div className="flex">
                                <div className="relative w-1/3">
                                    <button
                                        type="button"
                                        className={`flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center ${theme === 'dark' ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300"} border rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100`}
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    >
                                        <Flag countryCode={selectedCountry.alpha2} size="1.2em" className="mr-2" />
                                        <span>{selectedCountry.dialCode}</span>
                                        <FaChevronDown className="ml-2" />
                                    </button>
                                    {showDropdown && (
                                        <div
                                            className={`absolute z-10 w-full mt-1 ${theme === 'dark' ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}
                                            border rounded-md shadow-lg max-h-60 overflow-auto`}
                                        >
                                            <div
                                                className={`sticky top-0 ${theme === 'dark' ? "bg-gray-700" : "bg-white"} p-2`}
                                            >
                                                <input type="text"
                                                    placeholder="Search countries..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}

                                                    className={`w-full px-2 py-1 border ${theme === 'dark' ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                />
                                            </div>
                                            {filterCountries.map((country, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleCountrySelect(country)}
                                                    className={`w-full text-left px-3 py-2  ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}
                                                    focus:outline-none focus:bg-gray-100  `}
                                                >
                                                    <Flag countryCode={country.alpha2} size="1.2em" className="mr-2" />
                                                    <span className="text-sm">{country.name} ({country.dialCode})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input type="text"
                                    placeholder="Enter phone number"
                                    {...loginRegister("phoneNumber")}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className={`w-2/3 px-4 py-2 border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${loginErrors.phoneNumber ? "border-red-500" : ""}`}
                                />
                            </div>
                            {loginErrors.phoneNumber && (
                                <p className="text-red-500 text-sm">{loginErrors.phoneNumber.message}</p>
                            )}

                        </div>

                        {/* diveder with or */}
                        <div className="flex items-center my-4">
                            <div className="flex-grow h-px bg-gray-300" />
                            <span className="mx-3 text-gray-500 text-sm font-medium">or</span>
                            <div className="flex-grow h-px bg-gray-300" />
                        </div>
                        {/* Email input box */}
                        <div className={`flex items-center border rounded-md px-3 py-2 ${theme === 'dark' ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
                            <FaUser className={`mr-2 text-gray-400 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`} />
                            <input type="email"
                                placeholder="Email (optional)"
                                {...loginRegister("email")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-transparent focus:outline-none ${theme === 'dark' ? " text-white placeholder-gray-400" : "text-black placeholder-gray-500"}  ${loginErrors.email ? "border-red-500" : ""}`}
                            />
                            {loginErrors.email && (
                                <p className="text-red-500 text-sm">{loginErrors.email.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition mt-3"
                        >
                            {loading ? <Spinner /> : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* Step 2 for verify otp */}
                {step === 2 && (
                    <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
                        <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}>
                            Please enter the 6-digit OTP send to your {userPhoneData ? userPhoneData.phoneSuffix : "Email"} {" "} {userPhoneData.phoneNumber && userPhoneData?.phoneNumber}
                        </p>
                        <div className="flex justify-between">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    className={`w-12 h-12 text-center  border  ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}
                                        rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
                                     ${otpErrors.otp ? "border-red-500" : ""}`}
                                />
                            ))}

                        </div>
                        {otpErrors.otp && (
                            <p className="text-red-500 text-sm">{otpErrors.otp.message}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition mt-3"
                        >
                            {loading ? <Spinner /> : "Verify OTP"}
                        </button>
                        <button
                            type="button"
                            onClick={handleBack}
                            className={`w-full mt-2 ${theme === 'dark' ? "bg-gray-700 text-gray-300 placeholder-gray-400" : "bg-gray-200 border-gray-300 text-gray-900 placeholder-gray-500"} py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center`}
                        >
                            <FaArrowLeft className="mr-2" />
                            Wrong number? Go back
                        </button>
                    </form>
                )}

                {/* Step 3 for update the profile */}
                {step === 3 && (
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)}
                        className="space-y-4"
                    >
                        <div className="flex flex-col items-center mb-4">
                            <div className="relative w-24 h-24 mb-2">
                                <img src={profilePicture || selectedAvatar} alt="profile"
                                    className="w-full h-full rounded-full object-cover border-2 border-green-500"
                                />
                                <label
                                    htmlFor="profile-picture"
                                    className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 cursor-pointer hover:bg-green-600 transition duration-300"
                                >
                                    <FaPlus className="w-4 h-4" />
                                </label>
                                <input type="file" id="profile-picture"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                            </div>

                            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-2`}>
                                Choose an Avatar
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {avatars.map((avatar, index) => (
                                    <img
                                        key={index}
                                        src={avatar}
                                        alt={`Avatar ${index + 1}`}
                                        className={`w-12 h-12 rounded-full cursor-pointer transition duration-300 ease-in-out transform hover:scale-110 border-2 ${selectedAvatar === avatar ? " ring-2 ring-green-500" : ""}`}

                                        onClick={() => setSelectedAvatar(avatar)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`} />

                            <input
                                type="text"
                                {...profileRegister("username")}
                                placeholder="Username"
                                className={`w-full pl-10 pr-3 py-2 border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-green-500 `}
                            />
                            {profileErrors.username && (
                                <p className="text-red-500 text-sm mt-1">{profileErrors.username.message}</p>
                            )}

                        </div>

                        <div className="flex items-center space-x-2">

                            <input type="checkbox"
                                {...profileRegister('agreed')}
                                className={`rounded ${theme === 'dark' ? "text-green-500 bg-gray-700" : "text-green-500"}focus:ring-2 focus:ring-green-500`}
                            />
                            <label htmlFor="terms" className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                I agree to the <a href="#" className="text-green-500 hover:underline">Terms of Conditions</a> and <a href="#" className="text-green-500 hover:underline">Privacy Policy</a>.
                            </label>
                            {profileErrors.agreed && (
                                <p className="text-red-500 text-sm mt-1">{profileErrors.agreed.message}</p>
                            )}


                        </div>
                            <button
                                type="submit"
                                disabled={!watch('agreed')|| loading}
                                className={`w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:scale-105 transition duration-300 ease-in-out transform mt-3 flex items-center justify-center text-lg ${loading? "opacity-50 cursor-not-allowed":""}`}
                            >
                                {loading ? <Spinner /> : "Create Profile"}
                            </button>

                    </form>
                )}

            </motion.div>


        </div>
    )
}

export default Login;
