<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengembalians', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_peminjaman');
            $table->unsignedBigInteger('id_petugas');
            $table->date('tanggal_kembali');
             $table->enum('kondisi',['baik','rusak_ringan','rusak_berat'])->default('baik');
            $table->integer('terlambat_hari');
            $table->decimal('denda');
            $table->text('catatan');
            
            $table->timestamps();

            $table->foreign('id_peminjaman')->references('id')->on('peminjaman');
            $table->foreign('id_petugas')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengembalians');
    }
};
