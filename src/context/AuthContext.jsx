import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore authentication state from localStorage on app load
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('jwtToken');

        if (savedUser && token) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
            } catch (error) {
                console.error('Failed to parse saved user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('jwtToken');
            }
        } else {
            // Clear any partial data if token or user is missing
            if (savedUser && !token) {
                localStorage.removeItem('user');
            }
            if (token && !savedUser) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Make login request (no token needed for auth endpoints)
            const response = await api.post('/auth/login', { username, password });

            // Extract token and user data from response
            const { accessToken, tokenType, role, name, id } = response.data;

            // Validate that we received a token
            if (!accessToken) {
                throw new Error('No access token received from server');
            }

            // Normalize role: Remove ROLE_ prefix and convert to lowercase for frontend consistency
            let normalizedRole = role || 'patient';
            if (normalizedRole) {
                normalizedRole = normalizedRole.replace(/^ROLE_/i, '').toLowerCase();
            }

            // Create user data object (without storing token in user object to avoid duplication)
            const userData = {
                id: id,
                name: name || username,
                role: normalizedRole,
                username: username
            };

            // CRITICAL: Store token in localStorage FIRST before state update
            localStorage.setItem('jwtToken', accessToken);

            // Then store user data
            localStorage.setItem('user', JSON.stringify(userData));

            // Finally update state
            setUser(userData);

            // Verify token was stored
            const storedToken = localStorage.getItem('jwtToken');
            if (!storedToken) {
                throw new Error('Failed to store token in localStorage');
            }

            return true;
        } catch (error) {
            console.error("Login failed:", error);
            // Clear any partial data on error
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('user');
            setUser(null);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    // Check if user is authenticated (based on state, localStorage check is done in useEffect)
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
