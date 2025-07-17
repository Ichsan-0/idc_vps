<?php

namespace App\Http\Controllers;

use App\Exports\NilaiPPKPMPerProdi;
use App\Exports\RekapNilaiExport;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\Sertifikat;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpParser\Node\Expr\Throw_;

class CertificateController extends Controller
{
    public function index()
    {
        $data = [
            'var1' => 'test',
            '12' => 'test'
        ];
        return view('certificate', $data);
    }

    public function nilaiPPKPM()
    {
        return Inertia::render('Admin/pages/Certificate/RekapNilaiPPKPM', [
            'base_url' => url('/')
        ]);
    }

    public function downloadCertificate(Request $request)
    {
        $data = [];

        DB::beginTransaction();
        try {

            $kode = Mahasiswa::where('nim', $request->nim)->select('kode')->first();
            if ($kode->kode != null) {
                $data_certificate_setting = DB::table('sertifikat_tbl')->first();

                $data_certificate_setting->base_number = $kode->kode;

                $data_mahasiswa = DB::table('nilai_ppkpm_view')
                    ->where('nim', $request->nim)
                    ->first();
                $data = array_merge((array)$data_mahasiswa, (array)$data_certificate_setting);

                // return response()->json($kode);
                $pdf = Pdf::loadView('certificate', $data);
                DB::commit();
                return $pdf->download('certificate_PPKPM.pdf');
            } else if($kode->kode == null){
                $data_certificate_setting = DB::table('sertifikat_tbl')->first();


                $base_number = DB::table('mahasiswa_tbl')
                    ->select('kode')
                    ->orderByRaw('CAST(kode AS UNSIGNED) DESC')
                    ->first()->kode;
                if ($base_number === null) {
                    $base_number = $data_certificate_setting->base_number;
                } else {
                    $base_number = $base_number + 1;
                    $data_certificate_setting->base_number = $base_number;
                }

                $data_mhs = Mahasiswa::where('nim', $request->nim)
                    ->first();
                if ($data_mhs === null) {
                    throw new Exception('Mahasiswa tidak ditemukan', 404);
                    DB::rollBack();
                } else {
                    $data_mhs->update(['kode' => $base_number]);
                }



                $data_mahasiswa = DB::table('nilai_ppkpm_view')
                    ->where('nim', $request->nim)
                    ->first();
                $data = array_merge((array)$data_mahasiswa, (array)$data_certificate_setting);

                // return response()->json($kode);
                $pdf = Pdf::loadView('certificate', $data);
                DB::commit();
                return $pdf->download('certificate_PPKPM.pdf');
            }
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage(), 'kode' => $e->getCode()], $e->getCode());
        }
    }

    public function exportRekapNilai(Request $request)
    {
        $timestamp = Carbon::now('Asia/Jakarta')->format('Y-m-d_H-i-s');

        if ($request->has('id_prodi') && !empty($request->id_prodi)) {
            $prodi = Prodi::find($request->id_prodi);

            return Excel::download(
                new NilaiPPKPMPerProdi($request->id_prodi),
                "nilai_PPKPM_{$prodi->kode}_{$timestamp}.xlsx"
            );
        }

        return Excel::download(
            new RekapNilaiExport,
            "nilai_PPKPM_{$timestamp}.xlsx"
        );
    }

    public function getAllNilai(Request $request)
    {
        $query = DB::table('nilai_ppkpm_view');
        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('nilai_ppkpm_view.nim', 'like', '%' . $request->search_key . '%')
                    ->orWhere('nilai_ppkpm_view.nama_mahasiswa', 'like', '%' . $request->search_key . '%')
                    ->orWhere('nilai_ppkpm_view.nama_prodi', 'like', '%' . $request->search_key . '%');
                // ->orWhere('booking_tbl.student_nim', 'like', '%' . $request->search_key . '%');
            });
        }
        $data = $query->paginate(50);
        return response()->json($data, 200);
    }

    public function settings()
    {
        return Inertia::render('Admin/pages/Certificate/CertificateSettings');
    }

    public function getCertificateSettings(Request $request)
    {
        try {
            $currentCertificateSetting = Sertifikat::select(
                'kode_universitas',
                'kode_idc',
                'kode_jenis_surat',
                'bulan_tahun',
                'open_print_certificate',
                'base_number'
            )
                ->first();

            return response()->json([
                'data' => [
                    'settings' => $currentCertificateSetting
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'data' => [
                    'message' => $e->getMessage(),
                ]
            ], 500);
        }
    }
    public function saveCertificateSettings(Request $request)
    {
        try {
            $currentCertificateSetting = Sertifikat::first();
            if ($currentCertificateSetting) {
                $data = [
                    'kode_universitas' => $request->kode_universitas,
                    'kode_idc' => $request->kode_idc,
                    'kode_jenis_surat' => $request->kode_jenis_surat,
                    'bulan_tahun' => $request->bulan_tahun,
                    'open_print_certificate' => $request->open_print_certificate,
                    'base_number' => $request->base_number

                ];
                $result = $currentCertificateSetting->update($data);
                if ($result) {
                    return response()->json([
                        'data' => [
                            'message' => 'Berhasil Memperbaharui Setting Sertifikat',
                            'settings' => $result
                        ]
                    ], 200);
                } else {
                    throw new Exception('Gagal memperbaharui data sertifikat setting', 500);
                }
            } else {
                $result = Sertifikat::create([]);
                if ($result) {
                    return response()->json([
                        'data' => [
                            'message' => 'Berhasil Menambahakan Setting Sertifikat',
                            'settings' => $result
                        ],
                    ], 200);
                } else {
                    throw new Exception('Gagal Menambahakan data sertifikat setting', 500);
                }
            }
        } catch (Exception $e) {
            return response()->json([
                'data' => [
                    'message' => $e->getMessage(),
                ]
            ], 500);
        }
    }
}
