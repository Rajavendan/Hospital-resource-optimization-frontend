import axios from "axios";

// Backend base URL (from Vercel env)
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("❌ VITE_API_URL is not defined in environment variables");
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Debug log (runs once)
console.log("✅ Axios Base URL:", BASE_URL);

// Attach JWT automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized – clearing token");

      // Clear token
      localStorage.removeItem("jwtToken");

      // Optional: redirect to login page
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
