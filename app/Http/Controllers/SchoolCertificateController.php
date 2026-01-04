<?php

namespace App\Http\Controllers;

use App\Models\AmprahamPPL;
use App\Models\Gelombang;
use App\Models\SertifikatSekolahModel;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;

class SchoolCertificateController extends Controller
{
    public function viewCertificate(Request $request)
    {
        $dataCertificate = [];

        $data = AmprahamPPL::select(
                    'ampraham_ppl_tbl.id',
                    'ampraham_ppl_tbl.jabatan',
                    'ampraham_ppl_tbl.name',
                    'ampraham_ppl_tbl.id_gelombang',

                )
                ->join('sekolah_tbl as s_tbl', 'ampraham_ppl_tbl.id_sekolah', '=', 's_tbl.id')
                ->where('ampraham_ppl_tbl.id', $request->id)
                ->first();
        $dataGelombang = Gelombang::select('name')->find($data->id_gelombang);
        
        $dataSertifikatSekolah = SertifikatSekolahModel::select(
            'tanggal_surat',
            'open_print_certificate',
            'nomor_surat',
            'periode_ppl'
        )
        ->where('id_gelombang', $data->id_gelombang)->first();


        try {
            // Data dummy
            $dataCertificate = [
                'name' => $data->name,
                'certificate_number' => $dataSertifikatSekolah->nomor_surat,
                'jabatan' => $data->jabatan,
                'tanggal_surat' => $dataSertifikatSekolah->tanggal_surat,
                'nama_gelombang' => $dataGelombang->name,
                'periode_ppl' => $dataSertifikatSekolah->periode_ppl
            ];




            // Ukuran kertas custom (sesuai gambar template)
            $customPaper = [0, 0, 862.01, 620.51]; // Width, Height dalam points
            $pdf = null;
            if($data->jabatan === 'Guru Pamong'){
                $pdf = Pdf::loadView('teacher_certificate', $dataCertificate);

            }else{
                $pdf = Pdf::loadView('teacher_kepsek', $dataCertificate);

            }

            
            
            // KONFIGURASI PENTING UNTUK 1 HALAMAN
            $pdf->setPaper($customPaper);
            
            // Hapus semua margin
            $pdf->setOption('margin_top', 0);
            $pdf->setOption('margin_right', 0);
            $pdf->setOption('margin_bottom', 0);
            $pdf->setOption('margin_left', 0);
            
            // Konfigurasi untuk mencegah halaman tambahan
            $pdf->setOption('defaultFont', 'Helvetica');
            $pdf->setOption('isHtml5ParserEnabled', true);
            $pdf->setOption('isRemoteEnabled', true);
            $pdf->setOption('isPhpEnabled', true);
            $pdf->setOption('dpi', 96);
            
            // NONAKTIFKAN FITUR YANG MEMBUAT HALAMAN TAMBAHAN
            $pdf->setOption('isFontSubsettingEnabled', false);
            $pdf->setOption('debugKeepTemp', false);
            $pdf->setOption('debugCss', false);
            $pdf->setOption('debugLayout', false);
            
            // Atur untuk single page
            $pdf->setOption('enable_html5_parser', true);
            $pdf->setOption('enable_remote', true);
            
            // Untuk preview
            if ($request->has('preview')) {
                return $pdf->stream('certificate_preview.pdf');
            }
            
            // Untuk download
            return $pdf->download('Sertifikat_' . $dataCertificate['name'] . '.pdf');

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}