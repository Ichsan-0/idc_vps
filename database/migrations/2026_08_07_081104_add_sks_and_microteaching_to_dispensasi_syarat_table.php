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
        Schema::table('dispensasi_syarat', function (Blueprint $table) {
            $table->integer('sks_diambil')->nullable()->after('nama');
            $table->string('nilai_microteaching')->nullable()->after('sks_diambil');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dispensasi_syarat', function (Blueprint $table) {
            $table->dropColumn(['sks_diambil', 'nilai_microteaching']);
        });
    }
};
