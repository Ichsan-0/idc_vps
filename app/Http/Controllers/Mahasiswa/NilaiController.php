<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NilaiController extends Controller
{
    public function index(Request $request)
    {

        $token = $request->session()->get('access_token');

        return Inertia::render('Mahasiswa/Nilai', [
            'access_token' => $token
        ]);
    }

    public function getNilai(Request $request)
    {
        try {

            if ($request->has('nim') && !empty($request->nim)) {
                $data_mahasiswa = DB::table('nilai_ppkpm_view')
                    ->where('nim', $request->nim)
                    ->first();
                $certificate_setting = DB::table('sertifikat_tbl')
                        ->first();
                if($certificate_setting === null){
                    $certificate_setting['open_print_certificate'] = 0;
                }
                

                if ($data_mahasiswa) {
                    $data = array_merge((array)$data_mahasiswa, (array)$certificate_setting);
                    return response()->json([
                        'data' => [
                            'message' => 'Berhasil memperoleh data mahasiswa',
                            'mahasiswa' => $data
                        ]
                    ], 200);
                } else {
                    throw new Exception('Mahasiswa tidak ditemukan', 400);
                }
            } else {
                throw new Exception('NIM mandatory', 400);
            }
        } catch (Exception $e) {
            return response()->json([
                'data' => ['message' => $e->getMessage()]
            ], $e->getCode());
        }
    }
}
