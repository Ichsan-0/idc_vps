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
            $table->string('link_surat_pernyataan')->nullable()->after('link_transkrip_nilai');
            $table->string('link_surat_kesiapan')->nullable()->after('link_surat_pernyataan');
            $table->string('alamat_asal')->nullable()->after('link_surat_kesiapan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mahasiswa_tbl', function (Blueprint $table) {
            $table->dropColumn(['link_surat_pernyataan', 'link_surat_kesiapan']);
        });
    }
};
