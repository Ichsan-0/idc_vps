<?php

namespace App\Http\Controllers;

use App\Models\LamaranPPL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LamarankuController extends Controller
{
    public function index()
    {
        $lamarankuppl = LamaranPPL::join('lowongan_ppl_tbl', 'lamaranppl_tbl.id_lowongan_ppl', '=', 'lowongan_ppl_tbl.id')
            ->join('tempat_ppl_tbl', 'tempat_ppl_tbl.id_tempat', '=', 'lowongan_ppl_tbl.id_tempat_ppl')
            ->select(
                'lamaranppl_tbl.id as lamaran_id',
                'lamaranppl_tbl.id_lowongan_ppl',
                'lamaranppl_tbl.nim',
                'lamaranppl_tbl.status',
                'lowongan_ppl_tbl.name',
                'lowongan_ppl_tbl.qouta',
                'lowongan_ppl_tbl.qouta',
                'lowongan_ppl_tbl.id_tempat_ppl',
                'lowongan_ppl_tbl.terisi',
                'lowongan_ppl_tbl.id_tempat_ppl',
                'lowongan_ppl_tbl.jumlahpelamar',
                'tempat_ppl_tbl.nama',
                'tempat_ppl_tbl.provinsi',
                'tempat_ppl_tbl.kabupaten',
                'tempat_ppl_tbl.kecamatan',
                'tempat_ppl_tbl.desa',

            )
            ->where('lamaranppl_tbl.nim', '=', Auth::user()->username) // condition added at the end
            ->get();

        // dd($lamarankuppl);
        return Inertia::render('frontpage/Lamaranku', ['lamarankuppl' => $lamarankuppl]);
    }
}
