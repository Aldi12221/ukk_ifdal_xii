// ===========================================
// FILE: AdminDashboard.jsx
// DESKRIPSI: Dashboard utama untuk Admin
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getUsers, getAlat, getPeminjaman } from '../../services/api';

function AdminDashboard() {
    // State untuk statistik
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAlat: 0,
        totalPeminjaman: 0,
        peminjamanAktif: 0
    });
    const [loading, setLoading] = useState(true);

    // Ambil data statistik saat component mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [usersRes, alatRes, peminjamanRes] = await Promise.all([
                getUsers(),
                getAlat(),
                getPeminjaman()
            ]);

            const peminjaman = peminjamanRes.data.data || [];
            const peminjamanAktif = peminjaman.filter(p => p.status === 'dipinjam').length;

            setStats({
                totalUsers: usersRes.data.data?.length || 0,
                totalAlat: alatRes.data.data?.length || 0,
                totalPeminjaman: peminjaman.length,
                peminjamanAktif
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Card statistik
    const StatCard = ({ title, value, icon, color }) => (
        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
                    <p className="text-gray-600">Selamat datang di panel administrasi</p>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-gray-600">Memuat data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total User"
                            value={stats.totalUsers}
                            icon="👥"
                            color="border-blue-500"
                        />
                        <StatCard
                            title="Total Alat"
                            value={stats.totalAlat}
                            icon="🔧"
                            color="border-green-500"
                        />
                        <StatCard
                            title="Total Peminjaman"
                            value={stats.totalPeminjaman}
                            icon="📋"
                            color="border-yellow-500"
                        />
                        <StatCard
                            title="Peminjaman Aktif"
                            value={stats.peminjamanAktif}
                            icon="📦"
                            color="border-purple-500"
                        />
                    </div>
                )}

                {/* Quick Info */}
                <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Cepat</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a href="/admin/users" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                            <span className="text-2xl">👥</span>
                            <p className="mt-2 text-sm font-medium text-gray-700">Kelola User</p>
                        </a>
                        <a href="/admin/alat" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                            <span className="text-2xl">🔧</span>
                            <p className="mt-2 text-sm font-medium text-gray-700">Kelola Alat</p>
                        </a>
                        <a href="/admin/peminjaman" className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
                            <span className="text-2xl">📋</span>
                            <p className="mt-2 text-sm font-medium text-gray-700">Peminjaman</p>
                        </a>
                        <a href="/admin/log" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                            <span className="text-2xl">📝</span>
                            <p className="mt-2 text-sm font-medium text-gray-700">Log Aktivitas</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
