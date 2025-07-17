<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LamaranKPM;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MahasiswaKPMController extends Controller
{
    public function all()
    {
        $daftarmahasiswakpm = LamaranKPM::where('status', 'accepted')
            ->with(['kpm', 'pelamar', 'pelamar.dataMahasiswa', 'pelamar.dataMahasiswa.prodi'])
            ->get();
        return Inertia::render('Admin/pages/KPM/ListMahasiswaKPM', ['daftarmahasiswakpm' => $daftarmahasiswakpm]);
    }
}
