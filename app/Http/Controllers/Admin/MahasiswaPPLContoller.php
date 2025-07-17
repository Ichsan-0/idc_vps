<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LamaranPPL;
use Illuminate\Http\Request;
use App\Models\Mahasiswa;
use App\Models\Sekolah;
use Inertia\Inertia;

class MahasiswaPPLContoller extends Controller
{
    public function index()
    {
        $daftarmahasiswappl = LamaranPPL::where('status', 'accepted')->with(['user', 'data_user', 'data_user.prodi', 'ppl', 'ppl.sekolah', 'ppl.sekolah.supervisor'])->get();

        return Inertia::render('Admin/pages/PPL/mahasiswappl/ListMahasiswaPPL', ['daftarmahasiswappl' => $daftarmahasiswappl]);
    }

    public function edit($id)
    {
        $mahasiswa = Mahasiswa::where('mahasiswa_tbl.nim', '=', $id)
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

        return Inertia::render('Admin/pages/PPL/mahasiswappl/EditNilai', ['mahasiswa' => $mahasiswa, 'base_url' => url('/')]);
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
                return redirect('/admin/daftarmahasiswappl')->with('message', ['success' => 'Nilai Berhasil Diperbaharui']);
            } else {
                return redirect('/admin/daftarmahasiswappl')->with('message', ['error' => 'Nilai Gagal Diperbaharui']);
            }
        } else {

            $result = $mahasiswa->update([
                'nilai_supervisor_ppl' => $request->nilai_supervisor_ppl,
                'nilai_pamong' => $request->nilai_pamong,

            ]);
            if ($result) {
                return redirect('/admin/daftarmahasiswappl')->with('message', ['success' => 'Nilai Berhasil Diperbaharui']);
            } else {
                return redirect('/admin/daftarmahasiswappl')->with('message', ['error' => 'Nilai Gagal Diperbaharui']);
            }
        }
    }
}
