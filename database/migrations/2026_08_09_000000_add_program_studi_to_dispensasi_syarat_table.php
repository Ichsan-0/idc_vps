<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('dispensasi_syarat', 'program_studi')) {
            Schema::table('dispensasi_syarat', function (Blueprint $table) {
                $table->string('program_studi')->nullable()->after('nama');
            });
        }

        // Fetch all existing records with null or empty program_studi
        $records = DB::table('dispensasi_syarat')
            ->whereNull('program_studi')
            ->orWhere('program_studi', '')
            ->get();

        if ($records->isNotEmpty()) {
            $sevima = new \App\Services\SevimaService();
            foreach ($records as $record) {
                try {
                    $response = $sevima->getMahasiswaByNim($record->nim);
                    if ($response->successful()) {
                        $json = $response->json();
                        $attributes = $json['data']['attributes'] ?? $json['attributes'] ?? null;
                        if ($attributes && isset($attributes['program_studi'])) {
                            DB::table('dispensasi_syarat')
                                ->where('id', $record->id)
                                ->update(['program_studi' => trim($attributes['program_studi'])]);
                        }
                    }
                } catch (\Exception $e) {
                    // Silently fail so migration completes even if API is unreachable
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dispensasi_syarat', function (Blueprint $table) {
            $table->dropColumn('program_studi');
        });
    }
};
