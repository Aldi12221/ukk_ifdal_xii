// ===========================================
// FILE: api.js
// DESKRIPSI: Service untuk koneksi ke backend API
// ===========================================

import axios from 'axios';

// URL backend
const API_URL = 'http://localhost:3000/api';

// Buat instance axios dengan konfigurasi default
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor untuk menambahkan token ke setiap request
// Ini otomatis menambahkan Authorization header jika user sudah login
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk handle response error
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jika token expired atau tidak valid
        if (error.response && error.response.status === 401) {
            // Hapus token dan redirect ke login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ===========================================
// API FUNCTIONS
// ===========================================

// ----- AUTH -----
export const login = (email, password) => {
    return api.post('/login', { email, password });
};

export const register = (data) => {
    return api.post('/register', data);
};

export const getProfile = () => {
    return api.get('/profile');
};

// ----- USERS -----
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ----- KATEGORI -----
export const getKategori = () => api.get('/kategori');
export const getKategoriById = (id) => api.get(`/kategori/${id}`);
export const createKategori = (data) => api.post('/kategori', data);
export const updateKategori = (id, data) => api.put(`/kategori/${id}`, data);
export const deleteKategori = (id) => api.delete(`/kategori/${id}`);

// ----- ALAT -----
export const getAlat = () => api.get('/alat');
export const getAlatTersedia = () => api.get('/alat/tersedia');
export const getAlatById = (id) => api.get(`/alat/${id}`);
export const createAlat = (data) => api.post('/alat', data);
export const updateAlat = (id, data) => api.put(`/alat/${id}`, data);
export const deleteAlat = (id) => api.delete(`/alat/${id}`);

// ----- PEMINJAMAN -----
export const getPeminjaman = () => api.get('/peminjaman');
export const getPeminjamanById = (id) => api.get(`/peminjaman/${id}`);
export const getMyPeminjaman = () => api.get('/peminjaman/my');
export const getPeminjamanPending = () => api.get('/peminjaman/pending');
export const getPeminjamanActive = () => api.get('/peminjaman/active');
export const getReturnRequests = () => api.get('/peminjaman/return-requests');
export const createPeminjaman = (data) => api.post('/peminjaman', data);
export const approvePeminjaman = (id) => api.put(`/peminjaman/${id}/approve`);
export const rejectPeminjaman = (id, catatan) => api.put(`/peminjaman/${id}/reject`, { catatan });
export const requestReturnPeminjaman = (id) => api.put(`/peminjaman/${id}/return`);
export const deletePeminjaman = (id) => api.delete(`/peminjaman/${id}`);

// ----- PENGEMBALIAN -----
export const getPengembalian = () => api.get('/pengembalian');
export const getPengembalianById = (id) => api.get(`/pengembalian/${id}`);
export const createPengembalian = (data) => api.post('/pengembalian', data);
export const deletePengembalian = (id) => api.delete(`/pengembalian/${id}`);

// ----- LOG AKTIVITAS -----
export const getLogAktivitas = () => api.get('/log-aktivitas');

export default api;
