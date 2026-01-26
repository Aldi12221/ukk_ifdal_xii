<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\Alat;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PeminjamanController extends Controller
{
   
    public function index()
    {
        try {
            $data = Peminjaman::all();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data peminjaman',
                'data'    => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peminjaman',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function show($id)
    {
        try {
            $peminjaman = Peminjaman::find($id);

            if (!$peminjaman) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peminjaman tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $peminjaman
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peminjaman',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function my()
    {
        try {
            $data = Peminjaman::where('id_peminjam', Auth::id())->get();

            return response()->json([
                'success' => true,
                'data'    => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peminjaman',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

   
    public function pending()
    {
        try {
            $data = Peminjaman::where('status', 'pending')->get();

            return response()->json([
                'success' => true,
                'data'    => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peminjaman pending',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function active()
    {
        try {
            $data = Peminjaman::where('status', 'dipinjam')->get();

            return response()->json([
                'success' => true,
                'data'    => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peminjaman aktif',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

   
    public function store(Request $request)
    {
        $request->validate([
            'id_alat'                => 'required|integer',
            'tanggal_harus_kembali'  => 'required|date',
            'jumlah_pinjam'          => 'nullable|integer|min:1'
        ]);

        try {
            $alat = Alat::find($request->id_alat);

            if (!$alat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alat tidak ditemukan'
                ], 404);
            }

            $jumlahPinjam = $request->jumlah_pinjam ?? 1;

            if ($alat->jumlah_tersedia < $jumlahPinjam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok tidak cukup. Tersedia: ' . $alat->jumlah_tersedia
                ], 400);
            }

            $peminjaman = Peminjaman::create([
                'id_peminjam'           => Auth::id(),
                'id_alat'               => $request->id_alat,
                'jumlah_pinjam'         => $jumlahPinjam,
                'tanggal_harus_kembali' => $request->tanggal_harus_kembali,
                'status'                => 'pending'
            ]);

            LogAktivitas::create([
                'id_user'       => Auth::id(),
                'aksi'          => 'CREATE',
                'tabel_terkait' => 'peminjaman',
                'id_data'       => $peminjaman->id,
                'keterangan'    => 'Pengajuan peminjaman alat: ' . $alat->nama_alat
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengajukan peminjaman. Menunggu persetujuan petugas.',
                'data'    => ['id' => $peminjaman->id]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengajukan peminjaman',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function approve($id)
    {
        try {
            DB::beginTransaction();

            $peminjaman = Peminjaman::find($id);

            if (!$peminjaman || $peminjaman->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Peminjaman tidak ditemukan atau sudah diproses'
                ], 400);
            }

            $alat = Alat::find($peminjaman->id_alat);

            if ($alat->jumlah_tersedia < $peminjaman->jumlah_pinjam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok alat tidak mencukupi'
                ], 400);
            }

            $alat->decrement('jumlah_tersedia', $peminjaman->jumlah_pinjam);

            $peminjaman->update([
                'status'      => 'dipinjam',
                'id_petugas'  => Auth::id()
            ]);

            LogAktivitas::create([
                'id_user'       => Auth::id(),
                'aksi'          => 'APPROVE',
                'tabel_terkait' => 'peminjaman',
                'id_data'       => $id,
                'keterangan'    => 'Peminjaman disetujui: ID ' . $id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Peminjaman berhasil disetujui'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui peminjaman',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function reject(Request $request, $id)
    {
        try {
            $peminjaman = Peminjaman::where('id', $id)
                ->where('status', 'pending')
                ->first();

            if (!$peminjaman) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peminjaman tidak ditemukan atau sudah diproses'
                ], 404);
            }

            $peminjaman->update([
                'status'     => 'ditolak',
                'id_petugas' => Auth::id(),
                'catatan'    => $request->catatan
            ]);

            LogAktivitas::create([
                'id_user'       => Auth::id(),
                'aksi'          => 'REJECT',
                'tabel_terkait' => 'peminjaman',
                'id_data'       => $id,
                'keterangan'    => 'Peminjaman ditolak: ID ' . $id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Peminjaman berhasil ditolak'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak peminjaman',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

   
    public function requestReturn($id)
    {
        try {
            $peminjaman = Peminjaman::find($id);

            if (
                !$peminjaman ||
                $peminjaman->id_peminjam !== Auth::id() ||
                $peminjaman->status !== 'dipinjam'
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengajukan pengembalian'
                ], 400);
            }

            $peminjaman->update([
                'status' => 'menunggu_pengembalian'
            ]);

            LogAktivitas::create([
                'id_user'       => Auth::id(),
                'aksi'          => 'REQUEST_RETURN',
                'tabel_terkait' => 'peminjaman',
                'id_data'       => $id,
                'keterangan'    => 'Pengajuan pengembalian alat'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan pengembalian berhasil'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengajukan pengembalian',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function returnRequests()
    {
        $data = Peminjaman::where('status', 'menunggu_pengembalian')->get();

        return response()->json([
            'success' => true,
            'data'    => $data
        ], 200);
    }

    
    public function destroy($id)
    {
        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman tidak ditemukan'
            ], 404);
        }

        $peminjaman->delete();

        LogAktivitas::create([
            'id_user'       => Auth::id(),
            'aksi'          => 'DELETE',
            'tabel_terkait' => 'peminjaman',
            'id_data'       => $id,
            'keterangan'    => 'Peminjaman dihapus: ID ' . $id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil menghapus peminjaman'
        ], 200);
    }
}
