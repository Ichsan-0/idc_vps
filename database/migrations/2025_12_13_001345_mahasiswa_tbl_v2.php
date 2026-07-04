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
        Schema::table('mahasiswa_tbl', function (Blueprint $table) {
            if (!Schema::hasColumn('mahasiswa_tbl', 'alamat_sekarang')) {
                $table->string('alamat_sekarang', 500)->nullable()->after('alamat_asal');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mahasiswa_tbl', function (Blueprint $table) {
            if (Schema::hasColumn('mahasiswa_tbl', 'alamat_sekarang')) {
                $table->dropColumn('alamat_sekarang');
            }
        });
    }
};
