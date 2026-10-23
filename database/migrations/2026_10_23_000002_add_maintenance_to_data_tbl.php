<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('data_tbl', function (Blueprint $table) {
            $table->boolean('maintenance')
                ->default(false)
                ->after('buka_cetak_sertifikat');
        });
    }

    public function down(): void
    {
        Schema::table('data_tbl', function (Blueprint $table) {
            $table->dropColumn('maintenance');
        });
    }
};
