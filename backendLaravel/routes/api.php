<?php

use Illuminate\Support\Facades\Route;


use App\Http\Controllers\UserController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\AlatController;
use App\Http\Controllers\PeminjamanController;
use App\Http\Controllers\PengembalianController;
use App\Http\Controllers\LogAktivitasController;
use App\Http\Middleware\isAdmin;
use App\Http\middleware\isAdminOrPetugas;

Route::middleware('auth:sanctum')->group([

]);

Route::post('/login', [UserController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);

Route::get('/profile', [UserController::class, 'getProfile']);

Route::apiResource('users',UserController::class);

Route::apiResource('kategori',kategoriController::class);

Route::get('/alat/tersedia', [AlatController::class, 'getAvailable']);

Route::apiResource('alat',AlatController::class);

Route::get('/peminjaman/my', [PeminjamanController::class, 'getMyPeminjaman']);
Route::get('/peminjaman/pending', [PeminjamanController::class, 'getPending']);

Route::get('/peminjaman/active', [PeminjamanController::class, 'getActive']);
Route::get('/peminjaman/return-requests', [PeminjamanController::class, 'getReturnRequests']);

Route::apiResource('peminjaman',PeminjamanController::class);

Route::put('/peminjaman/{id}/approve', [PeminjamanController::class, 'approve']);
Route::put('/peminjaman/{id}/reject', [PeminjamanController::class, 'reject']);

Route::put('/peminjaman/{id}/return', [PeminjamanController::class, 'requestReturn']);



// Route::get('/pengembalian', [PengembalianController::class, 'index']);
// Route::get('/pengembalian/{id}', [PengembalianController::class, 'show']);
// Route::post('/pengembalian', [PengembalianController::class, 'store']);
// Route::delete('/pengembalian/{id}', [PengembalianController::class, 'destroy']);

Route::apiResource('pengembalian',Pengembalian::class);

Route::get('/log-aktivitas', [LogAktivitasController::class, 'index']);


