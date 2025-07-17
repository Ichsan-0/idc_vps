<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RiwayatLamaran extends Controller
{
    public function index()
    {
        $lamaran_kpm = LamaranKPM::where('username_mahasiswa', Auth::user()->username)->with(['kpm'])->get();
        $lamaran_ppl = LamaranPPL::where('username_mahasiswa', Auth::user()->username)->with(['ppl', 'ppl.sekolah'])->get();
        return Inertia::render('Mahasiswa/RiwayatLamaran', [
            'lamaran_kpm' => $lamaran_kpm,
            'lamaran_ppl' => $lamaran_ppl,
        ]);
    }
}
