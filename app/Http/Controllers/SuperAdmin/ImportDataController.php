<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Imports\SuperAdmin\MahasiswaImport;
use App\Imports\SuperAdmin\SupervisorImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ImportDataController extends Controller
{
    public function index(){
        return Inertia::render("SuperAdmin/Import/ImportData");

    }

    public function importMahasiswa(Request $request){
        $import = Excel::import(new MahasiswaImport, $request->file('dataMahasiswa'));
        return response()->json(['message' => 'Data successfully imported']);
    }

    public function importSupervisor(Request $request){
        $import = Excel::import(new SupervisorImport, $request->file('dataSupervisor'));
        return response()->json(['message' => 'Data successfully imported']);

    }

  
}
