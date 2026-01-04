<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ampraham_ppl_tbl', function (Blueprint $table) {
            // Drop foreign key lama ke sekolah_tbl
            $table->dropForeign(['id_sekolah']);

            // Tambah foreign key baru ke sekolah_master
            $table->foreign('id_sekolah')
                ->references('id')
                ->on('sekolah_master')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('ampraham_ppl_tbl', function (Blueprint $table) {
            // Drop foreign key ke sekolah_master
            $table->dropForeign(['id_sekolah']);

            // Kembalikan ke foreign lama (sekolah_tbl)
            $table->foreign('id_sekolah')
                ->references('id')
                ->on('sekolah_tbl')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }
};
