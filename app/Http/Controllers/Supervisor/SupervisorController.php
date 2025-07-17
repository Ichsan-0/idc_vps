<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Models\LowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Sekolah;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SupervisorController extends Controller
{
    public function index(Request $request)
    {

        $data = [];
        $data['pengguna'] = User::all()->count();
        $data['sekolah'] = Sekolah::all()->count();
        $data['lowongan'] = LowonganPPL::all()->count();
        $data['mahasiswappl'] = Mahasiswa::all()->count();
        $data['recapperprodi'] = Mahasiswa::join('prodi_tbl', 'prodi_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->select('mahasiswa_tbl.id_prodi', DB::raw('count(*) as total'), 'prodi_tbl.name as nama_prodi')
            ->groupBy('mahasiswa_tbl.id_prodi', 'prodi_tbl.name')  // Include prodi_tbl.name in the groupBy clause
            ->get();
        $data['supervisor'] = User::where('users.role', '=', 'supervisor')->count();



        return Inertia::render('Supervisor/Dashboard', ['data' => $data, 'base_url' => url('/')]);
    }

    public function daftarmahasiswappl()
    {
        $selesai = false;

        $daftarmahasiswappl = Mahasiswa::join('users', 'users.username', '=', 'mahasiswa_tbl.nim')
            ->join('prodi_tbl', 'prodi_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->join('ppl_tbl', 'ppl_tbl.id', '=', 'mahasiswa_tbl.id_lowongan_ppl')
            ->join('sekolah_tbl', 'sekolah_tbl.id', '=', 'ppl_tbl.id_sekolah')
            ->select('mahasiswa_tbl.*', 'prodi_tbl.name as nama_prodi', 'users.name', 'sekolah_tbl.name as nama_sekolah')
            ->where('sekolah_tbl.username_supervisor', '=', Auth::user()->username)
            ->get();

        // Add a 'status' field to each mahasiswa
        $daftarmahasiswappl->each(function ($mhs) use (&$selesai) {
            if (
                !is_null($mhs->link_instrument_penilaian) &&
                !is_null($mhs->nilai_supervisor_ppl) &&
                !is_null($mhs->nilai_pamong)
            ) {
                $mhs->status = 'done';
                $selesai = true;
            } else {
                $mhs->status = 'pending';
                $selesai = false;
            }
        });




        return Inertia::render('Supervisor/ListMahasiswaPPL', ['daftarmahasiswappl' => $daftarmahasiswappl, 'status' => $selesai]);
    }

    public function editnilai(Request $request, $id)
    {
        $mahasiswa = Mahasiswa::where('mahasiswa_tbl.id', '=', $id)
            ->join('users', 'users.username', '=', 'mahasiswa_tbl.nim')
            ->join('prodi_tbl', 'prodi_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->join('ppl_tbl', 'ppl_tbl.id', '=', 'mahasiswa_tbl.id_lowongan_ppl')
            ->join('sekolah_tbl', 'sekolah_tbl.id', 'ppl_tbl.id_sekolah')
            ->select(
                'users.name as nama_mahasiswa',
                'mahasiswa_tbl.id as id_mahasiswa',
                'ppl_tbl.name as nama_lowongan',
                'sekolah_tbl.name as nama_sekolah',
                'prodi_tbl.name as nama_prodi',
                'mahasiswa_tbl.nilai_pamong',
                'mahasiswa_tbl.nilai_supervisor_ppl',
                'mahasiswa_tbl.nim',
                'mahasiswa_tbl.no_hp_wa',
                'mahasiswa_tbl.link_instrument_penilaian'
            )
            ->first();
        return Inertia::render('Supervisor/EditNilai', ['mahasiswa' => $mahasiswa, 'base_url' => url('/'),]);
    }

    public function updatenilai(Request $request, $id)
    {
        $request->validate([
            'file' => 'nullable|max:500', // Validate PDF and max 500KB
            'nilai_supervisor_ppl' => 'required',
            'nilai_pamong' => 'required',
        ]);

        $mahasiswa = Mahasiswa::find($id);


        if ($request->hasFile('file')) {
            $file = $request->file('file');

            $customFileName = 'instrument_' . $id . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('InstrumentPenilaian', $customFileName, 'public');
            $result = $mahasiswa->update([
                'nilai_supervisor_ppl' => $request->nilai_supervisor_ppl,
                'nilai_pamong' => $request->nilai_pamong,
                'link_instrument_penilaian' => $filePath ?? null,

            ]);
            if ($result) {
                return redirect('/supervisor/daftarmahasiswappl')->with('message', ['success' => 'Nilai Berhasil Diperbaharui']);
            } else {
                return redirect('/supervisor/daftarmahasiswappl')->with('message', ['error' => 'Nilai Gagal Diperbaharui']);
            }
        } else {

            $result = $mahasiswa->update([
                'nilai_supervisor_ppl' => $request->nilai_supervisor_ppl,
                'nilai_pamong' => $request->nilai_pamong,

            ]);
            if ($result) {
                return redirect('/supervisor/daftarmahasiswappl')->with('message', ['success' => 'Nilai Berhasil Diperbaharui']);
            } else {
                return redirect('/supervisor/daftarmahasiswappl')->with('message', ['error' => 'Nilai Gagal Diperbaharui']);
            }
        }
    }
}
