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
        Schema::create('comment', function (Blueprint $table) {
            $table->id();
            $table->string('created_by');
            $table->string('tipe');
            $table->unsignedBigInteger('id_kelas');
            $table->unsignedBigInteger('id_tugas');
            $table->string('receiver')->nullable();
            $table->text('message')->nullable();
            $table->timestamps();

            $table->foreign('receiver')->references('username')->on('users')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('created_by')->references('username')->on('users')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('id_kelas')->references('id')->on('tempat_kpm_tbl')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('id_tugas')->references('id')->on('task')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comment');
    }
};
