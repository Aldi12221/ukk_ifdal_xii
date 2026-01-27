<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\kategori;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KategoriController extends Controller
{
   
    public function index()
    {
        try {
            

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data alat',
                'data'    => kategori::latest()->get()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data alat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    
   

    
    public function show(kategori $kategori)
    {
        return response()->json([
            'data'=>$kategori
        ]);
        
    }

   
    public function store(Request $request )
    {
        try{

            $data = $request->validate([
                'nama_kategori'=>'required',
                'deskripsi'=>'required'
            ]);
            kategori::create($data);
            return response()->json([
                'message'=>'berhasil'
            ]);


        }catch(\Expectation $e){
            return response()->json([
                'error'=>$e


            ]);

        }
        
    }

    public function update(Request $request,kategori $kategori )
    {
        try{

            $data = $request->validate([
                'nama_kategori'=>'required',
                'deskripsi'=>'required'
            ]);
            $kategori->update($data);

            return response()->json([
                'message'=>'berhasil'
            ]);


        }catch(\Expectation $e){
            return response()->json([
                'error'=>$e


            ]);

        }
    }

    
    public function destroy(kategori $kategori)
    {
        $kategori->destroy();
    }
}
