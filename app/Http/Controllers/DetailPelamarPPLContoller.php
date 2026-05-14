<?php

namespace App\Http\Controllers;

use App\Models\LamaranPPL;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DetailPelamarPPLContoller extends Controller
{
    public function show(Request $request, $id)
    {
        $pelamarppl = LamaranPPL::join('lowongan_ppl_tbl', 'lowongan_ppl_tbl.id', '=', 'lamaranppl_tbl.id_lowongan_ppl')
            ->join('users', 'users.username', '=', 'lamaranppl_tbl.nim')
            ->join('tempat_ppl_tbl', 'tempat_ppl_tbl.id_tempat', '=', 'lowongan_ppl_tbl.id_tempat_ppl')
            ->join('mahasiswa_tbl', 'mahasiswa_tbl.nim', '=', 'lamaranppl_tbl.nim')
            ->join('prodi_tbl', 'prodi_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->select(
                'lamaranppl_tbl.id as id_lamaran',
                'users.name as nama_mahasiswa',
                'lamaranppl_tbl.nim',
                'lowongan_ppl_tbl.name as nama_lowongan_ppl',
                'tempat_ppl_tbl.nama as nama_tempat_ppl',
                'prodi_tbl.nama as nama_prodi',
                'lowongan_ppl_tbl.qouta as kuota',
                'lowongan_ppl_tbl.terisi as terisi',
                'lowongan_ppl_tbl.jumlahpelamar',
                'mahasiswa_tbl.jk',
                'lamaranppl_tbl.status',
            )
            ->where('lamaranppl_tbl.id', $id)
            ->first();
        return Inertia::render('Admin/pages/DetailPelamar', ['pelamarppl' => $pelamarppl]);
    }

    public function handlelamaran(Request $request, $id)
    {
        dd($request);
    }
}
