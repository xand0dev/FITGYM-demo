// src/context/AuthContext.jsx

import { createContext, useState, useEffect, useContext } from 'react';
import { authRequest, getToken } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Перевірка токена при запуску
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = getToken();
        
        if (token) {
            try {
                // Отримуємо універсальний профіль (Клієнт, Тренер або Адмін)
                const profile = await authRequest('/api/me/');
                setUser(profile);
            } catch (e) {
                console.error("Auth Failed", e);
                localStorage.removeItem('fp_token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = (token, username) => {
        localStorage.setItem('fp_token', JSON.stringify(token));
        localStorage.setItem('fp_user_name', JSON.stringify(username));
        checkAuth(); // Оновлюємо дані користувача після логіну
    };

    const logout = () => {
        localStorage.removeItem('fp_token');
        localStorage.removeItem('fp_user_name');
        localStorage.removeItem('fp_is_staff');
        setUser(null);
        window.location.href = '/'; // Жорсткий редірект на головну
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);