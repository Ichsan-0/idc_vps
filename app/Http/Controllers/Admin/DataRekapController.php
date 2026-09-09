<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SevimaService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DataRekapController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/pages/DataRekap/Index');
    }

    /**
     * Ambil data rekap mahasiswa aktif per prodi per angkatan dari Sevima API.
     * Hasil dikelompokkan per prodi dan per tahun (2020–tahun sekarang).
     */
    public function getData(Request $request, SevimaService $sevima)
    {
        $currentYear = (int) date('Y');
        $startYear   = $currentYear - 7; // 2026 - 7 = 2019 → user minta 2020, kita ambil dari startYear+1
        $startYear   = $startYear + 1;   // 2020

        $years = range($startYear, $currentYear); // [2020, 2021, ..., 2026]

        // Cache selama 10 menit agar tidak spam ke Sevima API
        $cacheKey = "rekap_mahasiswa_{$startYear}_{$currentYear}";

        try {
            $result = Cache::remember($cacheKey, 600, function () use ($sevima, $years) {
                $response = $sevima->getMahasiswa();

                if ($response->failed()) {
                    Log::error('[DataRekap] Sevima API gagal', [
                        'status' => $response->status(),
                        'body'   => $response->body(),
                    ]);
                    return null;
                }

                $json = $response->json();
                $mahasiswaList = $json['data'] ?? [];

                if (empty($mahasiswaList)) {
                    return ['rows' => [], 'years' => $years, 'prodi_list' => []];
                }

                // Kelompokkan: prodi → angkatan → count
                $grouped = [];
                $prodiList = [];

                foreach ($mahasiswaList as $item) {
                    $attrs = $item['attributes'] ?? $item ?? [];

                    $prodi   = trim($attrs['program_studi'] ?? $attrs['nama_prodi'] ?? 'Tidak Diketahui');
                    $angkatan = (int) ($attrs['angkatan'] ?? 0);
                    $status  = strtolower(trim($attrs['status'] ?? ''));

                    // Hanya mahasiswa aktif
                    if (!in_array($status, ['aktif', 'active', ''])) {
                        continue;
                    }

                    if ($angkatan < min($years) || $angkatan > max($years)) {
                        continue;
                    }

                    if (!isset($grouped[$prodi])) {
                        $grouped[$prodi] = [];
                    }
                    if (!isset($grouped[$prodi][$angkatan])) {
                        $grouped[$prodi][$angkatan] = 0;
                    }
                    $grouped[$prodi][$angkatan]++;

                    if (!in_array($prodi, $prodiList)) {
                        $prodiList[] = $prodi;
                    }
                }

                sort($prodiList);

                // Format rows untuk tabel
                $rows = [];
                foreach ($prodiList as $prodi) {
                    $row = ['prodi' => $prodi, 'total' => 0];
                    foreach ($years as $year) {
                        $count = $grouped[$prodi][$year] ?? 0;
                        $row[$year] = $count;
                        $row['total'] += $count;
                    }
                    $rows[] = $row;
                }

                return [
                    'rows'       => $rows,
                    'years'      => $years,
                    'prodi_list' => $prodiList,
                ];
            });

            if ($result === null) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Gagal menghubungi Sevima API.',
                ], 500);
            }

            // Hitung total per tahun
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
            Log::error('[DataRekap] Exception', ['message' => $e->getMessage()]);
            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
