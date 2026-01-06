import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('jwtToken');

        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse saved user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('jwtToken');
            }
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('jwtToken');
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });

            const { accessToken, role, name, id } = response.data;

            if (!accessToken || !role) {
                throw new Error('Invalid login response');
            }

            const userData = {
                id,
                name: name || username,
                role,             
                username
            };

            localStorage.setItem('jwtToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return true;
        } catch (error) {
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

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
