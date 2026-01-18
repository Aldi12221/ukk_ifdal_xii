// ===========================================
// FILE: AlatManagement.jsx
// DESKRIPSI: Halaman CRUD alat untuk Admin dengan upload gambar
// ===========================================

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { getAlat, getKategori, deleteAlat } from '../../services/api';
import axios from 'axios';

// URL untuk gambar
const IMAGE_URL = 'http://localhost:3000/uploads';

function AlatManagement() {
    const [alatList, setAlatList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAlat, setEditingAlat] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        nama_alat: '',
        deskripsi: '',
        jumlah: 0,
        jumlah_tersedia: 0,
        kategori_id: '',
        kondisi: 'baik'
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [alatRes, kategoriRes] = await Promise.all([
                getAlat(),
                getKategori()
            ]);
            setAlatList(alatRes.data.data || []);
            setKategoriList(kategoriRes.data.data || []);
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

    // Handle pemilihan file gambar
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Preview gambar
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit dengan FormData untuk upload file
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Gunakan FormData untuk mengirim file
            const data = new FormData();
            data.append('nama_alat', formData.nama_alat);
            data.append('deskripsi', formData.deskripsi);
            data.append('jumlah', formData.jumlah);
            data.append('jumlah_tersedia', editingAlat ? formData.jumlah_tersedia : formData.jumlah);
            data.append('kategori_id', formData.kategori_id || '');
            data.append('kondisi', formData.kondisi);

            // Jika ada file gambar, tambahkan
            if (selectedFile) {
                data.append('gambar', selectedFile);
            }

            const url = editingAlat
                ? `http://localhost:3000/api/alat/${editingAlat.id}`
                : 'http://localhost:3000/api/alat';

            const method = editingAlat ? 'put' : 'post';

            await axios({
                method,
                url,
                data,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert(editingAlat ? 'Alat berhasil diupdate' : 'Alat berhasil ditambahkan');
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus alat ini?')) {
            try {
                await deleteAlat(id);
                alert('Alat berhasil dihapus');
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menghapus');
            }
        }
    };

    const handleEdit = (alat) => {
        setEditingAlat(alat);
        setFormData({
            nama_alat: alat.nama_alat,
            deskripsi: alat.deskripsi || '',
            jumlah: alat.jumlah,
            jumlah_tersedia: alat.jumlah_tersedia,
            kategori_id: alat.kategori_id || '',
            kondisi: alat.kondisi || 'baik'
        });
        // Set preview jika sudah ada gambar
        if (alat.gambar) {
            setPreviewImage(`${IMAGE_URL}/${alat.gambar}`);
        } else {
            setPreviewImage(null);
        }
        setSelectedFile(null);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingAlat(null);
        setFormData({
            nama_alat: '',
            deskripsi: '',
            jumlah: 0,
            jumlah_tersedia: 0,
            kategori_id: '',
            kondisi: 'baik'
        });
        setSelectedFile(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getKondisiLabel = (kondisi) => {
        switch (kondisi) {
            case 'baik': return { text: 'Baik', color: 'bg-green-100 text-green-800' };
            case 'rusak_ringan': return { text: 'Rusak Ringan', color: 'bg-yellow-100 text-yellow-800' };
            case 'rusak_berat': return { text: 'Rusak Berat', color: 'bg-red-100 text-red-800' };
            default: return { text: kondisi, color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Kelola Alat</h1>
                        <p className="text-gray-600">Manajemen data alat peminjaman</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <span>+</span> Tambah Alat
                    </button>
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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gambar</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Alat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tersedia</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kondisi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {alatList.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Tidak ada data alat</td>
                                        </tr>
                                    ) : (
                                        alatList.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    {item.gambar ? (
                                                        <img
                                                            src={`${IMAGE_URL}/${item.gambar}`}
                                                            alt={item.nama_alat}
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
                                                            🔧
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.nama_alat}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.nama_kategori || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.jumlah}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.jumlah_tersedia}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKondisiLabel(item.kondisi).color}`}>
                                                        {getKondisiLabel(item.kondisi).text}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">Hapus</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal Form */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">{editingAlat ? 'Edit Alat' : 'Tambah Alat'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Upload Gambar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Alat</label>
                                    <div className="flex items-center gap-4">
                                        {/* Preview */}
                                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-400 text-3xl">📷</span>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                                id="gambar-input"
                                            />
                                            <label
                                                htmlFor="gambar-input"
                                                className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-block"
                                            >
                                                Pilih Gambar
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Maks. 5MB)</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Alat</label>
                                    <input type="text" name="nama_alat" value={formData.nama_alat} onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select name="kategori_id" value={formData.kategori_id} onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">Pilih Kategori</option>
                                        {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Total</label>
                                        <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} min="0"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                    {editingAlat && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tersedia</label>
                                            <input type="number" name="jumlah_tersedia" value={formData.jumlah_tersedia} onChange={handleChange} min="0"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
                                    <select name="kondisi" value={formData.kondisi} onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="baik">Baik</option>
                                        <option value="rusak_ringan">Rusak Ringan</option>
                                        <option value="rusak_berat">Rusak Berat</option>
                                    </select>
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

export default AlatManagement;
