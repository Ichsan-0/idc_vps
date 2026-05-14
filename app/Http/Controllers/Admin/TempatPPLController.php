<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\TempatPPLImport;
use App\Models\LamaranPPL;
use App\Models\LowonganPPL;
use App\Models\Sekolah;
use App\Models\TempatPPL;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

use function Laravel\Prompts\select;

class TempatPPLController extends Controller
{
    public function index(Request $request)
    {
        // $daftartempatppl = Sekolah::leftjoin('users', 'users.username', '=', 'sekolah_tbl.username_supervisor')
        //     ->select('sekolah_tbl.id', 'sekolah_tbl.name as nama_sekolah', 'users.name')
        //     ->get();
        $daftartempatppl = Sekolah::with('supervisor')->get();

        return Inertia::render('Admin/pages/PPL/tempatppl/ListTempatPPL', ['daftartempatppl' => $daftartempatppl]);
    }
    public function add()
    {
        return Inertia::render('Admin/pages/PPL/tempatppl/AddTempatPPL');
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'required',
            'regency' => 'required',
            'sub_district' => 'required',
            'village' => 'required'



        ]);
        // dd($validated);
        Sekolah::create($validated);
        return redirect('/admin/daftartempatppl');
    }


    public function import()
    {
        return Inertia::render('Admin/pages/PPL/tempatppl/ImportTempatPPL');
    }

    public function importtempatppl(Request $request)
    {
        Excel::import(new TempatPPLImport, $request->file('daftartempatppl'));
        return redirect()->route('admin.daftartempatppl');
    }

    public function edit($id)
    {
        $tempatppl = Sekolah::find($id);
        $supervisor = User::where('users.role', 'supervisor_kpm')->select('users.username', 'users.name')->get();
        return Inertia::render('Admin/pages/PPL/tempatppl/EditTempatPPL', [
            'supervisordata' => $supervisor,
            'tempatppl' => $tempatppl
        ]);
    }

    public function detail($id)
    {
        $sekolah = Sekolah::where('id', $id)
            ->with(['supervisor'])
            ->select(
                'sekolah_tbl.*',
                DB::raw("(SELECT SUM(quota) FROM lowongan_ppl_tbl WHERE id_sekolah = sekolah_tbl.id) AS jumlah_alokasi"),
                DB::raw("(SELECT COUNT(*) 
                      FROM lamaran_ppl_tbl l_ppl 
                      JOIN lowongan_ppl_tbl AS lw_ppl 
                      ON l_ppl.id_lowongan_ppl = lw_ppl.id 
                      WHERE lw_ppl.id_sekolah = $id AND l_ppl.status = 'accepted') AS jumlah_terisi")
            )
            ->first();
        // $pelamar = LamaranPPL::where('id_lowongan_ppl', $id)->with(['user', 'data_user', 'data_user.prodi'])->get();

        $pelamar = LamaranPPL::join('users as us', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'us.username')
            ->join('mahasiswa_tbl as dt', 'us.username', '=', 'dt.nim')
            ->join('prodi_tbl as pr', 'dt.id_prodi', '=', 'pr.id')
            ->join('lowongan_ppl_tbl as lw_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'lw_ppl.id') // Corrected here
            ->where('lw_ppl.id_sekolah', $id)
            ->select('lamaran_ppl_tbl.id', 'us.name as nama_mahasiswa', 'us.username as nim', 'pr.name as nama_prodi', 'dt.jk as jk', 'lamaran_ppl_tbl.status', 'dt.no_hp_wa')
            ->get();

        $daftarlowonganppl = LowonganPPL::with('sekolah')->where('id_sekolah', $id)->withCount('accepted_pelamar')->get();
        // dd('test');

        return Inertia::render('Admin/pages/PPL/tempatppl/DetailTempatPPL', [
            'sekolah' => $sekolah,
            'pelamar' => $pelamar,
            'lowongan' => $daftarlowonganppl


        ]);
    }

    public function update(Request $request, $id)
    {
        $data = [
            'username_supervisor' => $request->username_supervisor,
            'regency' => $request->regency,
            'sub_district' => $request->sub_district,
            'village' => $request->village,

        ];

        $sekolah = Sekolah::find($id);
        $result = $sekolah->update($data);
        if ($result) {
            return redirect('/admin/daftartempatppl')->with('message', ['success' => 'Data Sekolah Berhasil Diupdate']);
        }
        return redirect('/admin/daftartempatppl')->with('message', ['error' => 'Terjadi Kesalahan']);
    }

    public function delete($id)
    {

        $sekolah = Sekolah::find($id);
        $sekolah->delete();
        return redirect()->back();
    }
}
