<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Pengembalian extends Model
{
    use HasFactory;

    protected $table = 'pengembalian';

    protected $fillable = [
        'id_peminjaman',
        'id_petugas',
        'kondisi_alat',
        'catatan',
        'tanggal_harus_kembali',
        'tanggal_kembali',
        'terlambat_hari',
        'denda'
    ];

    protected $casts = [
        'tanggal_harus_kembali' => 'date',
        'tanggal_kembali' => 'datetime',
    ];

    

    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'id_petugas');
    }

   
    const DENDA_PER_HARI = 5000;
    const DENDA_RUSAK = 50000;

    

    public static function hitungDenda($tanggalHarusKembali, $tanggalKembali, $kondisi = 'baik')
    {
        $harusKembali = Carbon::parse($tanggalHarusKembali);
        $kembali = Carbon::parse($tanggalKembali);

        $terlambatHari = max(0, $harusKembali->diffInDays($kembali, false));
        $denda = $terlambatHari * self::DENDA_PER_HARI;

        if ($kondisi === 'rusak') {
            $denda += self::DENDA_RUSAK;
        }

        return [
            'terlambat_hari' => $terlambatHari,
            'denda' => $denda
        ];
    }
}
