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
        Schema::create('gelombang_tbl', function(Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('tahun')->default('2025');
            $table->boolean('active')->default(false);
            $table->timestamps();
            

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gelombang_tbl');
    }
};
