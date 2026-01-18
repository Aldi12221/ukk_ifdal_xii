// ===========================================
// FILE: PeminjamDashboard.jsx
// DESKRIPSI: Dashboard untuk Peminjam
// ===========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getMyPeminjaman, getAlatTersedia } from '../../services/api';

function PeminjamDashboard() {
    const [peminjaman, setPeminjaman] = useState([]);
    const [alatTersedia, setAlatTersedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [peminjamanRes, alatRes] = await Promise.all([
                getMyPeminjaman(),
                getAlatTersedia()
            ]);
            setPeminjaman(peminjamanRes.data.data || []);
            setAlatTersedia(alatRes.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: { text: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
            dipinjam: { text: 'Dipinjam', color: 'bg-purple-100 text-purple-800' },
            ditolak: { text: 'Ditolak', color: 'bg-red-100 text-red-800' },
            dikembalikan: { text: 'Selesai', color: 'bg-green-100 text-green-800' }
        };
        return labels[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    };

    const activePeminjaman = peminjaman.filter(p => p.status === 'dipinjam' || p.status === 'pending');

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Peminjam</h1>
                    <p className="text-gray-600">Selamat datang di sistem peminjaman alat</p>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                                <p className="text-gray-500 text-sm">Peminjaman Aktif</p>
                                <p className="text-3xl font-bold text-gray-800">{activePeminjaman.length}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                                <p className="text-gray-500 text-sm">Alat Tersedia</p>
                                <p className="text-3xl font-bold text-gray-800">{alatTersedia.length}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                                <p className="text-gray-500 text-sm">Total Peminjaman</p>
                                <p className="text-3xl font-bold text-gray-800">{peminjaman.length}</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/peminjam/alat" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                                    <span className="text-2xl">🔧</span>
                                    <p className="mt-2 font-medium text-gray-700">Lihat Daftar Alat</p>
                                </Link>
                                <Link to="/peminjam/pinjam" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                                    <span className="text-2xl">📝</span>
                                    <p className="mt-2 font-medium text-gray-700">Ajukan Peminjaman</p>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Peminjaman */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4">Peminjaman Terbaru</h2>
                            {peminjaman.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Anda belum memiliki riwayat peminjaman</p>
                            ) : (
                                <div className="space-y-3">
                                    {peminjaman.slice(0, 5).map(item => (
                                        <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{item.nama_alat}</p>
                                                <p className="text-sm text-gray-500">{item.jumlah_pinjam} unit</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusLabel(item.status).color}`}>
                                                {getStatusLabel(item.status).text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {peminjaman.length > 5 && (
                                <Link to="/peminjam/riwayat" className="block text-center mt-4 text-blue-500 hover:underline">
                                    Lihat semua riwayat →
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PeminjamDashboard;
