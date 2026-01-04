<?php

namespace App\Http\Controllers;

use App\Models\Gelombang;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LowonganPPLApiController extends Controller
{

    public function getVacancies(Request $request)
    {
        $latestGelombang = Gelombang::latest()->first();

        if (!$latestGelombang) {
            return response()->json(['message' => 'Gelombang belum tersedia'], 404);
        }

        // Subquery untuk menghitung jumlah yang diterima
        $acceptedCountSubquery = DB::table('lamaran_ppl_tbl')
            ->select('id_lowongan_ppl', DB::raw('COUNT(*) as terisi'))
            ->where('status', 'accepted')
            ->groupBy('id_lowongan_ppl');

        $data = DB::table('lowongan_ppl_tbl as lppl')
            ->join('sekolah_tbl as st', 'lppl.id_sekolah', '=', 'st.id')
            ->join('sekolah_master as sm', 'st.id_sekolah', '=', 'sm.id')
            ->leftJoinSub($acceptedCountSubquery, 'accepted_counts', function ($join) {
                $join->on('lppl.id', '=', 'accepted_counts.id_lowongan_ppl');
            })
            ->select(
                "lppl.id as id_ppl",
                "lppl.id_prodi",
                'lppl.quota',
                "sm.name as nama_sekolah",
                "sm.regency",
                "sm.sub_district",
                "sm.village",
                "lppl.name as nama_lowongan",
                "lppl.description",
                'st.id_gelombang',
                DB::raw('COALESCE(accepted_counts.terisi, 0) as terisi'),
                DB::raw('(lppl.quota - COALESCE(accepted_counts.terisi, 0)) as sisa_kuota')
            )
            ->where('st.id_gelombang', $latestGelombang->id)
            ->groupBy(
                "lppl.id",
                "lppl.id_prodi",
                'lppl.quota',
                "sm.name",
                "sm.regency",
                "sm.sub_district",
                "sm.village",
                "lppl.name",
                "lppl.description",
                "st.id_gelombang",
                "accepted_counts.terisi"
            );

        if ($request->filled('search')) {
            $data->where(function ($q) use ($request) {
                $q->where('lppl.name', 'like', "%{$request->search}%")
                    ->orWhere('sm.name', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('nim')) {
            $mahasiswa = Mahasiswa::where('nim', $request->nim)->first();
            if ($mahasiswa) {
                $data->where('lppl.id_prodi', $mahasiswa->id_prodi);
            }
        }

        if ($request->boolean('available_only', true)) {
            $data->havingRaw('(lppl.quota - COALESCE(accepted_counts.terisi, 0)) > 0');
        }


        $result = $data->paginate(10);



        return response()->json(
            $result
        );
    }
}
