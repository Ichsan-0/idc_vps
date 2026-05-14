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
        Schema::create('ppl_tbl', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('id_prodi')->nullable();
            $table->unsignedBigInteger('id_sekolah')->nullable();
            $table->timestamps();


            $table->foreign('id_sekolah')->references('id')->on('sekolah_tbl')->onDelete('set null');
            $table->foreign('id_prodi')->references('id')->on('prodi_tbl')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppl_tbl');
    }
};
