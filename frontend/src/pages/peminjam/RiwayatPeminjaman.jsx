// ===========================================
// FILE: RiwayatPeminjaman.jsx
// DESKRIPSI: Halaman riwayat peminjaman untuk Peminjam
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getMyPeminjaman, requestReturnPeminjaman } from '../../services/api';

function RiwayatPeminjaman() {
    const [peminjaman, setPeminjaman] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeminjaman();
    }, []);

    const fetchPeminjaman = async () => {
        try {
            const response = await getMyPeminjaman();
            setPeminjaman(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (id) => {
        if (window.confirm('Apakah Anda ingin mengajukan pengembalian untuk alat ini?')) {
            try {
                await requestReturnPeminjaman(id);
                alert('Pengajuan pengembalian berhasil! Silakan serahkan alat ke petugas.');
                fetchPeminjaman(); // Refresh data
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal mengajukan pengembalian');
            }
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: { text: 'Menunggu Persetujuan', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            disetujui: { text: 'Disetujui', color: 'bg-blue-100 text-blue-800', icon: '✅' },
            ditolak: { text: 'Ditolak', color: 'bg-red-100 text-red-800', icon: '❌' },
            menunggu_pengembalian: { text: 'Menunggu Pengembalian', color: 'bg-orange-100 text-orange-800', icon: '🔄' },
            dipinjam: { text: 'Sedang Dipinjam', color: 'bg-purple-100 text-purple-800', icon: '📦' },
            dikembalikan: { text: 'Selesai', color: 'bg-green-100 text-green-800', icon: '✔️' }
        };
        return labels[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Riwayat Peminjaman</h1>
                    <p className="text-gray-600">Daftar semua peminjaman anda</p>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : peminjaman.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-10 text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-gray-500">Anda belum memiliki riwayat peminjaman</p>
                        <a href="/peminjam/pinjam" className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Ajukan Peminjaman Pertama
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {peminjaman.map(item => {
                            const status = getStatusLabel(item.status);
                            return (
                                <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                                                {status.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{item.nama_alat}</h3>
                                                <p className="text-sm text-gray-600">Jumlah: {item.jumlah_pinjam} unit</p>
                                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                    <span>📅 Pinjam: {formatDate(item.tanggal_pinjam)}</span>
                                                    <span>📆 Kembali: {formatDate(item.tanggal_harus_kembali)}</span>
                                                </div>
                                                {item.catatan && (
                                                    <p className="mt-2 text-sm text-gray-600">Catatan: {item.catatan}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                                {status.text}
                                            </span>

                                            {/* Tombol Ajukan Pengembalian hanya muncul jika status 'dipinjam' */}
                                            {item.status === 'dipinjam' && (
                                                <button
                                                    onClick={() => handleReturn(item.id)}
                                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                                >
                                                    Ajukan Pengembalian
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RiwayatPeminjaman;
