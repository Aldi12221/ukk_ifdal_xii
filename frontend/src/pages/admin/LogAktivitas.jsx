// ===========================================
// FILE: LogAktivitas.jsx
// DESKRIPSI: Halaman log aktivitas untuk Admin
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getLogAktivitas } from '../../services/api';

function LogAktivitas() {
    const [logList, setLogList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLog();
    }, []);

    const fetchLog = async () => {
        try {
            const response = await getLogAktivitas();
            setLogList(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getAksiColor = (aksi) => {
        switch (aksi) {
            case 'CREATE': return 'bg-green-100 text-green-800';
            case 'UPDATE': return 'bg-blue-100 text-blue-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            case 'LOGIN': return 'bg-purple-100 text-purple-800';
            case 'APPROVE': return 'bg-cyan-100 text-cyan-800';
            case 'REJECT': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas</h1>
                    <p className="text-gray-600">Riwayat aktivitas sistem (100 terakhir)</p>
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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabel</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {logList.length === 0 ? (
                                        <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Tidak ada log</td></tr>
                                    ) : (
                                        logList.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(item.created_at)}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{item.nama_user || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAksiColor(item.aksi)}`}>
                                                        {item.aksi}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.tabel_terkait || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.keterangan || '-'}</td>
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

export default LogAktivitas;
