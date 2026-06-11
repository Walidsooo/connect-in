import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifier si un utilisateur est déjà connecté au chargement
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token'); //  Cohérent avec l'intercepteur
            if (token) {
                try {
                    // On demande au back de Walid qui est l'utilisateur actuel
                    const response = await api.get('/user');
                    setUser(response.data);
                } catch (err) {
                    localStorage.removeItem('auth_token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const logout = () => {
        localStorage.removeItem('auth_token'); //  Cohérent
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, authenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Le hook personnalisé pour utiliser l'auth partout
export const useAuth = () => useContext(AuthContext);