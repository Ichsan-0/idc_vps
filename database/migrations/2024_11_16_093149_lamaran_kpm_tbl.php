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
        Schema::create('lamaran_kpm_tbl', function (Blueprint $table) {
            $table->id();
            $table->string('username_mahasiswa')->nullable();
            $table->unsignedBigInteger('id_tempat_kpm')->nullable();
            $table->string('status')->default("submitted"); //submitted, rejected, accepted
            $table->text('keterangan')->nullable();

            $table->foreign('username_mahasiswa')->references('username')->on('users')->onDelete('cascade');
            $table->foreign('id_tempat_kpm')->references('id')->on('tempat_kpm_tbl')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lamaran_kpm_tbl');
    }
};
