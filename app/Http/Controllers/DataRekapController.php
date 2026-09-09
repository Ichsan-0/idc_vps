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
     * Endpoint API Public Rekapitulasi Mahasiswa.
     * Mengambil data per-periode (20201-20262) dengan memori yang ter-optimasi & penanganan Rate Limit (HTTP 429).
     */
    public function getData(Request $request)
    {
        $currentYear = (int) date('Y');
        $startYear   = $currentYear - 6; // 2020
        $years       = range($startYear, $currentYear); // [2020..2026]

        $cacheKey = "public_rekap_mahasiswa_v6_{$startYear}_{$currentYear}";

        // Admin dapat memaksa refresh cache
        if (Auth::check() && $request->has('refresh')) {
            Cache::forget($cacheKey);
        }

        try {
            $result = Cache::remember($cacheKey, 7200, function () use ($years, $startYear, $currentYear) {
                // Tingkatkan limit memori lokal jika diperlukan untuk proses agregasi
                @ini_set('memory_limit', '256M');

                $baseUrl   = config('services.sevima.base_url');
                $appKey    = config('services.sevima.app_key');
                $secretKey = config('services.sevima.app_secret');

                if (empty($appKey) || empty($secretKey)) {
                    Log::error('[DataRekap] Sevima credentials missing');
                    return null;
                }

                $periods = [];
                foreach ($years as $y) {
                    $periods[] = $y . '1';
                    $periods[] = $y . '2';
                }

                $grouped   = [];
                $prodiList = [];

                foreach ($periods as $period) {
                    $firstRes = $this->fetchSevimaPage($baseUrl, $appKey, $secretKey, $period, 1);

                    if (!$firstRes || !$firstRes->successful()) {
                        Log::warning("[DataRekap] Failed to fetch period {$period} page 1");
                        continue;
                    }

                    $json     = $firstRes->json();
                    $lastPage = (int) ($json['meta']['last_page'] ?? 1);

                    // Agregasi langsung dari halaman 1 (Hanya simpan prodi & periode, hemat memori <2MB)
                    $this->aggregateItems($json['data'] ?? [], $grouped, $prodiList, $startYear, $currentYear);

                    // Iterasi sisa halaman
                    for ($p = 2; $p <= $lastPage; $p++) {
                        $pageRes = $this->fetchSevimaPage($baseUrl, $appKey, $secretKey, $period, $p);
                        if ($pageRes && $pageRes->successful()) {
                            $j = $pageRes->json();
                            $this->aggregateItems($j['data'] ?? [], $grouped, $prodiList, $startYear, $currentYear);
                        } else {
                            Log::warning("[DataRekap] Failed period {$period} page {$p}");
                        }
                        usleep(25000); // 25ms pause antar request
                    }
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

                // Urutkan berdasarkan total terbanyak
                usort($rows, fn($a, $b) => $b['total'] - $a['total']);

                return [
                    'rows'       => $rows,
                    'years'      => $years,
                    'prodi_list' => $prodiList,
                ];
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
     * Helper untuk agregasi langsung tanpa menyimpan raw array di memori
     */
    private function aggregateItems(array $items, array &$grouped, array &$prodiList, int $startYear, int $currentYear)
    {
        foreach ($items as $item) {
            $attrs    = $item['attributes'] ?? [];
            $prodi    = trim($attrs['program_studi'] ?? 'Tidak Diketahui');
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
     * Helper untuk mengambil single page dengan retry 429 otomatis
     */
    private function fetchSevimaPage(string $baseUrl, string $appKey, string $secretKey, string $period, int $page)
    {
        $attempts = 0;
        $maxAttempts = 5;

        while ($attempts < $maxAttempts) {
            $attempts++;
            try {
                $res = Http::withoutVerifying()->timeout(25)->withHeaders([
                    'X-App-Key'    => $appKey,
                    'X-Secret-Key' => $secretKey,
                    'Accept'       => 'application/json',
                ])->get($baseUrl . '/mahasiswa', [
                    'f-status_mahasiswa' => 'Aktif',
                    'f-id_periode'        => $period,
                    'page'               => $page,
                ]);

                if ($res->status() === 429) {
                    Log::info("[DataRekap] Sevima API Rate limited (429), waiting 600ms (attempt $attempts)...");
                    usleep(600000);
                    continue;
                }

                return $res;
            } catch (Exception $e) {
                Log::warning("[DataRekap] Exception during page fetch (attempt $attempts): " . $e->getMessage());
                usleep(500000);
            }
        }

        return null;
    }
}
