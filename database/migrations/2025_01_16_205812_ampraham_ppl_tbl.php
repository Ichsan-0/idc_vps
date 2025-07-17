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
        Schema::create('ampraham_ppl_tbl', function (Blueprint $table) {
            $table->id();
            $table->text('link_document');
            $table->string('no_rekening');
            $table->string('no_npwp');
            $table->string('name');
            $table->string('nip');
            $table->string('nama_bank');
            $table->string('status')->default('di-review');
            $table->string('keterangan')->nullable();
            $table->string('nama_di_buku_rekening');
            $table->string('pangkat_dan_golongan');
            $table->string('username_mahasiswa')->nullable();
            // $table->integer('jumlah_mahasiswa')->nullable();
            $table->unsignedBigInteger('id_sekolah');
            $table->timestamps();
            $table->string('jabatan');
            $table->foreign('id_sekolah')->references('id')->on('sekolah_tbl')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ampraham_ppl_tbl');
    }
};
