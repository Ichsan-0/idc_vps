<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ampraham_kpm_tbl', function (Blueprint $table) {
            $table->id();
            $table->text('link_document');
            $table->string('no_rekening');
            $table->string('no_npwp');
            $table->string('name');
            $table->string('nip');
            $table->string('status')->default('di-review');
            $table->string('keterangan')->nullable();
            $table->string('nama_di_buku_rekening');

            $table->string('nama_bank');
            $table->string('kecamatan')->nullable();
            $table->string('id_kecamatan')->nullable();
            $table->string('id_desa')->nullable();
            $table->string('pangkat_dan_golongan')->nullable();
            $table->string('desa')->nullable();
            $table->string('jabatan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ampraham_kpm_tbl');
    }
};
