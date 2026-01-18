// ===========================================
// FILE: KategoriManagement.jsx
// DESKRIPSI: Halaman CRUD kategori untuk Admin
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getKategori, createKategori, updateKategori, deleteKategori } from '../../services/api';

function KategoriManagement() {
    const [kategoriList, setKategoriList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingKategori, setEditingKategori] = useState(null);
    const [formData, setFormData] = useState({
        nama_kategori: '',
        deskripsi: ''
    });

    useEffect(() => {
        fetchKategori();
    }, []);

    const fetchKategori = async () => {
        try {
            const response = await getKategori();
            setKategoriList(response.data.data || []);
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
        try {
            if (editingKategori) {
                await updateKategori(editingKategori.id, formData);
                alert('Kategori berhasil diupdate');
            } else {
                await createKategori(formData);
                alert('Kategori berhasil ditambahkan');
            }
            setShowModal(false);
            resetForm();
            fetchKategori();
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus kategori ini?')) {
            try {
                await deleteKategori(id);
                alert('Kategori berhasil dihapus');
                fetchKategori();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menghapus');
            }
        }
    };

    const handleEdit = (kategori) => {
        setEditingKategori(kategori);
        setFormData({
            nama_kategori: kategori.nama_kategori,
            deskripsi: kategori.deskripsi || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingKategori(null);
        setFormData({ nama_kategori: '', deskripsi: '' });
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Kelola Kategori</h1>
                        <p className="text-gray-600">Manajemen kategori alat</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <span>+</span> Tambah Kategori
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {kategoriList.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data kategori
                                        </td>
                                    </tr>
                                ) : (
                                    kategoriList.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.nama_kategori}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.deskripsi || '-'}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">{editingKategori ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                                    <input
                                        type="text"
                                        name="nama_kategori"
                                        value={formData.nama_kategori}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea
                                        name="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default KategoriManagement;
