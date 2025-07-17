<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\MahasiswaImport;
use App\Models\LowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;


class MahsiswaController extends Controller
{
    public function index(Request $request)
    {
        $daftarmahasiswa = Mahasiswa::join('users', 'users.username', '=', 'mahasiswa_tbl.nim')
            ->leftjoin('prodi_tbl', 'prodi_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->select('users.name', 'prodi_tbl.name as nama_prodi', 'mahasiswa_tbl.*')
            ->orderBy('mahasiswa_tbl.status', 'desc')
            ->get();

        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/StudentList', ['daftarmahasiswa' => $daftarmahasiswa]);
    }

    public function followup(Request $request, $id)
    {
        $mahasiswa = Mahasiswa::where('nim', $id)->first();
        $data = [
            'status' => $request->status,
            'keterangan' => $request->keterangan
        ];
        $result = $mahasiswa->update($data);
        if ($result) {
            return redirect('/admin/daftarmahasiswa')->with('message', ['success' => 'Data berhasil Diperbaharui']);
        } else {
            return redirect('/admin/daftarmahasiswa')->with('message', ['error' => 'Gagal Memperbaharui Data']);
        }
    }

    public function add(Request $request)
    {
        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/AddMahasiswa');
    }

    public function importmahasiswa(Request $request)
    {
        // dd($request);

        Excel::import(new MahasiswaImport, $request->file('daftarmahasiswa'));

        return redirect()->route('admin.daftarmahasiswa');
    }

    public function edit(Request $request, $nim)
    {
        $dataprodi = Prodi::all();
        $dataLowongan = LowonganPPL::join('sekolah_tbl', 'sekolah_tbl.id', '=', 'ppl_tbl.id_sekolah')
            ->select('ppl_tbl.*', DB::raw("CONCAT('PPL ',ppl_tbl.name, ' ',  sekolah_tbl.name) AS nama_lowongan"))
            ->get();
        // dd($dataLowongan);
        $datamahasiswa = Mahasiswa::where('mahasiswa_tbl.nim', $nim)
            ->join('users', 'users.username', '=',  'mahasiswa_tbl.nim')
            ->select('users.name', 'mahasiswa_tbl.*')
            ->first();

        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/EditMahasiswa', [
            'datalowongan' => $dataLowongan,
            'dataprodi' => $dataprodi,
            'datamahasiswa' => $datamahasiswa,
        ]);
        // dd($datamahasiswa);
    }

    public function update(Request $request, $nim)
    {

        $data = [
            'id_prodi' => $request->id_prodi,
            'id_lowongan_ppl' => $request->id_lowongan_ppl,
        ];

        $mahasiswa = Mahasiswa::where('mahasiswa_tbl.nim', $nim)->first();
        if ($mahasiswa) {
            $result = $mahasiswa->update($data);
            if ($result) {
                return redirect()->route('admin.daftarmahasiswa')->with('message', ['success' => 'Berhasil Memperbaharui Data Mahasiswa']);
            }
        }
        return redirect()->route('admin.daftarmahasiswa')->with('message', ['error' => 'terjadi kesalahan']);
    }
    public function detail($id)
    {
        $mahasiswa = User::where('username', $id)->with(['dataMahasiswa', 'dataMahasiswa.prodi'])->first();

        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/DetailMahasiswa', ['mahasiswa' => $mahasiswa, 'base_url' => url('/')]);
    }
}
