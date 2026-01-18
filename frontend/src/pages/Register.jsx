// ===========================================
// FILE: Register.jsx
// DESKRIPSI: Halaman registrasi untuk peminjam baru
// ===========================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
    // State untuk form
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        nama_lengkap: '',
        alamat: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Handle perubahan input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validasi password
        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak sama');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                nama_lengkap: formData.nama_lengkap,
                alamat: formData.alamat,
                role_id: 3 // Default sebagai peminjam
            });

            if (response.data.success) {
                alert('Registrasi berhasil! Silakan login.');
                navigate('/login');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Terjadi kesalahan saat registrasi';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Daftar Akun</h1>
                    <p className="text-gray-500 mt-2">Buat akun untuk meminjam alat</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="nama_lengkap"
                            value={formData.nama_lengkap}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                    >
                        {loading ? 'Memproses...' : 'Daftar'}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline font-medium">
                        Login di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
