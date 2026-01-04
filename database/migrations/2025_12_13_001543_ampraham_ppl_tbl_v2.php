<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ampraham_ppl_tbl', function (Blueprint $table) {
            $table->unsignedBigInteger('id_gelombang')
                  ->nullable()
                  ->after('id_sekolah');

            $table->foreign('id_gelombang')
                  ->references('id')
                  ->on('gelombang_tbl')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('ampraham_ppl_tbl', function (Blueprint $table) {
            $table->dropForeign(['id_gelombang']);
            $table->dropColumn('id_gelombang');
        });
    }
};
