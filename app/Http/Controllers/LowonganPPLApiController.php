<?php

namespace App\Http\Controllers;

use App\Models\LowonganPPL;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;

class LowonganPPLApiController extends Controller
{
    public function index(Request $request)
    {
        $query = LowonganPPL::with(['sekolah', 'prodi']);



        if ($request->has('search') && !empty($request->search)) {
            $query->whereHas('sekolah', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }


        if ($request->has('nim') && !empty($request->nim)) {
            $data_mahasiswa = Mahasiswa::where('nim', $request->nim)->first();
            $query->where('id_prodi', $data_mahasiswa->id_prodi);
        }
        $data = $query->paginate(10);

        return response()->json($data);
    }
}
