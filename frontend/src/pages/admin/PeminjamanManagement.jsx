// ===========================================
// FILE: PeminjamanManagement.jsx
// DESKRIPSI: Halaman kelola peminjaman untuk Admin
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getPeminjaman, deletePeminjaman } from '../../services/api';

function PeminjamanManagement() {
    const [peminjamanList, setPeminjamanList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeminjaman();
    }, []);

    const fetchPeminjaman = async () => {
        try {
            const response = await getPeminjaman();
            setPeminjamanList(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus data peminjaman ini?')) {
            try {
                await deletePeminjaman(id);
                alert('Peminjaman berhasil dihapus');
                fetchPeminjaman();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menghapus');
            }
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            disetujui: { text: 'Disetujui', color: 'bg-blue-100 text-blue-800' },
            ditolak: { text: 'Ditolak', color: 'bg-red-100 text-red-800' },
            dipinjam: { text: 'Dipinjam', color: 'bg-purple-100 text-purple-800' },
            dikembalikan: { text: 'Dikembalikan', color: 'bg-green-100 text-green-800' }
        };
        return labels[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Data Peminjaman</h1>
                    <p className="text-gray-600">Daftar semua peminjaman alat</p>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Pinjam</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {peminjamanList.length === 0 ? (
                                        <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                                    ) : (
                                        peminjamanList.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{item.nama_peminjam}</td>
                                                <td className="px-4 py-3 text-sm">{item.nama_alat}</td>
                                                <td className="px-4 py-3 text-sm">{item.jumlah_pinjam}</td>
                                                <td className="px-4 py-3 text-sm">{formatDate(item.tanggal_pinjam)}</td>
                                                <td className="px-4 py-3 text-sm">{formatDate(item.tanggal_harus_kembali)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(item.status).color}`}>
                                                        {getStatusLabel(item.status).text}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PeminjamanManagement;
