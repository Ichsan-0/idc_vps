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
        Schema::create('kelas_ppl', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_sekolah')->nullable();
            $table->string('username_supervisor')->nullable();
            $table->unsignedBigInteger('id_gelombang')->nullable();
            $table->timestamps();


            $table->foreign('id_sekolah')->references('id')->on('sekolah_master')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('username_supervisor')
                ->references('username')
                ->on('users')
                ->onDelete('set null')
                ->onUpdate('cascade');
                
            $table->foreign('id_gelombang')->references('id')->on('gelombang_tbl')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelas_ppl');
    }
};
