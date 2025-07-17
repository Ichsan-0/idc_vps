<?php

namespace App\Http\Controllers\admin;


use App\Models\Supervisor;
use App\Http\Controllers\Controller;
use App\Models\LowonganPPL;
use App\Models\TempatPPL;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LowonganPPLController extends Controller
{
    public function index(){
        $lowonganppl = LowonganPPL::join('tempat_ppl_tbl', 'lowongan_ppl_tbl.id_tempat_ppl', '=', 'tempat_ppl_tbl.id_tempat')
            ->join('prodi_tbl', 'prodi_tbl.id','=', 'lowongan_ppl_tbl.id_prodi')
            ->select('lowongan_ppl_tbl.*', 'tempat_ppl_tbl.nama as nama_tempat_ppl', 'prodi_tbl.nama as nama_prodi')
            ->get(); // Execute the query to retrieve the results
                
        return Inertia::render('Admin/pages/lowonganPPL/LowonganPPL', ['lowongan_ppl'=> $lowonganppl]);

    }

    public function store(Request $request){
        // $data = $request->validated();
        // $data = $request->validated();


        TempatPPL::create([
            'nama' => $request['nama'],
            'provinsi' => $request['provinsi'],
            'kabupaten' => $request['kabupaten'],
            'kecamatan' => $request['kecamatan'],
            'desa' => $request['desa'],
            'id_supervisor' => $request['id_supervisor'],

        ]);
        return to_route('admin.tempatppl');

    }
    public function delete(){
        
    }

    public function addTempatPPL(){
        $daftar_supervisor = Supervisor::all();
        

        return Inertia::render('Admin/pages/addTempatPPL/AddTempatPPL', ['daftar_supervisor'=>$daftar_supervisor]);

    }
    
}
