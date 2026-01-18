// ===========================================
// FILE: CetakLaporan.jsx
// DESKRIPSI: Halaman cetak laporan untuk Petugas
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getPeminjaman, getPengembalian } from '../../services/api';

function CetakLaporan() {
    const [peminjaman, setPeminjaman] = useState([]);
    const [pengembalian, setPengembalian] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('peminjaman');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [peminjamanRes, pengembalianRes] = await Promise.all([
                getPeminjaman(),
                getPengembalian()
            ]);
            setPeminjaman(peminjamanRes.data.data || []);
            setPengembalian(pengembalianRes.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    };

    const currentData = reportType === 'peminjaman' ? peminjaman : pengembalian;

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen print:ml-0 print:p-0">
                <div className="mb-6 print:hidden">
                    <h1 className="text-2xl font-bold text-gray-800">Cetak Laporan</h1>
                    <p className="text-gray-600">Generate laporan peminjaman dan pengembalian</p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 print:hidden">
                    <div className="flex gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium mb-1">Jenis Laporan</label>
                            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="px-4 py-2 border rounded-lg">
                                <option value="peminjaman">Laporan Peminjaman</option>
                                <option value="pengembalian">Laporan Pengembalian</option>
                            </select>
                        </div>
                        <button onClick={handlePrint} className="mt-5 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
                            🖨️ Cetak
                        </button>
                    </div>
                </div>

                {/* Report Preview */}
                <div className="bg-white rounded-xl shadow-md p-8 print:shadow-none print:rounded-none">
                    {/* Header for Print */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold">LAPORAN {reportType.toUpperCase()}</h2>
                        <p className="text-gray-600">Sistem Peminjaman Alat</p>
                        <p className="text-sm text-gray-500">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {reportType === 'peminjaman' ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left border">No</th>
                                            <th className="px-3 py-2 text-left border">Peminjam</th>
                                            <th className="px-3 py-2 text-left border">Alat</th>
                                            <th className="px-3 py-2 text-left border">Tgl Pinjam</th>
                                            <th className="px-3 py-2 text-left border">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {peminjaman.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="px-3 py-2 border">{index + 1}</td>
                                                <td className="px-3 py-2 border">{item.nama_peminjam}</td>
                                                <td className="px-3 py-2 border">{item.nama_alat}</td>
                                                <td className="px-3 py-2 border">{formatDate(item.tanggal_pinjam)}</td>
                                                <td className="px-3 py-2 border">{item.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left border">No</th>
                                            <th className="px-3 py-2 text-left border">Peminjam</th>
                                            <th className="px-3 py-2 text-left border">Alat</th>
                                            <th className="px-3 py-2 text-left border">Tgl Kembali</th>
                                            <th className="px-3 py-2 text-left border">Denda</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pengembalian.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="px-3 py-2 border">{index + 1}</td>
                                                <td className="px-3 py-2 border">{item.nama_peminjam}</td>
                                                <td className="px-3 py-2 border">{item.nama_alat}</td>
                                                <td className="px-3 py-2 border">{formatDate(item.tanggal_kembali)}</td>
                                                <td className="px-3 py-2 border">{formatCurrency(item.denda)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-right">
                        <p className="text-sm text-gray-600">Total Data: {currentData.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CetakLaporan;
