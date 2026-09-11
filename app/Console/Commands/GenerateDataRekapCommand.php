<?php

namespace App\Console\Commands;

use App\Http\Controllers\DataRekapController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Throwable;

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
    protected $description = 'Generate dan simpan data rekapitulasi mahasiswa dari Sevima API ke Server Cache & Persistent File';

    /**
     * Jalankan perintah console.
     */
    public function handle()
    {
        $this->info('🚀 Memulai pemrosesan data mahasiswa aktif dari Sevima API...');

        // Tandai status background process sedang berjalan
        Cache::put('rekap_sync_running', true, now()->addMinutes(10));
        Cache::put('rekap_sync_start_time', now()->toIso8601String(), now()->addMinutes(10));

        try {
            $currentYear = (int) date('Y');
            $startYear   = $currentYear - 6;
            $years       = range($startYear, $currentYear);

            $cacheKey       = "server_rekap_mahasiswa_v3_{$startYear}_{$currentYear}";
            $persistentFile = storage_path('app/rekap_mahasiswa_persistent.json');

            // Hapus cache lama jika ada
            Cache::forget($cacheKey);

            $controller = new DataRekapController();
            $startTime  = microtime(true);

            $result = $controller->generateRekapData($startYear, $currentYear, $years, function ($type, $data) {
                if ($type === 'progress') {
                    $page      = $data['page'];
                    $total     = $data['total_pages'];
                    $count     = $data['count'];
                    $soFar     = number_format($data['total_so_far']);
                    $this->info("  📄 [Halaman {$page}/{$total}] Fetching {$count} mahasiswa (Total terkumpul: {$soFar})...");
                } elseif ($type === 'error') {
                    $this->error("  ⚠️ Error: {$data}");
                }
            });

            if ($result && !empty($result['rows'])) {
                Cache::put($cacheKey, $result, now()->addMonths(6));

                // Simpan juga secara persistent di storage/app/rekap_mahasiswa_persistent.json
                @file_put_contents($persistentFile, json_encode($result, JSON_PRETTY_PRINT));

                $elapsed = round(microtime(true) - $startTime, 2);
                $totalMahasiswa = array_sum(array_column($result['rows'], 'total'));
                $this->info("\n✅ Sukses! Data rekapitulasi berhasil disimpan di Server Cache & Persistent Storage File.");
                $this->info("   - Total Mahasiswa Aktif: " . number_format($totalMahasiswa));
                $this->info("   - Total Program Studi  : " . count($result['prodi_list']));
                $this->info("   - Waktu Pemrosesan     : {$elapsed} detik.");

                Cache::forget('rekap_sync_running');
                Cache::put('rekap_last_status', 'success', now()->addHours(24));
                Cache::put('rekap_last_updated_at', now()->toIso8601String(), now()->addMonths(6));

                return Command::SUCCESS;
            }

            $this->error("\n❌ Gagal menghasilkan data rekapitulasi dari Sevima API.");
            Cache::forget('rekap_sync_running');
            Cache::put('rekap_last_status', 'failed', now()->addHours(24));
            return Command::FAILURE;

        } catch (Throwable $e) {
            $this->error("\n❌ Exception: " . $e->getMessage());
            Cache::forget('rekap_sync_running');
            Cache::put('rekap_last_status', 'error', now()->addHours(24));
            return Command::FAILURE;
        }
    }
}
