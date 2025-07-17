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
          
            $table->unsignedBigInteger('id_gelombang')->nullable();

            $table->foreign('id_gelombang')->references('id')->on('gelombang_tbl')->onDelete('set null')->onUpdate('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mahasiswa_tbl', function(Blueprint $table){
            $table->dropColumn('id_gelombang');
        });
    }
};
