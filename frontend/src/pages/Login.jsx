import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Mapping Role untuk Redirect yang lebih bersih
    const ROLE_REDIRECTS = {
        1: '/admin',
        2: '/petugas',
        3: '/peminjam'
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                const targetPath = ROLE_REDIRECTS[result.user.role_id] || '/peminjam';
                navigate(targetPath);
            } else {
                setError(result.message || 'Email atau password salah.');
            }
        } catch (err) {
            setError('Koneksi gagal. Pastikan server berjalan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 font-sans">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100 blur-3xl opacity-50"></div>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10 transition-all">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
                        <LogIn className="w-8 h-8 text-white -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Selamat Datang</h1>
                    <p className="text-gray-500 mt-2">Kelola peminjaman alat dengan mudah</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Masuk Sekarang'
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 hover:underline">
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;