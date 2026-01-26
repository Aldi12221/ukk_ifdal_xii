<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlatController extends Controller
{
   
    public function index()
    {
        try {
            $alat = Alat::all();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data alat',
                'data'    => $alat
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data alat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function tersedia()
    {
        try {
            $alat = Alat::where('jumlah', '>', 0)->get();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data alat tersedia',
                'data'    => $alat
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data alat tersedia',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function show($id)
    {
        try {
            $alat = Alat::find($id);

            if (!$alat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alat tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $alat
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data alat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

   
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nama_alat' => 'required|string',
                'jumlah'    => 'required|integer',
                'gambar'    => 'nullable|image'
            ]);

            $data = $request->all();

        
            if ($request->hasFile('gambar')) {
                $data['gambar'] = $request->file('gambar')->store('alat', 'public');
            }

            $alat = Alat::create($data);

           
            LogAktivitas::create([
                'id_user'       => Auth::id(),
                'aksi'          => 'CREATE',
                'tabel_terkait' => 'alat',
                'id_data'       => $alat->id,
                'keterangan'    => 'Alat baru ditambahkan: ' . $alat->nama_alat
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil menambahkan alat',
                'data'    => $alat
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan alat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $alat = Alat::find($id);

            if (!$alat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alat tidak ditemukan'
                ], 404);
            }

            $request->validate([
                'nama_alat' => 'required|string',
                'jumlah'    => 'nullable|integer',
                'gambar'    => 'nullable|image'
            ]);

            $data = $request->all();

            if ($request->hasFile('gambar')) {
                $data['gambar'] = $request->file('gambar')->store('alat', 'public');
            }

            $alat->update($data);

            LogAktivitas::create([
                'id_user'       => Auth::id(),
                'aksi'          => 'UPDATE',
                'tabel_terkait' => 'alat',
                'id_data'       => $alat->id,
                'keterangan'    => 'Alat diupdate: ' . $alat->nama_alat
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengupdate alat'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate alat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
    public function destroy($id)
    {
        try {
            $alat = Alat::find($id);

            if (!$alat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alat tidak ditemukan'
                ], 404);
            }

            $alat->delete();

            LogAktivitas::create([
                'id_user'       => Auth::id(),
                'aksi'          => 'DELETE',
                'tabel_terkait' => 'alat',
                'id_data'       => $id,
                'keterangan'    => 'Alat dihapus: ID ' . $id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil menghapus alat'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus alat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
