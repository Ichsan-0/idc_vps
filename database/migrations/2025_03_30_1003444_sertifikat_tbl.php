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
        Schema::create('sertifikat_tbl', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->nullable()->default('B-');
            $table->string('kode_universitas')->nullable()->default('/Un.08');
            $table->string('kode_idc')->nullable()->default('/IDC');
            $table->string('kode_jenis_surat')->nullable()->default('/Kp.07.6');
            $table->string('bulan_tahun')->nullable();
            $table->boolean('open_print_certificate')->default(false);
            $table->integer('base_number')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sertifikat_tbl');
    }
};
