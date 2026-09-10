<?php

namespace App\Console\Commands;

use App\Http\Controllers\DataRekapController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class GenerateDataRekapCommand extends Command
{
    /**
     * Nama dan signature dari perintah console artisan.
     *
     * @var string
     */
    protected $signature = 'rekap:generate';

    /**
     * Deskripsi perintah console.
     *
     * @var string
     */
    protected $description = 'Generate dan simpan data rekapitulasi mahasiswa dari Sevima API ke Server Cache (berlaku 6 Bulan)';

    /**
     * Jalankan perintah console.
     */
    public function handle()
    {
        $this->info('🚀 Memulai pemrosesan data mahasiswa aktif dari Sevima API...');

        $currentYear = (int) date('Y');
        $startYear   = $currentYear - 6;
        $years       = range($startYear, $currentYear);

        $cacheKey = "server_rekap_mahasiswa_v3_{$startYear}_{$currentYear}";

        // Hapus cache lama jika ada
        Cache::forget($cacheKey);

        $controller = new DataRekapController();
        $startTime  = microtime(true);

        $result = Cache::remember($cacheKey, now()->addMonths(6), function () use ($controller, $startYear, $currentYear, $years) {
            return $controller->generateRekapData($startYear, $currentYear, $years);
        });

        $elapsed = round(microtime(true) - $startTime, 2);

        if ($result && !empty($result['rows'])) {
            $totalMahasiswa = array_sum(array_column($result['rows'], 'total'));
            $this->info("✅ Sukses! Data rekapitulasi berhasil disimpan di Server Cache (Berlaku 6 Bulan).");
            $this->info("   - Total Mahasiswa Aktif: " . number_format($totalMahasiswa));
            $this->info("   - Total Program Studi  : " . count($result['prodi_list']));
            $this->info("   - Waktu Pemrosesan     : {$elapsed} detik.");
            return Command::SUCCESS;
        }

        $this->error('❌ Gagal menghasilkan data rekapitulasi dari Sevima API.');
        return Command::FAILURE;
    }
}
