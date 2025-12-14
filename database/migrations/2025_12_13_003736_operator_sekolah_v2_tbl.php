<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('operator_sekolah_tbl')) {
            
            Schema::table('operator_sekolah_tbl', function (Blueprint $table) {
                $table->dropForeign(['id_sekolah']);
                
                $table->foreign('id_sekolah')
                      ->references('id')
                      ->on('sekolah_master')
                      ->onDelete('cascade')
                      ->onUpdate('cascade');
            });
            
            $this->validateDataMigration();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('operator_sekolah_tbl')) {
            Schema::table('operator_sekolah_tbl', function (Blueprint $table) {
                $table->dropForeign(['id_sekolah']);
                
                $table->foreign('id_sekolah')
                      ->references('id')
                      ->on('sekolah_tbl')
                      ->onDelete('cascade')
                      ->onUpdate('cascade');
            });
        }
    }

    /**
     * Validasi data sebelum migrasi
     */
    private function validateDataMigration(): void
    {
        $invalidRecords = DB::table('operator_sekolah_tbl as o')
            ->leftJoin('sekolah_master as sm', 'o.id_sekolah', '=', 'sm.id')
            ->whereNull('sm.id')
            ->select('o.*')
            ->get();
        
        if ($invalidRecords->isNotEmpty()) {
            
            DB::table('operator_sekolah_tbl')
                ->whereIn('id', $invalidRecords->pluck('id'))
                ->update(['id_sekolah' => null]);
            
            logger()->warning('Found invalid foreign key records during migration', [
                'table' => 'operator_sekolah_tbl',
                'invalid_count' => $invalidRecords->count(),
                'action_taken' => 'set_to_null'
            ]);
        }
    }
};