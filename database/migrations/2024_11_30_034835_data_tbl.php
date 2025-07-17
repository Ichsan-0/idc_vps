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
        Schema::create('data_tbl', function (Blueprint $table) {
            $table->id();
            $table->boolean('buka_pendaftaran')->default(false);
            $table->boolean('buka_lengkapi_profil')->default(false);
            $table->boolean('buka_lamaran_ppl')->default(false);
            $table->boolean('buka_lamaran_kpm')->default(false);
            $table->boolean('buka_cetak_sertifikat')->default(false);
            $table->text('link_grup')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_tbl');
    }
};
