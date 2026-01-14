import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load data from localStorage on initial app load (Hydration)
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');

        if (storedToken && storedRole) {
            setToken(storedToken);
            setUser({ role: storedRole });
        }
        setLoading(false);
    }, []);

    // Login function
    const login = (newToken, role) => {
        setToken(newToken);
        setUser({ role });
        
        // Persist to browser storage
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
    };

    // Logout function
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };

    // Helper booleans for easy role checking in UI
    const isAdmin = user?.role === 'admin';
    const isFaculty = user?.role === 'faculty';
    const isCR = user?.role === 'cr';

    const value = {
        user,
        token,
        login,
        logout,
        isAdmin,
        isFaculty,
        isCR,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 3. Create a custom hook for easy access
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};