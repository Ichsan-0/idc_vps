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
        Schema::create('dispensasi_syarat', function (Blueprint $table) {
            $table->id();
            $table->string('nim')->unique();
            $table->string('nama')->nullable();
            $table->boolean('skip_microteaching')->default(false);
            $table->boolean('skip_sks')->default(false);
            $table->text('alasan')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispensasi_syarat');
    }
};
