<?php

namespace App\Http\Controllers;

use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LowonganPPLApiController extends Controller
{

    public function getVacancies(Request $request)
    {

        $data = DB::table('lowongan_ppl_tbl as lppl')
            ->join('lamaran_ppl_tbl as lpt', 'lpt.id_lowongan_ppl', '=', 'lppl.id')
            ->join('sekolah_tbl as st', 'lppl.id_sekolah', '=', 'st.id')
            ->select(
                "lppl.id as id_ppl",
                "lppl.id_prodi",
                'lppl.quota',
                "st.name as nama_sekolah",
                "st.regency",
                "st.sub_district",
                "st.village",
                "lppl.name as nama_lowongan",
                "lpt.id_lowongan_ppl",
                "lpt.status",
                DB::raw('COUNT(lpt.id) as terisi')
            )
            ->where('lpt.status', 'accepted')
            ->groupBy(
                "lppl.id",
                "lppl.id_prodi",
                'lppl.quota',
                "st.name",
                "st.regency",
                "st.sub_district",
                "st.village",
                "lppl.name",
                "lpt.id_lowongan_ppl",
                "lpt.status"
            );


        if ($request->has('search') && !empty($request->search)) {
            $data->where(function ($q) use ($request) {
                $q->where('lppl.name', 'like', '%' . $request->search . '%')
                    ->orWhere('st.name', 'like', '%' . $request->search . '%');
            });
        }


        if ($request->has('nim') && !empty($request->nim)) {
            $data_mahasiswa = Mahasiswa::where('nim', $request->nim)->first();
            $data->where('id_prodi', $data_mahasiswa->id_prodi);
        }
        $data = $data->paginate(10);

        return response()->json($data);
    }
}
