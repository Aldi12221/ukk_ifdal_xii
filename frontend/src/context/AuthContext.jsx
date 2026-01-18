// ===========================================
// FILE: AuthContext.jsx
// DESKRIPSI: Context untuk mengelola autentikasi
// ===========================================

import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, getProfile } from '../services/api';

// Buat context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
    // State untuk menyimpan data user dan loading
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cek apakah sudah login saat pertama load
    useEffect(() => {
        checkAuth();
    }, []);

    // Fungsi untuk cek autentikasi
    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi login
    const login = async (email, password) => {
        try {
            const response = await loginApi(email, password);

            if (response.data.success) {
                const { token, data } = response.data;

                // Simpan ke localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(data));

                // Update state
                setUser(data);

                return { success: true, user: data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Terjadi kesalahan saat login';
            return { success: false, message };
        }
    };

    // Fungsi logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Fungsi untuk cek role
    const isAdmin = () => user?.role_id === 1;
    const isPetugas = () => user?.role_id === 2;
    const isPeminjam = () => user?.role_id === 3;

    // Value yang disediakan ke component lain
    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin,
        isPetugas,
        isPeminjam,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook untuk menggunakan auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
}
