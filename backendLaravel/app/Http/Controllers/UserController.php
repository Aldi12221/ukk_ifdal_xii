<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    
    public function index()
    {
        try {
            $users = User::with('role')->get();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data user',
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   
    public function show($id)
    {
        $user = User::with('role')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    
    public function register(Request $request)
    {
        $data = $request->validate([
            'username' => 'required',
            'email' => 'required|email|unique:users',
            'nama_lengkap' => 'required',
            'alamat' => 'required',
            'role_id' => 'required',
            'password' => 'required|min:6'
        ]);

        $user = User::create($data);

        LogAktivitas::create([
            'id_user' => $user->id,
            'aksi' => 'REGISTER',
            'tabel_terkait' => 'users',
            'id_data' => $user->id,
            'keterangan' => "User baru mendaftar: {$user->email}"
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mendaftarkan user',
            'data' => ['id' => $user->id]
        ], 201);
    }

   
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user = Auth::user();

     
        $token = $user->createToken('auth_token')->plainTextToken;

        LogAktivitas::create([
            'id_user' => $user->id,
            'aksi' => 'LOGIN',
            'tabel_terkait' => 'users',
            'id_data' => $user->id,
            'keterangan' => "User login: {$user->email}"
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id
            ],
            'token' => $token
        ], 200);
    }

   
    public function update(Request $request,User $user)
    {
        

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $user->update($request->all());

        LogAktivitas::create([
            'id_user' => auth()->id(),
            'aksi' => 'UPDATE',
            'tabel_terkait' => 'users',
            'id_data' => $user->id,
            'keterangan' => "User diupdate: ID {$user->id}"
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengupdate user'
        ], 200);
    }

   
    public function destroy(User $user)
    {
       

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $user->delete();

        LogAktivitas::create([
            'id_user' => auth()->id(),
            'aksi' => 'DELETE',
            'tabel_terkait' => 'users',
            'id_data' => $id,
            'keterangan' => "User dihapus: ID {$id}"
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil menghapus user'
        ], 200);
    }

    
    public function profile()
    {
        return response()->json([
            'success' => true,
            'data' => auth()->user()
        ], 200);
    }
}
