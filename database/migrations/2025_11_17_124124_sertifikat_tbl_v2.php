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
        Schema::table('sertifikat_tbl', function (Blueprint $table) {
            $table->unsignedBigInteger('id_gelombang')->nullable();

            $table->string('template_sertifikat')->nullable();
            $table->string('tanggal_surat')->nullable();


            $table->foreign('id_gelombang')
                  ->references('id')
                  ->on('gelombang_tbl')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sertifikat_tbl', function (Blueprint $table) {
            $table->dropForeign(['id_gelombang']);
            $table->dropColumn(['id_gelombang', 'template_sertifikat', 'tanggal_surat']);
        });
    }
};
