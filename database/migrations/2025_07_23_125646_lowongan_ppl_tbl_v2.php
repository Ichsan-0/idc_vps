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
        Schema::table('lowongan_ppl_tbl', function(Blueprint $table){
            $table->dropForeign(['id_sekolah']);
            $table->foreign('id_sekolah')->references('id')->on('kelas_ppl')->onDelete('cascade')->onUpdate('cascade');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lowongan_ppl_tbl', function(Blueprint $table){
            $table->dropForeign(['id_sekolah']);

            $table->foreign('id_sekolah')->references('id')->on('sekolah_tbl')->onDelete('cascade');

        });
    }
};
