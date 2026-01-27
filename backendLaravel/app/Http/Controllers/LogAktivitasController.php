<?php

namespace App\Http\Controllers;

use App\Models\log_aktivitas;
use Illuminate\Http\Request;

class LogAktivitasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
     public function index()
    {
        try {
            $users = log_aktivitas::get();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data user',
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data log aktifitas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(log_aktivitas $log_aktivitas)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(log_aktivitas $log_aktivitas)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, log_aktivitas $log_aktivitas)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(log_aktivitas $log_aktivitas)
    {
        //
    }
}
