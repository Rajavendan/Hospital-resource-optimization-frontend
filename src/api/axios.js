import axios from "axios";

baseURL: "https://hospital-resource-optimization-backend.onrender.com",
});

console.log('✅ Axios Configured with Base URL:', "https://hospital-resource-optimization-backend.onrender.com");
headers: {
  "Content-Type": "application/json",
  },
});

// Attach JWT automatically
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

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – redirect to login");
      localStorage.removeItem("jwtToken");
    }
    return Promise.reject(error);
  }
);

export default api;
