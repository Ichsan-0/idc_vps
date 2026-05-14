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
        Schema::create('task_ppl_submission', function (Blueprint $table) {
            $table->id();
            $table->string('username_mahasiswa');
            $table->unsignedBigInteger('id_kelas');
            $table->unsignedBigInteger('id_tugas');
            $table->text('link');
            $table->string('status');
            $table->float('score')->nullable();
            $table->timestamps();

            $table->foreign('username_mahasiswa')->references('username')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_kelas')->references('id')->on('sekolah_tbl')->onDelete('cascade');
            $table->foreign('id_tugas')->references('id')->on('task_ppl')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_ppl_submission');
    }
};
