<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\LowonganPPLImport;
use App\Models\LamaranPPL;
use App\Models\LowonganPPL;
use App\Models\Prodi;
use App\Models\Sekolah;
use App\Models\TempatPPL;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;


class LowonganPPLController extends Controller
{
    public function index(Request $request)
    {
        $daftarlowonganppl = LowonganPPL::with('sekolah')->withCount('accepted_pelamar')->get();
        return Inertia::render('Admin/pages/PPL/lowonganppl/ListLowonganPPL', ['daftarlowonganppl' => $daftarlowonganppl]);
    }

    public function list_pelamar()
    {
        $pelamar = LamaranPPL::with(['ppl', 'ppl.sekolah', 'user', 'data_user', 'data_user.prodi'])->where('status', 'submitted')->get();
        foreach ($pelamar as $itm) {
            $itm['terisi'] = LowonganPPL::where('id', $itm->id_lowongan_ppl)->select('id')->withCount('accepted_pelamar')->first();
        }
        return Inertia::render('Admin/pages/PPL/lowonganppl/ListPelamarLowonganPPL', [
            'pelamar' => $pelamar
        ]);
    }

    public function followup(Request $request, $id)
    {
        $lamaran = LamaranPPL::find($id);
        $data = [
            'status' => $request->status,
            'keterangan' => $request->keterangan,
        ];

        $lamaran_ppl_user = LamaranPPL::where('username_mahasiswa', $lamaran->username_mahasiswa)
            ->where('id', '!=', $id)
            ->get();
        DB::beginTransaction();
        try {
            if (count($lamaran_ppl_user) > 0 && $data['status'] === 'accepted') {
                foreach ($lamaran_ppl_user as $lamaran_user) {
                    $lamaran_user->delete();
                }
            }
            $lamaran->update($data);

            DB::commit();
            return redirect('/admin/daftarlowonganppl')->with('message', ['success' => 'Berhasil Memperbaharui']);
        } catch (Exception $e) {
            DB::rollBack();
            return redirect('/admin/daftarlowonganppl')->with('message', ['error' => $e->getMessage()]);
        }
    }

    public function detail_pelamar($id)
    {
        $lamaran = LamaranPPL::where('id', $id)->with(['user', 'data_user', 'ppl', 'ppl.sekolah', 'data_user.prodi'])->first();

        $lowonganppl = LowonganPPL::withCount('accepted_pelamar')->where('id', $lamaran->ppl->id)->first();
        return Inertia::render('Admin/pages/PPL/lowonganppl/FollowUpLamaranPPL', ['lamaran' => $lamaran, 'lownganppl' => $lowonganppl]);
    }

    public function delete($id)
    {
        $lowongan = LowonganPPL::where('id', $id)->first();

        $lowongan->delete();

        return redirect()->back();
    }
    public function add()
    {
        $prodi = Prodi::all();
        $sekolah = Sekolah::all();


        return Inertia::render('Admin/pages/PPL/lowonganppl/AddLowonganPPL', [
            'daftar_prodi' => $prodi,
            'daftar_sekolah' => $sekolah
        ]);
    }
    public function detail($id)
    {
        $lowongan = LowonganPPL::where('id', $id)->with(['sekolah', 'prodi', 'sekolah.supervisor'])->withCount('accepted_pelamar')->first();
        // $lowongan = DB::table('lowongan_ppl_tbl')
        //     ->leftJoin('sekolah_tbl as sekolah', 'lowongan_ppl_tbl.id_sekolah', '=', 'sekolah.id')
        //     ->leftJoin('prodi_tbl', 'lowongan_ppl_tbl.id_prodi', '=', 'prodi_tbl.id')
        //     ->leftJoin('users', 'sekolah.username_supervisor', '=', 'users.username')
        //     ->select(
        //         'lowongan_ppl_tbl.*',
        //         'sekolah.name as nama_sekolah',
        //         'sekolah.regency',
        //         'sekolah.sub_district',
        //         'sekolah.village',
        //         'prodi_tbl.name as nama_prodi',
        //         'users.name as nama_supervisor',
        //         DB::raw("(SELECT COUNT(*) 
        //           FROM lamaran_ppl_tbl 
        //           WHERE lamaran_ppl_tbl.id_lowongan_ppl = lowongan_ppl_tbl.id 
        //             AND lamaran_ppl_tbl.status = 'submitted') AS terisi")
        //     )
        //     ->where('lowongan_ppl_tbl.id', $id)
        //     ->first();
        // dd($lowongan);
        $pelamar = LamaranPPL::where('id_lowongan_ppl', $id)->with(['user', 'data_user', 'data_user.prodi'])->get();

        return Inertia::render('Admin/pages/PPL/lowonganppl/DetailLowonganPPL', [
            'lowngan' => $lowongan,
            'pelamar' => $pelamar
        ]);
    }

    public function save(Request $request)
    {
        // dd($request);
        $validated = $request->validate([
            'name' => 'required',
            "description" => 'required',
            "quota" => ['required', 'numeric'],
            "id_sekolah" => 'required',
            "id_prodi" => 'required',
        ]);
        // dd($validated);

        LowonganPPL::create($validated);
        return redirect('/admin/daftarlowonganppl');
    }
    public function import()
    {
        return Inertia::render('Admin/pages/PPL/lowonganppl/AddLowonganPPL');
    }

    public function importlowonganppl(Request $request)
    {
        Excel::import(new LowonganPPLImport, $request->file('daftarlowonganppl'));
        return redirect()->route('admin.daftarlowonganppl');
    }
    public function edit($id)
    {
        $lowongan = LowonganPPL::find($id);
        $prodi = Prodi::all();
        $sekolah = Sekolah::all();

        return Inertia::render('Admin/pages/PPL/lowonganppl/EditLowonganPPL', [
            'lowongan' => $lowongan,
            'daftar_prodi' => $prodi,
            'daftar_sekolah' => $sekolah
        ]);
    }
    public function update(Request $request, $id)
    {
        // dd($request->quota);
        $validated = $request->validate([
            'name' => 'required',
            "description" => 'required',
            "quota" => 'required',
            "id_sekolah" => 'required',
            "id_prodi" => 'required',
        ]);
        // dd($validated);

        $lowongan = LowonganPPL::find($id);
        // dd($lowongan);
        $lowongan->update($validated);
        return redirect('/admin/daftarlowonganppl');
    }
}
