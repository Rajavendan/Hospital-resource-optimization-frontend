import axios from "axios";
import { auth } from "../firebase";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("✅ Axios Base URL:", BASE_URL);

// Attach Firebase ID token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken(true); // 🔥 force refresh
    console.log("Adding token to header:", token.substring(0, 10) + "...");
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("⚠️ Unauthorized API response");
    }
    return Promise.reject(err);
  }
);

export default api;
