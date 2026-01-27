<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use App\Models\Alat;
use App\Models\LogAktivitas;
use Carbon\Carbon;

class PengembalianController extends Controller
{
   
    public function index()
    {
        try {
            $data = Pengembalian::with(['peminjaman', 'petugas'])->get();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data pengembalian',
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengembalian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   
    public function show($id)
    {
        $pengembalian = Pengembalian::with(['peminjaman', 'petugas'])->find($id);

        if (!$pengembalian) {
            return response()->json([
                'success' => false,
                'message' => 'Pengembalian tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $pengembalian
        ], 200);
    }

    
    public function store(Request $request)
    {
       $data = $request->validate([
            'id_peminjaman' => 'required|exists:peminjaman,id',
            'kondisi_alat' => 'nullable|string',
            'catatan' => 'nullable|string'
        ]);

        $idPetugas = auth()->id();

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::find($request->id_peminjaman);

           
            
            if (!in_array($peminjaman->status, ['dipinjam', 'menunggu_pengembalian'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status peminjaman tidak valid untuk dikembalikan'
                ], 400);
            }

        
            
            if (Pengembalian::where('id_peminjaman', $peminjaman->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peminjaman ini sudah dikembalikan'
                ], 400);
            }

           
            
            $pengembalian = Pengembalian::create([
                'id_peminjaman' => $peminjaman->id,
                'id_petugas' => $idPetugas,
                'kondisi_alat' => $request->kondisi_alat,
                'catatan' => $request->catatan,
                'tanggal_harus_kembali' => $peminjaman->tanggal_harus_kembali,
                'tanggal_kembali' => now()
            ]);

          
            
            $peminjaman->update([
                'status' => 'dikembalikan'
            ]);

           
            
            Alat::where('id', $peminjaman->id_alat)
                ->increment('jumlah_tersedia', $peminjaman->jumlah_pinjam);

            
                
            $hasilDenda = Pengembalian::hitungDenda(
        $peminjaman->tanggal_harus_kembali,
         now(),
         $request->kondisi_alat
            );

                 $terlambatHari = $hasilDenda['terlambat_hari'];
                  $denda = $hasilDenda['denda'];


           
            
            LogAktivitas::create([
                'id_user' => $idPetugas,
                'aksi' => 'CREATE',
                'tabel_terkait' => 'pengembalian',
                'id_data' => $pengembalian->id,
                'keterangan' => "Pengembalian alat ID {$peminjaman->id_alat}, Denda: Rp {$denda}"
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memproses pengembalian',
                'data' => [
                    'id' => $pengembalian->id,
                    'terlambat_hari' => $terlambatHari,
                    'denda' => $denda,
                    'denda_formatted' => 'Rp ' . number_format($denda, 0, ',', '.')
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pengembalian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

  
    
    public function destroy($id)
    {
        $pengembalian = Pengembalian::find($id);

        if (!$pengembalian) {
            return response()->json([
                'success' => false,
                'message' => 'Pengembalian tidak ditemukan'
            ], 404);
        }

        $pengembalian->delete();

        LogAktivitas::create([
            'id_user' => auth()->id(),
            'aksi' => 'DELETE',
            'tabel_terkait' => 'pengembalian',
            'id_data' => $id,
            'keterangan' => "Pengembalian dihapus: ID {$id}"
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil menghapus pengembalian'
        ], 200);
    }
}
