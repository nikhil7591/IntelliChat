import axios from 'axios';

const apiUrl = `${process.env.REACT_APP_API_URL}/api`;
console.log("API URL:", apiUrl);

const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials : true,
})

export default axiosInstance;
