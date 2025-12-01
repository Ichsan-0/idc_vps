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
        Schema::table('sekolah_tbl', function(Blueprint $table){
            $table->unsignedBigInteger('id_sekolah')->nullable();
            $table->unsignedBigInteger('id_gelombang')->nullable();


            $table->foreign('id_sekolah')
                ->references('id')
                ->on('sekolah_master')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('id_gelombang')
                ->references('id')
                ->on('gelombang_tbl')
                ->onUpdate('cascade')
                ->onDelete('set null');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sekolah_tbl', function(Blueprint $table)  {
            $table->dropForeign(['id_sekolah']);
            $table->dropForeign(['id_gelombang']);

            $table->dropColumn(['id_sekolah', 'id_gelombang']);
            
        });
    }
};
