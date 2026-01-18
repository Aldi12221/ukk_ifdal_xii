// ===========================================
// FILE: App.jsx
// DESKRIPSI: Komponen utama dengan routing
// ===========================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Public
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import KategoriManagement from './pages/admin/KategoriManagement';
import AlatManagement from './pages/admin/AlatManagement';
import PeminjamanManagement from './pages/admin/PeminjamanManagement';
import PengembalianManagement from './pages/admin/PengembalianManagement';
import LogAktivitas from './pages/admin/LogAktivitas';

// Pages - Petugas
import PetugasDashboard from './pages/petugas/PetugasDashboard';
import CetakLaporan from './pages/petugas/CetakLaporan';

// Pages - Peminjam
import PeminjamDashboard from './pages/peminjam/PeminjamDashboard';
import DaftarAlat from './pages/peminjam/DaftarAlat';
import AjukanPeminjaman from './pages/peminjam/AjukanPeminjaman';
import RiwayatPeminjaman from './pages/peminjam/RiwayatPeminjaman';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes - role_id: 1 */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={[1]}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/kategori" element={
            <ProtectedRoute allowedRoles={[1]}>
              <KategoriManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/alat" element={
            <ProtectedRoute allowedRoles={[1]}>
              <AlatManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/peminjaman" element={
            <ProtectedRoute allowedRoles={[1]}>
              <PeminjamanManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/pengembalian" element={
            <ProtectedRoute allowedRoles={[1]}>
              <PengembalianManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/log" element={
            <ProtectedRoute allowedRoles={[1]}>
              <LogAktivitas />
            </ProtectedRoute>
          } />

          {/* Petugas Routes - role_id: 2 */}
          <Route path="/petugas" element={
            <ProtectedRoute allowedRoles={[2]}>
              <PetugasDashboard />
            </ProtectedRoute>
          } />
          <Route path="/petugas/approval" element={
            <ProtectedRoute allowedRoles={[2]}>
              <PetugasDashboard />
            </ProtectedRoute>
          } />
          <Route path="/petugas/pengembalian" element={
            <ProtectedRoute allowedRoles={[2]}>
              <PetugasDashboard />
            </ProtectedRoute>
          } />
          <Route path="/petugas/laporan" element={
            <ProtectedRoute allowedRoles={[2]}>
              <CetakLaporan />
            </ProtectedRoute>
          } />

          {/* Peminjam Routes - role_id: 3 */}
          <Route path="/peminjam" element={
            <ProtectedRoute allowedRoles={[3]}>
              <PeminjamDashboard />
            </ProtectedRoute>
          } />
          <Route path="/peminjam/alat" element={
            <ProtectedRoute allowedRoles={[3]}>
              <DaftarAlat />
            </ProtectedRoute>
          } />
          <Route path="/peminjam/pinjam" element={
            <ProtectedRoute allowedRoles={[3]}>
              <AjukanPeminjaman />
            </ProtectedRoute>
          } />
          <Route path="/peminjam/riwayat" element={
            <ProtectedRoute allowedRoles={[3]}>
              <RiwayatPeminjaman />
            </ProtectedRoute>
          } />

          {/* 404 - Redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
