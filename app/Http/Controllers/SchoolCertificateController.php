<?php

namespace App\Http\Controllers;

use App\Models\AmprahamPPL;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchoolCertificateController extends Controller
{
    public function viewCertificate(Request $request)
    {
        try {
            // $data = AmprahamPPL::Select('name', 'id')->find($request->id);
            $data = DB::table('ampraham_ppl_tbl')->where('id', $request->id)->first();
            // $data = AmprahamPPL::find($request->id);

            if($data){
                if($data->jabatan == "Guru Pamong"){
                    $customPaper = array(0, 0, 862.01, 620.51);
                    $pdf = Pdf::loadView('teacher_certificate', (array)$data)->setPaper($customPaper);
                    // return response()->json((array)$data);
                    return $pdf->download('Sertifikat_' . $data->name . '.pdf');

                }else{
                    $customPaper = array(0, 0, 862.01, 620.51);
                    $pdf = Pdf::loadView('teacher_kepsek', (array)$data)->setPaper($customPaper);
                    // return response()->json((array)$data);
                    return $pdf->download('Sertifikat_' . $data->name . '.pdf');
                }
                
            }else{
                throw new Exception('Data tidak ditemukan');
            }

            
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
        
        // return view('teacher_certificate');
    }
}
