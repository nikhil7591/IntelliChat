import axiosInstance from "./url.service";

// Send OTP to email (email only)
export const sendOtp = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/send-otp", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Verify OTP from email (email only)
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateUserProfile = async (formData) => {
  try {
    const response = await axiosInstance.put("/auth/update-profile", formData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const checkUserAuth = async () => {
  try {
    const response = await axiosInstance.get("/auth/check-auth");
    if (response.data.status === "success") {
      return { isAuthenticated: true, user: response?.data?.data };
    } else if (response.data.status === "error") {
      return { isAuthenticated: true };
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/auth/users");
    return response.data;
    
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};




