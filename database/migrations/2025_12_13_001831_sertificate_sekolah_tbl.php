<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sertifikat_sekolah_tbl', function(Blueprint $table){
            $table->id();
            $table->string('nomor_surat')->nullable();
            $table->string('tanggal_surat')->nullable();
            $table->string('periode_ppl')->nullable();
            $table->boolean('open_print_certificate')->default(false);
            $table->unsignedBigInteger('id_gelombang')->nullable();
            $table->foreign('id_gelombang')->references('id')->on('gelombang_tbl')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sertifikat_sekolah_tbl');
    }
};
