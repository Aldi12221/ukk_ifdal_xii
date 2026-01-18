// ===========================================
// FILE: PetugasDashboard.jsx
// DESKRIPSI: Dashboard utama untuk Petugas
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getPeminjamanPending, getPeminjamanActive, getReturnRequests, approvePeminjaman, rejectPeminjaman, createPengembalian } from '../../services/api';

function PetugasDashboard() {
    const [pendingList, setPendingList] = useState([]);
    const [activeList, setActiveList] = useState([]);
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [kondisiAlat, setKondisiAlat] = useState('baik');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pendingRes, activeRes, returnRes] = await Promise.all([
                getPeminjamanPending(),
                getPeminjamanActive(),
                getReturnRequests()
            ]);
            setPendingList(pendingRes.data.data || []);
            setActiveList(activeRes.data.data || []);
            setReturnRequests(returnRes.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Setujui peminjaman ini?')) {
            try {
                await approvePeminjaman(id);
                alert('Peminjaman disetujui');
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menyetujui');
            }
        }
    };

    const handleReject = async () => {
        try {
            await rejectPeminjaman(selectedItem.id, catatan);
            alert('Peminjaman ditolak');
            setShowRejectModal(false);
            setCatatan('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menolak');
        }
    };

    const handleReturn = async () => {
        try {
            const response = await createPengembalian({
                id_peminjaman: selectedItem.id,
                kondisi_alat: kondisiAlat,
                catatan: catatan
            });

            const data = response.data.data;
            let message = 'Pengembalian berhasil diproses!';
            if (data.denda > 0) {
                message += `\n\nTerlambat: ${data.terlambat_hari} hari\nDenda: ${data.denda_formatted}`;
            }
            alert(message);

            setShowReturnModal(false);
            setCatatan('');
            setKondisiAlat('baik');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal memproses');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Petugas</h1>
                    <p className="text-gray-600">Kelola peminjaman dan pengembalian</p>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Pending Approval */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className="text-yellow-500">⏳</span> Menunggu Persetujuan ({pendingList.length})
                            </h2>
                            {pendingList.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Tidak ada peminjaman pending</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingList.map(item => (
                                        <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{item.nama_peminjam}</p>
                                                <p className="text-sm text-gray-600">Alat: {item.nama_alat} ({item.jumlah_pinjam} unit)</p>
                                                <p className="text-sm text-gray-500">Sampai: {formatDate(item.tanggal_harus_kembali)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove(item.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">Setujui</button>
                                                <button onClick={() => { setSelectedItem(item); setShowRejectModal(true); }} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Tolak</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Return Requests */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className="text-orange-500">🔄</span> Pengajuan Pengembalian ({returnRequests.length})
                            </h2>
                            {returnRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Tidak ada pengajuan pengembalian</p>
                            ) : (
                                <div className="space-y-3">
                                    {returnRequests.map(item => (
                                        <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center bg-orange-50">
                                            <div>
                                                <p className="font-medium">{item.nama_peminjam}</p>
                                                <p className="text-sm text-gray-600">Alat: {item.nama_alat} ({item.jumlah_pinjam} unit)</p>
                                                <p className="text-sm text-gray-500">Batas Kembali: {formatDate(item.tanggal_harus_kembali)}</p>
                                            </div>
                                            <button onClick={() => { setSelectedItem(item); setShowReturnModal(true); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">Proses</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active Loans */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className="text-purple-500">📦</span> Sedang Dipinjam ({activeList.length})
                            </h2>
                            {activeList.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Tidak ada peminjaman aktif</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeList.map(item => (
                                        <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{item.nama_peminjam}</p>
                                                <p className="text-sm text-gray-600">Alat: {item.nama_alat}</p>
                                                <p className="text-sm text-gray-500">Harus kembali: {formatDate(item.tanggal_harus_kembali)}</p>
                                            </div>
                                            <button onClick={() => { setSelectedItem(item); setShowReturnModal(true); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">Proses Pengembalian</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Tolak Peminjaman</h2>
                            <p className="text-gray-600 mb-4">Berikan alasan penolakan:</p>
                            <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows="3" className="w-full px-3 py-2 border rounded-lg mb-4" placeholder="Alasan penolakan..." />
                            <div className="flex gap-3">
                                <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Batal</button>
                                <button onClick={handleReject} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">Tolak</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Return Modal */}
                {showReturnModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Proses Pengembalian</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Kondisi Alat</label>
                                <select value={kondisiAlat} onChange={(e) => setKondisiAlat(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                                    <option value="baik">Baik</option>
                                    <option value="rusak_ringan">Rusak Ringan</option>
                                    <option value="rusak_berat">Rusak Berat</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Catatan (opsional)</label>
                                <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows="2" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowReturnModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Batal</button>
                                <button onClick={handleReturn} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">Proses</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PetugasDashboard;
