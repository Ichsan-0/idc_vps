<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\LamaranPPL;
use App\Models\LowonganPPL as ModelsLowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Sekolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Laravel\Prompts\select;

class LowonganPPL extends Controller
{
    public function detail(Request $request, $id)
    {

        $tempat_ppl = ModelsLowonganPPL::where('id', $id)->with(['sekolah', 'prodi'])->withCount('accepted_pelamar')->first();


        $pelamar = LamaranPPL::join('users as us', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'us.username')
            ->join('mahasiswa_tbl as dt', 'us.username', '=', 'dt.nim')
            ->join('prodi_tbl as pr', 'dt.id_prodi', '=', 'pr.id')
            ->join('lowongan_ppl_tbl as lw_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'lw_ppl.id') // Corrected here
            ->where('lw_ppl.id_sekolah', $tempat_ppl->id_sekolah)
            // ->where('lamaran_ppl_tbl.id_lowongan_ppl', $id) // Add this condition to filter by $id
            ->where('lamaran_ppl_tbl.status', 'accepted')
            ->select('us.name as nama_mahasiswa', 'us.username as nim', 'pr.name as nama_prodi', 'dt.jk as jk')
            ->get();

        // dd($tempat_ppl->sekolah->id);

        // $pelamar = DB::table('lowongan_ppl_tbl')
        //     ->join('lamaran_ppl_tbl as lm_ppl', 'lowongan_ppl_tbl.id', '=', 'lm_ppl.id_lowongan_ppl')
        //     // ->where('lm_ppl.status', 'accepted')
        //     ->where('lowongan_ppl_tbl.id_sekolah', $tempat_ppl->sekolah->id)
        //     ->all();

        // $pelamar = ModelsLowonganPPL::join('lamaran_ppl_tbl as lm_ppl', 'lowongan_ppl_tbl.id', '=', 'lm_ppl.id_lowongan_ppl')
        //     // ->where('lm_ppl.status', 'accepted')
        //     ->where('lowongan_ppl_tbl.id_sekolah', $tempat_ppl->sekolah->id)
        //     ->get();


        // $pelamar = ModelsLowonganPPL::where('id_sekolah', $tempat_ppl->sekolah->id)
        //     ->get();
        // dd($pelamar);

        // $pelamar = LamaranPPL::join('users as us', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'us.username')
        //     ->join('mahasiswa_tbl as dt', 'us.username', '=', 'dt.nim')
        //     ->join('prodi_tbl as pr', 'dt.id_prodi', '=', 'pr.id')
        //     ->join('lowongan_ppl_tbl as lw_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'lw_ppl.id') // Corrected here
        //     ->where('lw_ppl.id_sekolah', $tempat_ppl->id_sekolah)
        //     // ->where('lamaran_ppl_tbl.id_lowongan_ppl', $id) // Add this condition to filter by $id
        //     ->where('lamaran_ppl_tbl.status', 'accepted')
        //     ->select('us.name as nama_mahasiswa', 'us.username as nim', 'pr.name as nama_prodi', 'dt.jk as jk')
        //     ->get();

        // dd($pelamar);



        // $tempat_ppl = ModelsLowonganPPL::where('id', $id)->with(['sekolah', 'prodi'])->first();
        return Inertia::render('Mahasiswa/DetailLowonganPPL', ['tempat_ppl' => $tempat_ppl, 'pelamar' => $pelamar]);
    }

    public function all()
    {
        $data_mahasiswa = Mahasiswa::where('nim', Auth::user()->username)->first();
        $tempat_ppl = ModelsLowonganPPL::with(['sekolah', 'prodi'])->where('id_prodi', $data_mahasiswa->id_prodi)->get();


        return Inertia::render('Mahasiswa/PPL', ['tempat_ppl' => $tempat_ppl]);
    }

    public function lamar(Request $request)
    {
        $lowongan = ModelsLowonganPPL::find($request->id);
        // dd($lowongan);

        $eksisting_lamaran = LamaranPPL::where('id', $request->id)->where('username_mahasiswa', Auth::user()->username)->first();
        $lamaran_accepted = LamaranPPL::where('username_mahasiswa', Auth::user()->username)->where('status', 'accepted')->first();
        $totallamaran = LamaranPPL::where('status', 'accepted')
            ->where('id_lowongan_ppl', $request->id)
            ->get();
        $data = [
            'username_mahasiswa' => Auth::user()->username,
            'id_lowongan_ppl' => $request->id,
            'status' => 'submitted',
        ];

        if (count($totallamaran) < $lowongan->quota) {
            if ($eksisting_lamaran) {
                return redirect('/riwayat')->with('message', ['error' => 'Kamu Sudah Melamar Ke Lowongan ini']);
            } else {
                LamaranPPL::create($data);
                return redirect('/riwayat')->with('message', ['success' => 'Lamaran Berhasil Dikirim']);
            }
        } else if ($lamaran_accepted) {
            return redirect('/riwayat')->with('message', ['error' => 'Kamu sudah diterima di lowongan lain']);
        } else {
            return redirect()->back()->with('message', ['error' => 'Sudah Penuh']);
        }

        dd($request);
    }
}
