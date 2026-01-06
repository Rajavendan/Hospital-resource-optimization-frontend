import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // Skip token attachment for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

        if (!isAuthEndpoint) {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Token attached to request:', config.url);
            } else {
                console.warn('No token found for request:', config.url);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);


// Response Interceptor: Handle 401 safely
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/auth/');
            const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

            // Log the failing endpoint to aid debugging
            console.error('401 from:', url);

            // Only force logout for auth endpoints (e.g., login/refresh). Other 401s
            // should be handled by the calling code so we do not kick out valid users.

            // STRICTER CHECK: Only logout if we are absolutely sure the token is invalid/expired
            // Usually this comes from a global 401 on a protected route,
            // BUT incorrectly hitting a non-existent route might trigger 401 in some configs.
            // Safe approach: Only auto-logout if the URL is explicitly NOT a known "safe to fail" one
            // or if the backend sends a specific "Token invalid" payload (if we had that standard).

            // For now, disabling auto-logout for random 401s to prevent this bug.
            // User will be redirected only if they try to login again or if it's a critical auth flow.

            if (!isLoginPage && (isAuthEndpoint || error.config?.forceLogoutOn401)) {
                if (!error.config?.skipAuthRedirect) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } else {
                // For normal API calls returning 401 (like accessing wrong resource), rely on UI to show error.
                // Ideally we'd decrypt token to check expiry, but for now, pass error to component.
            }
        }
        return Promise.reject(error);
    }
);

export default api;
