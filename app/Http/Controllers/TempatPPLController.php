<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTempatPPLRequest;
use App\Models\Supervisor;
use App\Models\TempatPPL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TempatPPLController extends Controller
{
    public function index(){
        $tempatppl = TempatPPL::leftJoin('supervisor_tbl', 'tempat_ppl_tbl.id_supervisor', '=', 'supervisor_tbl.supervisor_id')
            ->select('tempat_ppl_tbl.*', 'supervisor_tbl.nama as nama_supervisor')
            ->get(); // Execute the query to retrieve the results
                
        return Inertia::render('Admin/pages/tempatPPL/TempatPPL', ['tempat_ppl'=> $tempatppl]);

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
