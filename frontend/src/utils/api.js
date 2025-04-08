import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method.toUpperCase()} request to: ${config.url}`
    );
    const token = localStorage.getItem("token");
    if (token) {
      console.log(`Found token in localStorage: ${token.substring(0, 10)}...`);
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "Set Authorization header:",
        config.headers.Authorization.substring(0, 15) + "..."
      );
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
