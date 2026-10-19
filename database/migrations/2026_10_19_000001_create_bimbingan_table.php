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
        Schema::create('bimbingan_tbl', function (Blueprint $table) {
            $table->id();
            $table->string('tipe', 20); // 'kpm' atau 'ppl'
            $table->unsignedBigInteger('id_kelas'); // tempat_kpm_tbl.id atau sekolah_tbl.id
            $table->string('username_mahasiswa');
            $table->string('username_supervisor')->nullable();
            $table->integer('bimbingan_ke')->default(1);
            $table->date('tanggal');
            $table->string('judul');
            $table->text('deskripsi');
            $table->string('status', 30)->default('pending'); // 'pending', 'approved', 'rejected'
            $table->text('catatan_supervisor')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            $table->foreign('username_mahasiswa')
                ->references('username')
                ->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('username_supervisor')
                ->references('username')
                ->on('users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            $table->index(['tipe', 'id_kelas']);
            $table->index(['username_mahasiswa', 'tipe']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bimbingan_tbl');
    }
};
