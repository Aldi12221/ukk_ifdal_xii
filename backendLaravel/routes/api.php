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



Route::post('/login', [UserController::class, 'login']);


Route::post('/register', [UserController::class, 'register']);



Route::middleware('auth:sanctum')->group(function () {

    
    Route::get('/profile', [UserController::class, 'getProfile']);

   
    Route::middleware($isAdmin)->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    
    
    Route::get('/kategori', [KategoriController::class, 'index']);
    Route::get('/kategori/{id}', [KategoriController::class, 'show']);

  
    Route::middleware('isAdmin')->group(function () {
        Route::post('/kategori', [KategoriController::class, 'store']);
        Route::put('/kategori/{id}', [KategoriController::class, 'update']);
        Route::delete('/kategori/{id}', [KategoriController::class, 'destroy']);
    });


   
    Route::get('/alat/tersedia', [AlatController::class, 'getAvailable']);

   
    Route::get('/alat', [AlatController::class, 'index']);
    Route::get('/alat/{id}', [AlatController::class, 'show']);

    
    Route::middleware($isAdmin)->group(function () {
        Route::post('/alat', [AlatController::class, 'store']);
        Route::post('/alat/{id}', [AlatController::class, 'update']); 
        Route::delete('/alat/{id}', [AlatController::class, 'destroy']);
    });


    Route::get('/peminjaman/my', [PeminjamanController::class, 'getMyPeminjaman']);

   
    Route::middleware('isAdminOrPetugas')->group(function () {
        Route::get('/peminjaman/pending', [PeminjamanController::class, 'getPending']);
        Route::get('/peminjaman/active', [PeminjamanController::class, 'getActive']);
        Route::get('/peminjaman/return-requests', [PeminjamanController::class, 'getReturnRequests']);

        Route::get('/peminjaman', [PeminjamanController::class, 'index']);
        Route::get('/peminjaman/{id}', [PeminjamanController::class, 'show']);

        Route::put('/peminjaman/{id}/approve', [PeminjamanController::class, 'approve']);
        Route::put('/peminjaman/{id}/reject', [PeminjamanController::class, 'reject']);
    });

   
    Route::post('/peminjaman', [PeminjamanController::class, 'store']);

    
    Route::put('/peminjaman/{id}/return', [PeminjamanController::class, 'requestReturn']);

   
    Route::middleware('isAdmin')->delete('/peminjaman/{id}', [PeminjamanController::class, 'destroy']);


    Route::middleware('isAdminOrPetugas')->group(function () {
        Route::get('/pengembalian', [PengembalianController::class, 'index']);
        Route::get('/pengembalian/{id}', [PengembalianController::class, 'show']);
        Route::post('/pengembalian', [PengembalianController::class, 'store']);
    });

   
    Route::middleware('isAdmin')->delete('/pengembalian/{id}', [PengembalianController::class, 'destroy']);


    Route::middleware('isAdmin')->get('/log-aktivitas', [LogAktivitasController::class, 'index']);

});
