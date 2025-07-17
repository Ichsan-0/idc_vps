<?php

namespace App\Http\Controllers;

use App\Models\TempatKPM;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LowonganKPMApiController extends Controller
{
    public function index(Request $request)
    {
        $query = TempatKPM::query();

        if ($request->has('regency') && !empty($request->regency)) {
            $query->where('regency', $request->regency);
        }
        if ($request->has('sub_district') && !empty($request->sub_district)) {
            $query->where('sub_district', $request->sub_district);
        }
        if ($request->has('village') && !empty($request->village)) {
            $query->where('village', $request->village);
        }

        $data = $query->select(
            'tempat_kpm_tbl.*',
            DB::raw("(SELECT COUNT(*) FROM lamaran_kpm_tbl AS l_kpm WHERE l_kpm.status = 'accepted' AND l_kpm.id_tempat_kpm = tempat_kpm_tbl.id) AS terisi")

        )->paginate(20);

        return response()->json($data);
    }
}
