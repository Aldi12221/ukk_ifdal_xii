// ===========================================
// FILE: UserManagement.jsx
// DESKRIPSI: Halaman CRUD user untuk Admin
// ===========================================

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getUsers, deleteUser, register, updateUser } from '../../services/api';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        nama_lengkap: '',
        alamat: '',
        role_id: 3
    });

    // Ambil data users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle perubahan form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
                alert('User berhasil diupdate');
            } else {
                await register(formData);
                alert('User berhasil ditambahkan');
            }
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus user ini?')) {
            try {
                await deleteUser(id);
                alert('User berhasil dihapus');
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || 'Gagal menghapus user');
            }
        }
    };

    // Handle edit
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            nama_lengkap: user.nama_lengkap || '',
            alamat: user.alamat || '',
            role_id: user.role_id
        });
        setShowModal(true);
    };

    // Reset form
    const resetForm = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            nama_lengkap: '',
            alamat: '',
            role_id: 3
        });
    };

    // Role label
    const getRoleLabel = (roleId) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Petugas';
            case 3: return 'Peminjam';
            default: return 'Unknown';
        }
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
                        <p className="text-gray-600">Manajemen data pengguna sistem</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Tambah User
                    </button>
                </div>

                {/* Table */}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data user
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{user.username}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.nama_lengkap || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${user.role_id === 1 ? 'bg-red-100 text-red-800' : ''}
                                                    ${user.role_id === 2 ? 'bg-yellow-100 text-yellow-800' : ''}
                                                    ${user.role_id === 3 ? 'bg-green-100 text-green-800' : ''}
                                                `}>
                                                    {getRoleLabel(user.role_id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-blue-500 hover:text-blue-700 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal Form */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {editingUser ? 'Edit User' : 'Tambah User'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password {editingUser && '(kosongkan jika tidak diubah)'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required={!editingUser}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="nama_lengkap"
                                        value={formData.nama_lengkap}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                    <textarea
                                        name="alamat"
                                        value={formData.alamat}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        name="role_id"
                                        value={formData.role_id}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={1}>Admin</option>
                                        <option value={2}>Petugas</option>
                                        <option value={3}>Peminjam</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManagement;
