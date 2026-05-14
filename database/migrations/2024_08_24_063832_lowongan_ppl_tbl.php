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
        Schema::create('lowongan_ppl_tbl', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('quota')->nullable();

            $table->unsignedBigInteger('id_sekolah')->nullable();
            $table->unsignedBigInteger('id_prodi')->nullable();
            $table->timestamps();

            $table->foreign('id_sekolah')->references('id')->on('sekolah_tbl')->onDelete('cascade');
            $table->foreign('id_prodi')->references('id')->on('prodi_tbl')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lowongan_ppl_tbl');
    }
};
