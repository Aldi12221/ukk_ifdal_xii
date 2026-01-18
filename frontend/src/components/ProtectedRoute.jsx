// ===========================================
// FILE: ProtectedRoute.jsx
// DESKRIPSI: Komponen untuk proteksi route berdasarkan role
// ===========================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component untuk route yang memerlukan login
function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading, isAuthenticated } = useAuth();

    // Tampilkan loading saat mengecek auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat...</p>
                </div>
            </div>
        );
    }

    // Jika belum login, redirect ke login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Jika ada pembatasan role, cek apakah user punya akses
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_id)) {
        // Redirect ke dashboard sesuai role
        if (user.role_id === 1) {
            return <Navigate to="/admin" replace />;
        } else if (user.role_id === 2) {
            return <Navigate to="/petugas" replace />;
        } else {
            return <Navigate to="/peminjam" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;
