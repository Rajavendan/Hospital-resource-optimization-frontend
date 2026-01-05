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


// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

            if (!isLoginPage) {
                // If we get a 401, the token is likely invalid or expired.
                // We should log the user out to prevent them from being stuck in a broken state.
                // We can optionally check for a specific "skipAuthRedirect" config if valid use cases exist.
                if (!error.config?.skipAuthRedirect) {
                    console.error('401 Unauthorized - Request URL:', error.config?.url);
                    console.error('401 Unauthorized - Response:', error.response?.data);
                    console.error('401 Unauthorized - Token present:', !!localStorage.getItem('jwtToken'));
                    console.warn('401 Unauthorized - Token invalid or expired. Logging out.');
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
