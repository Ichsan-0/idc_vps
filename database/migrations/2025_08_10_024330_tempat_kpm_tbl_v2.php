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
        Schema::table('tempat_kpm_tbl', function (Blueprint $table) {
            $table->unsignedBigInteger('id_desa')->nullable();
            $table->integer('quota_lk')->nullable();
            $table->integer('quota_pr')->nullable();
            $table->unsignedBigInteger('id_gelombang')->nullable();
            $table->string('name')->nullable()->change();
            $table->text('description')->nullable()->change();

            $table->foreign('id_desa')
                ->references('id')
                ->on('master_desa_tbl')
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
        Schema::table('tempat_kpm_tbl', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['id_desa']);
            $table->dropForeign(['id_gelombang']);

            // Then drop the columns
            $table->dropColumn(['id_desa', 'quota_lk', 'quota_pr', 'id_gelombang']);
            $table->string('name')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
        });
    }
};
