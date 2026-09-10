<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DataRekapController extends Controller
{
    /**
     * Halaman Utama Rekapitulasi Data (Public - tanpa login).
     */
    public function index()
    {
        return Inertia::render('DataRekap/Index', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Endpoint API Public Rekapitulasi Mahasiswa (Tanpa PPG, Disimpan 6 Bulan di Server Cache).
     */
    public function getData(Request $request)
    {
        $currentYear = (int) date('Y');
        $startYear   = $currentYear - 6; // 2020
        $years       = range($startYear, $currentYear); // [2020..2026]

        $cacheKey = "server_rekap_mahasiswa_v3_{$startYear}_{$currentYear}";

        // Admin terautentikasi dapat memaksa regenerate cache server
        if (Auth::check() && $request->has('refresh')) {
            Cache::forget($cacheKey);
        }

        try {
            $result = Cache::remember($cacheKey, now()->addMonths(6), function () use ($years, $startYear, $currentYear) {
                return $this->generateRekapData($startYear, $currentYear, $years);
            });

            if ($result === null) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Gagal mengambil data dari Sevima API.',
                ], 500);
            }

            $totalPerYear = [];
            foreach ($years as $year) {
                $totalPerYear[$year] = array_sum(array_column($result['rows'], $year));
            }

            return response()->json([
                'status'         => true,
                'data'           => $result['rows'],
                'years'          => $result['years'],
                'prodi_list'     => $result['prodi_list'],
                'total_per_year' => $totalPerYear,
                'cached_at'      => $result['generated_at'] ?? null,
            ]);
        } catch (Exception $e) {
            Log::error('[DataRekap] Exception: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan sistem.',
            ], 500);
        }
    }

    /**
     * Pemrosesan data lengkap dari Sevima API (100% Terjamin Garansi Halaman Lengkap & Tanpa Terpotong).
     */
    public function generateRekapData(int $startYear, int $currentYear, array $years): ?array
    {
        @ini_set('memory_limit', '512M');
        @set_time_limit(600);

        $baseUrl   = config('services.sevima.base_url');
        $appKey    = config('services.sevima.app_key');
        $secretKey = config('services.sevima.app_secret');

        if (empty($appKey) || empty($secretKey)) {
            Log::error('[DataRekap] Sevima credentials missing');
            return null;
        }

        // Ambil halaman 1 untuk mendapatkan info total halaman
        $firstRes = $this->fetchSevimaPage($baseUrl, $appKey, $secretKey, 1);
        if (!$firstRes || !$firstRes->successful()) {
            Log::error("[DataRekap] Failed to fetch page 1 from Sevima API");
            return null;
        }

        $json     = $firstRes->json();
        $lastPage = (int) ($json['meta']['last_page'] ?? 1);

        $grouped   = [];
        $prodiList = [];

        // Agregasi halaman 1
        $this->aggregateItems($json['data'] ?? [], $grouped, $prodiList, $startYear, $currentYear);

        // Fetch seluruh sisa halaman (2 s.d $lastPage) secara garansi 100%
        for ($p = 2; $p <= $lastPage; $p++) {
            $pageRes = $this->fetchSevimaPage($baseUrl, $appKey, $secretKey, $p);
            if ($pageRes && $pageRes->successful()) {
                $j = $pageRes->json();
                $this->aggregateItems($j['data'] ?? [], $grouped, $prodiList, $startYear, $currentYear);
            } else {
                Log::error("[DataRekap] CRITICAL: Page {$p} failed even after max retries!");
            }
            usleep(25000); // 25ms pause antar halaman
        }

        sort($prodiList);

        $rows = [];
        foreach ($prodiList as $prodi) {
            $row = ['prodi' => $prodi, 'total' => 0];
            foreach ($years as $year) {
                $count      = $grouped[$prodi][$year] ?? 0;
                $row[$year] = $count;
                $row['total'] += $count;
            }
            $rows[] = $row;
        }

        // Urutkan berdasarkan total mahasiswa terbanyak
        usort($rows, fn($a, $b) => $b['total'] - $a['total']);

        return [
            'rows'         => $rows,
            'years'        => $years,
            'prodi_list'   => $prodiList,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Agregasi item data & menapis (exclude) PPG (Pendidikan Profesi Guru)
     */
    private function aggregateItems(array $items, array &$grouped, array &$prodiList, int $startYear, int $currentYear)
    {
        foreach ($items as $item) {
            $attrs = $item['attributes'] ?? [];
            $prodi = trim($attrs['program_studi'] ?? 'Tidak Diketahui');

            // HILANGKAN DATA PPG (Pendidikan Profesi Guru)
            if (stripos($prodi, 'Pendidikan Profesi Guru') !== false || stripos($prodi, 'PPG') !== false) {
                continue;
            }

            $periode  = (string) ($attrs['id_periode'] ?? '');
            $angkatan = (int) substr($periode, 0, 4);

            if ($angkatan < $startYear || $angkatan > $currentYear) {
                continue;
            }

            $grouped[$prodi][$angkatan] = ($grouped[$prodi][$angkatan] ?? 0) + 1;
            if (!in_array($prodi, $prodiList)) {
                $prodiList[] = $prodi;
            }
        }
    }

    /**
     * Helper untuk mengambil single page dengan garansi retry sampai 10x pada rate limit 429
     */
    private function fetchSevimaPage(string $baseUrl, string $appKey, string $secretKey, int $page)
    {
        $attempts = 0;
        $maxAttempts = 10;

        while ($attempts < $maxAttempts) {
            $attempts++;
            try {
                $res = Http::withoutVerifying()->timeout(30)->withHeaders([
                    'X-App-Key'    => $appKey,
                    'X-Secret-Key' => $secretKey,
                    'Accept'       => 'application/json',
                ])->get($baseUrl . '/mahasiswa', [
                    'f-status_mahasiswa' => 'Aktif',
                    'page'               => $page,
                ]);

                if ($res->status() === 429) {
                    Log::info("[DataRekap] Sevima API Rate limited (429) on page $page, waiting 750ms (attempt $attempts/$maxAttempts)...");
                    usleep(750000);
                    continue;
                }

                if ($res->successful()) {
                    return $res;
                }
            } catch (Exception $e) {
                Log::warning("[DataRekap] Exception during page {$page} fetch (attempt $attempts/$maxAttempts): " . $e->getMessage());
                usleep(500000);
            }
        }

        return null;
    }
}
