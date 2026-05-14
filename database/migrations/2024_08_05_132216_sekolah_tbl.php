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
        Schema::create('sekolah_tbl', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('province')->nullable();
            $table->string('regency')->nullable();
            $table->string('sub_district')->nullable();
            $table->string('village')->nullable();
            $table->string('username_supervisor')->nullable();
            $table->timestamps();

            $table->foreign('username_supervisor')->references('username')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sekolah_tbl');
    }
};
