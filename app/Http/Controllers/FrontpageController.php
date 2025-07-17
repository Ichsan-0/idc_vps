<?php

namespace App\Http\Controllers;

use App\Models\LowonganPPL;
use App\Models\TempatKPM;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class FrontpageController extends Controller
{
    public function index()
    {
        // $lowonganppl = LowonganPPL::join('tempat_ppl_tbl', 'lowongan_ppl_tbl.id_tempat_ppl', '=', 'tempat_ppl_tbl.id_tempat')
        //     ->join('prodi_tbl', 'prodi_tbl.id', '=', 'lowongan_ppl_tbl.id_prodi')
        //     ->select('tempat_ppl_tbl.*', 'lowongan_ppl_tbl.*', 'tempat_ppl_tbl.nama as nama_tempat_ppl', 'tempat_ppl_tbl.provinsi', 'tempat_ppl_tbl.kabupaten', 'tempat_ppl_tbl.kecamatan', 'tempat_ppl_tbl.desa', 'prodi_tbl.nama as nama_prodi')
        //     ->get(); // Execute the query to retrieve the results

        $tempat_kpm = TempatKPM::all();


        return Inertia::render('frontpage/Frontpage', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'tempat_kpm' => $tempat_kpm,
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
}
