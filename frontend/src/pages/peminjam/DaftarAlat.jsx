// ===========================================
// FILE: DaftarAlat.jsx
// DESKRIPSI: Halaman daftar alat untuk Peminjam
// ===========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getAlatTersedia } from '../../services/api';

function DaftarAlat() {
    const [alatList, setAlatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAlat();
    }, []);

    const fetchAlat = async () => {
        try {
            const response = await getAlatTersedia();
            setAlatList(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAlat = alatList.filter(alat =>
        alat.nama_alat.toLowerCase().includes(search.toLowerCase()) ||
        (alat.nama_kategori && alat.nama_kategori.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Daftar Alat Tersedia</h1>
                        <p className="text-gray-600">Pilih alat yang ingin dipinjam</p>
                    </div>
                    <Link to="/peminjam/pinjam" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        + Ajukan Peminjaman
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari alat..."
                        className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAlat.length === 0 ? (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-500">Tidak ada alat yang tersedia</p>
                            </div>
                        ) : (
                            filteredAlat.map(alat => (
                                <div key={alat.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        {alat.gambar ? (
                                            <img
                                                src={`http://127.0.0.1:8000/storage${alat.gambar}`}
                                                alt={alat.nama_alat}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                                                🔧
                                            </div>
                                        )}
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Tersedia: {alat.jumlah_tersedia}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-1">{alat.nama_alat}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{alat.nama_kategori || 'Tanpa Kategori'}</p>
                                    {alat.deskripsi && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{alat.deskripsi}</p>
                                    )}
                                    <Link to={`/peminjam/pinjam?alat=${alat.id}`} className="block w-full text-center py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                        Pinjam Alat Ini
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DaftarAlat;
