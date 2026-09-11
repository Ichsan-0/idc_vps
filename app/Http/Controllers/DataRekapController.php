<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class DataRekapController extends Controller
{
    /**
     * Tampilkan Halaman Rekapitulasi Data Mahasiswa (Tanpa Login).
     */
    public function index()
    {
        return Inertia::render('DataRekap/Index');
    }

    /**
     * Trigger regenerasi cache di background server tanpa membuat browser timeout.
     */
    public function triggerBackgroundSync()
    {
        if (Cache::has('rekap_sync_running')) {
            return response()->json([
                'status'  => true,
                'syncing' => true,
                'message' => 'Proses sinkronisasi Sevima API sedang berjalan di background server VPS.',
            ]);
        }

        Cache::put('rekap_sync_running', true, now()->addMinutes(15));
        Cache::put('rekap_sync_start_time', now()->toIso8601String(), now()->addMinutes(15));

        $artisanPath = base_path('artisan');
        $phpBinary   = defined('PHP_BINARY') && PHP_BINARY ? PHP_BINARY : 'php';

        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            pclose(popen("start /B {$phpBinary} \"{$artisanPath}\" rekap:generate > NUL 2>&1", "r"));
        } else {
            exec("{$phpBinary} \"{$artisanPath}\" rekap:generate > /dev/null 2>&1 &");
        }

        return response()->json([
            'status'  => true,
            'syncing' => true,
            'message' => 'Proses regenerasi data dari Sevima API telah berhasil dijalankan di background server.',
        ]);
    }

    /**
     * Endpoint untuk mengecek status background sync.
     */
    public function getSyncStatus()
    {
        return response()->json([
            'status'          => true,
            'running'         => Cache::has('rekap_sync_running'),
            'last_status'     => Cache::get('rekap_last_status', 'none'),
            'last_updated_at' => Cache::get('rekap_last_updated_at', null),
        ]);
    }

    /**
     * Endpoint API Public Rekapitulasi Mahasiswa (Tanpa PPG, Disimpan Persistent & Server Cache).
     */
    public function getData(Request $request)
    {
        @ini_set('memory_limit', '512M');
        @set_time_limit(300);

        $currentYear = (int) date('Y');
        $startYear   = $currentYear - 6; // 2020
        $years       = range($startYear, $currentYear); // [2020..2026]

        $cacheKey       = "server_rekap_mahasiswa_v3_{$startYear}_{$currentYear}";
        $persistentFile = storage_path('app/rekap_mahasiswa_persistent.json');

        // Jika tombol reload diklik, panggil background sync agar browser TIDAK 504 Timeout
        if ($request->has('refresh') || $request->boolean('refresh')) {
            $this->triggerBackgroundSync();
        }

        try {
            $result = Cache::get($cacheKey);

            // Fallback 1: Jika cache terhapus (e.g. php artisan optimize:clear), baca dari file persistent
            if (!$result && file_exists($persistentFile)) {
                $fileContent = @file_get_contents($persistentFile);
                if ($fileContent) {
                    $decoded = json_decode($fileContent, true);
                    if ($decoded && !empty($decoded['rows'])) {
                        $result = $decoded;
                        // Restore kembali ke Laravel Cache
                        Cache::put($cacheKey, $result, now()->addMonths(6));
                    }
                }
            }

            // Fallback 2: Jika baik cache maupun file persistent belum ada, trigger background sync
            if (!$result) {
                if (!Cache::has('rekap_sync_running')) {
                    $this->triggerBackgroundSync();
                }
            }

            if ($result === null) {
                return response()->json([
                    'status'  => false,
                    'syncing' => Cache::has('rekap_sync_running'),
                    'message' => Cache::has('rekap_sync_running')
                        ? 'Proses sinkronisasi data Sevima API sedang berlangsung di background server... Data akan muncul otomatis setelah selesai.'
                        : 'Gagal mengambil data dari Sevima API.',
                ], Cache::has('rekap_sync_running') ? 200 : 500);
            }

            $totalPerYear = [];
            foreach ($years as $year) {
                $totalPerYear[$year] = array_sum(array_column($result['rows'], $year));
            }

            return response()->json([
                'status'         => true,
                'syncing'        => Cache::has('rekap_sync_running'),
                'data'           => $result['rows'],
                'years'          => $result['years'],
                'prodi_list'     => $result['prodi_list'],
                'total_per_year' => $totalPerYear,
                'cached_at'      => $result['generated_at'] ?? null,
            ]);

        } catch (Throwable $e) {
            Log::error('Error DataRekapController: ' . $e->getMessage());

            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper untuk mengambil seluruh halaman mahasiswa aktif dan mengagregasi data on-the-fly (Hemat Memori <1MB).
     */
    public function generateRekapData(int $startYear, int $currentYear, array $years, ?callable $progressCallback = null): ?array
    {
        @ini_set('memory_limit', '512M');

        $aggregated = [];
        $totalCollectedCount = 0;
        $page = 1;
        $totalPages = 1;
        $lastError = null;

        $appKey    = config('services.sevima.app_key');
        $secretKey = config('services.sevima.app_secret');

        if (empty($appKey) || empty($secretKey)) {
            $msg = "Kredensial SEVIMA_APP_KEY atau SEVIMA_APP_SECRET kosong di file .env server!";
            if ($progressCallback) {
                $progressCallback('error', $msg);
            }
            Log::error($msg);
            return null;
        }

        do {
            $response = $this->fetchSevimaPage($page, $lastError, $progressCallback);

            if (!$response || !isset($response['data'])) {
                $errorMsg = $lastError ?? "API Sevima tidak mengembalikan data di halaman {$page}.";
                if ($progressCallback) {
                    $progressCallback('error', $errorMsg);
                }
                Log::warning("Sevima API error di halaman {$page}: {$errorMsg}");
                break;
            }

            $items = $response['data'];
            $pageCount = count($items);
            $totalCollectedCount += $pageCount;

            if (isset($response['meta']['last_page'])) {
                $totalPages = (int) $response['meta']['last_page'];
            }

            // Agregasi langsung per halaman (On-The-Fly) untuk menghemat RAM
            foreach ($items as $item) {
                $attrs = $item['attributes'] ?? $item;

                $namaProdi = trim($attrs['program_studi'] ?? $attrs['nama_program_studi'] ?? 'Lainnya');

                // Exclude Program Studi PPG (Pendidikan Profesi Guru)
                if (stripos($namaProdi, 'PPG') !== false || stripos($namaProdi, 'Pendidikan Profesi Guru') !== false) {
                    continue;
                }

                $idPeriode = (string) ($attrs['id_periode'] ?? '');
                $angkatan  = (int) substr($idPeriode, 0, 4);

                if ($angkatan < $startYear || $angkatan > $currentYear) {
                    continue;
                }

                if (!isset($aggregated[$namaProdi])) {
                    $aggregated[$namaProdi] = array_fill_keys($years, 0);
                }

                $aggregated[$namaProdi][$angkatan]++;
            }

            if ($progressCallback) {
                $progressCallback('progress', [
                    'page'         => $page,
                    'total_pages'  => $totalPages,
                    'count'        => $pageCount,
                    'total_so_far' => $totalCollectedCount,
                ]);
            }

            // Bebaskan memori array temporer per halaman
            unset($items, $response);

            $page++;

            // Delay 150ms antar halaman untuk menjaga dari rate limit 429
            usleep(150000);

        } while ($page <= $totalPages);

        if (empty($aggregated)) {
            return null;
        }

        ksort($aggregated);

        $rows = [];
        foreach ($aggregated as $prodiName => $yearCounts) {
            $rowTotal = array_sum($yearCounts);
            $row = array_merge([
                'program_studi' => $prodiName,
            ], $yearCounts, [
                'total' => $rowTotal,
            ]);
            $rows[] = $row;
        }

        $finalResult = [
            'rows'         => $rows,
            'years'        => $years,
            'prodi_list'   => array_keys($aggregated),
            'generated_at' => now()->toIso8601String(),
        ];

        // Simpan juga secara persistent ke file JSON
        $persistentFile = storage_path('app/rekap_mahasiswa_persistent.json');
        @file_put_contents($persistentFile, json_encode($finalResult, JSON_PRETTY_PRINT));

        return $finalResult;
    }

    /**
     * Fetch single page Sevima API dengan Exponential Backoff jika HTTP 429.
     */
    private function fetchSevimaPage(int $page, ?string &$lastError = null, ?callable $progressCallback = null): ?array
    {
        $baseUrl   = config('services.sevima.base_url', 'https://api.sevimaplatform.com/siakadcloud/v1');
        $appKey    = config('services.sevima.app_key');
        $secretKey = config('services.sevima.app_secret');

        $maxAttempts = 15;
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            $attempt++;
            try {
                $response = Http::withoutVerifying()
                    ->timeout(30)
                    ->withHeaders([
                        'X-App-Key'    => $appKey,
                        'X-Secret-Key' => $secretKey,
                        'Accept'       => 'application/json',
                    ])
                    ->get(rtrim($baseUrl, '/') . '/mahasiswa', [
                        'f-status_mahasiswa' => 'Aktif',
                        'page'               => $page,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                $status = $response->status();
                $body = substr($response->body(), 0, 200);
                $lastError = "HTTP Status {$status}: {$body}";

                if ($status === 429) {
                    $sleepSecs = min($attempt * 2, 10);
                    if ($progressCallback) {
                        $progressCallback('warning', "Halaman {$page} terbentur Rate-Limit (HTTP 429). Menunggu {$sleepSecs}s (Percobaan {$attempt}/{$maxAttempts})...");
                    }
                    sleep($sleepSecs);
                    continue;
                }

                if ($status === 401 || $status === 403 || $status === 404) {
                    break;
                }

            } catch (Throwable $e) {
                $lastError = "Exception: " . $e->getMessage();
                Log::warning("Fetch Sevima page {$page} attempt {$attempt} error: " . $e->getMessage());
                sleep(2);
            }
        }

        return null;
    }
}
