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
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);
 

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if this request should skip auth redirect (for graceful error handling)
            const skipAuthRedirect = error.config?.skipAuthRedirect;

            // Check if this is a data fetching endpoint (not auth endpoint)
            const requestUrl = error.config?.url || '';
            const isDataEndpoint = requestUrl.includes('/appointments') ||
                requestUrl.includes('/doctors') ||
                requestUrl.includes('/patients') ||
                requestUrl.includes('/resources/');
               

            // Only redirect if not already on login page, not skipping redirect, and not a data endpoint
            const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

            //
            if (isDataEndpoint || skipAuthRedirect) {
                console.warn(`401 Unauthorized for data endpoint: ${requestUrl}. Error handled gracefully.`);
            } else if (!isLoginPage) {
                // Only logout and redirect for non-data endpoints and not on login page
                console.error('401 Unauthorized - logging out usedr');
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
