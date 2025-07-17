<?php

namespace App\Http\Controllers;

use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use App\Models\LowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Sekolah;
use App\Models\TempatKPM;
use App\Models\TempatPPL;
use App\Models\User as ModelsUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        $data = [];
        $data['pengguna'] = ModelsUser::all()->count();
        $data['sekolah'] = Sekolah::all()->count();
        $data['lowongan'] = LowonganPPL::all()->count();
        $data['mahasiswappl'] = Mahasiswa::all()->count();
        $data['mahasiswa_lulus_biodata'] = Mahasiswa::where('status', 'accepted')->count();
        $data['mahasiswa_belum_lengkap_biodata'] = Mahasiswa::whereNull('status')->count();
        $data['mahasiswa_review'] = Mahasiswa::where('status', 'submitted')->count();
        $data['mahasiswa_revisi'] = Mahasiswa::where('status', 'revisi')->count();
        $data['mahasiswa_ditolak'] = Mahasiswa::where('status', 'rejected')->count();
        $data['jumlah_lamaran_ppl_masuk'] = LamaranPPL::where('status', 'submitted')->count();
        $data['jumlah_pria'] = Mahasiswa::where('jk', 'Pria')->count();
        $data['jumlah_wanita'] = Mahasiswa::where('jk', 'Wanita')->count();
        $data['jumlah_m_ppl'] = Mahasiswa::where('cluster_kegiatan', 'PPL')->count();
        $data['jumlah_m_kpm'] = Mahasiswa::where('cluster_kegiatan', 'KPM')->count();
        $data['jumlah_desa'] = TempatKPM::all()->count();
        $data['jumlah_lamaran_kpm_masuk'] = LamaranKPM::where('status', 'submitted')->count();







        $data['recapperprodi_pendaftar'] = Mahasiswa::join('prodi_tbl', 'prodi_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->select('mahasiswa_tbl.id_prodi', DB::raw('count(*) as total'), 'prodi_tbl.kode as nama_prodi')
            ->groupBy('mahasiswa_tbl.id_prodi', 'prodi_tbl.kode')  // Include prodi_tbl.name in the groupBy clause
            ->get();
        $data['recapperprodi_lulus'] = Mahasiswa::join('prodi_tbl as prd_tbl', 'prd_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->select('mahasiswa_tbl.id_prodi', DB::raw('count(*) as total'), 'prd_tbl.kode as nama_prodi')
            ->where('mahasiswa_tbl.status', 'accepted')
            ->groupBy('mahasiswa_tbl.id_prodi', 'prd_tbl.kode')  // Include prodi_tbl.name in the groupBy clause
            ->get();

        $data['supervisor'] = ModelsUser::where('users.role', '=', 'supervisor')->count();
        $data['nilaikosong'] = Mahasiswa::whereNull('nilai_supervisor_ppl')
            ->orWhereNull('nilai_pamong')
            ->orWhereNull('link_instrument_penilaian')
            ->count();



        return Inertia::render('Admin/Dashboard', ['data' => $data]);
    }
}
