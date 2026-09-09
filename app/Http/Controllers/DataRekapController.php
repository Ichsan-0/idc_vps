<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Client\Pool;
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
     * Endpoint API Public Rekapitulasi Mahasiswa (dengan throttle & caching & sanitasi data).
     */
    public function getData(Request $request)
    {
        $currentYear = (int) date('Y');
        $startYear   = $currentYear - 6; // 2026 - 6 = 2020
        $years       = range($startYear, $currentYear); // [2020..2026]

        $cacheKey = "public_rekap_mahasiswa_{$startYear}_{$currentYear}";

        // Hanya admin/user terautentikasi yang bisa paksa refresh cache dari Sevima API
        if (Auth::check() && $request->has('refresh')) {
            Cache::forget($cacheKey);
        }

        try {
            $result = Cache::remember($cacheKey, 3600, function () use ($years, $startYear, $currentYear) {
                $baseUrl   = config('services.sevima.base_url');
                $appKey    = config('services.sevima.app_key');
                $secretKey = config('services.sevima.app_secret');

                if (empty($appKey) || empty($secretKey)) {
                    Log::error('[DataRekap] Sevima credentials missing');
                    return null;
                }

                // Step 1: Ambil halaman 1 untuk mendapatkan info total halaman & total record
                $firstRes = Http::withoutVerifying()->timeout(15)->withHeaders([
                    'X-App-Key'    => $appKey,
                    'X-Secret-Key' => $secretKey,
                    'Accept'       => 'application/json',
                ])->get($baseUrl . '/mahasiswa', [
                    'f-status_mahasiswa' => 'Aktif',
                    'page'               => 1,
                ]);

                if ($firstRes->failed()) {
                    Log::error('[DataRekap] Sevima first request failed', ['status' => $firstRes->status()]);
                    return null;
                }

                $json     = $firstRes->json();
                $lastPage = (int) ($json['meta']['last_page'] ?? 1);
                $allData  = [];

                foreach ($json['data'] ?? [] as $item) {
                    $allData[] = $item['attributes'] ?? [];
                }

                // Step 2: Fetch sisa halaman secara paralel dengan Http::pool (chunk 15 halaman)
                if ($lastPage > 1) {
                    $remainingPages = range(2, $lastPage);
                    $pageChunks     = array_chunk($remainingPages, 15);

                    foreach ($pageChunks as $chunk) {
                        $poolResponses = Http::pool(function (Pool $pool) use ($baseUrl, $appKey, $secretKey, $chunk) {
                            return array_map(function ($page) use ($pool, $baseUrl, $appKey, $secretKey) {
                                return $pool->as("p_$page")->withoutVerifying()->timeout(15)->withHeaders([
                                    'X-App-Key'    => $appKey,
                                    'X-Secret-Key' => $secretKey,
                                    'Accept'       => 'application/json',
                                ])->get($baseUrl . '/mahasiswa', [
                                    'f-status_mahasiswa' => 'Aktif',
                                    'page'               => $page,
                                ]);
                            }, $chunk);
                        });

                        foreach ($chunk as $page) {
                            $res = $poolResponses["p_$page"] ?? null;
                            if ($res && $res->successful()) {
                                $j = $res->json();
                                foreach ($j['data'] ?? [] as $item) {
                                    $allData[] = $item['attributes'] ?? [];
                                }
                            }
                        }
                    }
                }

                // Step 3: Agregasi data (HANYA hitung jumlah per prodi & angkatan, HAPUS PII)
                $grouped   = [];
                $prodiList = [];

                foreach ($allData as $attrs) {
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

                // Sort berdasarkan total mahasiswa terbanyak
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
}
