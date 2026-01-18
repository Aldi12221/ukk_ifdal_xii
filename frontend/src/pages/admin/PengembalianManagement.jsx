// ===========================================
// FILE: PengembalianManagement.jsx
// DESKRIPSI: Halaman kelola pengembalian untuk Admin
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getPengembalian, deletePengembalian } from '../../services/api';

function PengembalianManagement() {
    const [pengembalianList, setPengembalianList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPengembalian();
    }, []);

    const fetchPengembalian = async () => {
        try {
            const response = await getPengembalian();
            setPengembalianList(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus data pengembalian ini?')) {
            try {
                await deletePengembalian(id);
                alert('Pengembalian berhasil dihapus');
                fetchPengembalian();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menghapus');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Data Pengembalian</h1>
                    <p className="text-gray-600">Daftar semua pengembalian alat</p>
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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kondisi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terlambat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denda</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pengembalianList.length === 0 ? (
                                        <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                                    ) : (
                                        pengembalianList.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{item.nama_peminjam}</td>
                                                <td className="px-4 py-3 text-sm">{item.nama_alat}</td>
                                                <td className="px-4 py-3 text-sm">{formatDate(item.tanggal_kembali)}</td>
                                                <td className="px-4 py-3 text-sm">{item.kondisi_alat}</td>
                                                <td className="px-4 py-3 text-sm">{item.terlambat_hari} hari</td>
                                                <td className="px-4 py-3 text-sm font-medium text-red-600">{formatCurrency(item.denda)}</td>
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

export default PengembalianManagement;
