// ===========================================
// FILE: Sidebar.jsx
// DESKRIPSI: Komponen sidebar untuk navigasi dashboard
// ===========================================

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const location = useLocation();
    const { user, logout, isAdmin, isPetugas, isPeminjam } = useAuth();

    // Fungsi untuk cek apakah link aktif
    const isActive = (path) => location.pathname === path;

    // Style untuk link aktif dan tidak aktif
    const linkClass = (path) => `
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive(path)
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }
    `;

    // Menu untuk Admin
    const adminMenu = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'Kelola User', icon: '👥' },
        { path: '/admin/kategori', label: 'Kategori', icon: '📁' },
        { path: '/admin/alat', label: 'Kelola Alat', icon: '🔧' },
        { path: '/admin/peminjaman', label: 'Peminjaman', icon: '📋' },
        { path: '/admin/pengembalian', label: 'Pengembalian', icon: '↩️' },
        { path: '/admin/log', label: 'Log Aktivitas', icon: '📝' },
    ];

    // Menu untuk Petugas
    const petugasMenu = [
        { path: '/petugas', label: 'Dashboard', icon: '📊' },
        { path: '/petugas/approval', label: 'Approval Peminjaman', icon: '✅' },
        { path: '/petugas/pengembalian', label: 'Proses Pengembalian', icon: '↩️' },
        { path: '/petugas/laporan', label: 'Cetak Laporan', icon: '🖨️' },
    ];

    // Menu untuk Peminjam
    const peminjamMenu = [
        { path: '/peminjam', label: 'Dashboard', icon: '📊' },
        { path: '/peminjam/alat', label: 'Daftar Alat', icon: '🔧' },
        { path: '/peminjam/pinjam', label: 'Ajukan Peminjaman', icon: '📝' },
        { path: '/peminjam/riwayat', label: 'Riwayat Peminjaman', icon: '📋' },
    ];

    // Pilih menu berdasarkan role
    let menu = [];
    let roleLabel = '';

    if (isAdmin()) {
        menu = adminMenu;
        roleLabel = 'Administrator';
    } else if (isPetugas()) {
        menu = petugasMenu;
        roleLabel = 'Petugas';
    } else if (isPeminjam()) {
        menu = peminjamMenu;
        roleLabel = 'Peminjam';
    }

    return (
        <div className="w-64 bg-white h-screen shadow-lg flex flex-col fixed left-0 top-0">
            {/* Header */}
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold text-gray-800">Peminjaman Alat</h1>
                <p className="text-sm text-gray-500 mt-1">{roleLabel}</p>
            </div>

            {/* User Info */}
            <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.nama_lengkap?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{user?.nama_lengkap || user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menu.map((item) => (
                    <Link key={item.path} to={item.path} className={linkClass(item.path)}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
