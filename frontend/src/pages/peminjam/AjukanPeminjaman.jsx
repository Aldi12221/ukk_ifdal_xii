// ===========================================
// FILE: AjukanPeminjaman.jsx
// DESKRIPSI: Form pengajuan peminjaman
// ===========================================

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getAlatTersedia, createPeminjaman } from '../../services/api';

function AjukanPeminjaman() {
    const [alatList, setAlatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id_alat: searchParams.get('alat') || '',
        jumlah_pinjam: 1,
        tanggal_harus_kembali: '',
        catatan: ''
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await createPeminjaman({
                id_alat: parseInt(formData.id_alat),
                jumlah_pinjam: parseInt(formData.jumlah_pinjam),
                tanggal_harus_kembali: formData.tanggal_harus_kembali,
                catatan: formData.catatan
            });

            alert('Peminjaman berhasil diajukan! Silakan tunggu persetujuan petugas.');
            navigate('/peminjam/riwayat');
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengajukan peminjaman');
        } finally {
            setSubmitting(false);
        }
    };

    // Get min date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const selectedAlat = alatList.find(a => a.id === parseInt(formData.id_alat));

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Ajukan Peminjaman</h1>
                    <p className="text-gray-600">Isi form untuk meminjam alat</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : alatList.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Tidak ada alat yang tersedia saat ini
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Pilih Alat */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Alat *</label>
                                <select
                                    name="id_alat"
                                    value={formData.id_alat}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- Pilih Alat --</option>
                                    {alatList.map(alat => (
                                        <option key={alat.id} value={alat.id}>
                                            {alat.nama_alat} (Tersedia: {alat.jumlah_tersedia})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Info Alat */}
                            {selectedAlat && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="font-medium">{selectedAlat.nama_alat}</p>
                                    <p className="text-sm text-gray-600">Kategori: {selectedAlat.nama_kategori || '-'}</p>
                                    <p className="text-sm text-gray-600">Tersedia: {selectedAlat.jumlah_tersedia} unit</p>
                                </div>
                            )}

                            {/* Jumlah */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pinjam *</label>
                                <input
                                    type="number"
                                    name="jumlah_pinjam"
                                    value={formData.jumlah_pinjam}
                                    onChange={handleChange}
                                    min="1"
                                    max={selectedAlat?.jumlah_tersedia || 1}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Tanggal Kembali */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Harus Kembali *</label>
                                <input
                                    type="date"
                                    name="tanggal_harus_kembali"
                                    value={formData.tanggal_harus_kembali}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (opsional)</label>
                                <textarea
                                    name="catatan"
                                    value={formData.catatan}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Keperluan peminjaman..."
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                    {submitting ? 'Memproses...' : 'Ajukan Peminjaman'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AjukanPeminjaman;
