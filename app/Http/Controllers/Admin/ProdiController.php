<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Imports\ProdiImport;
use App\Models\Prodi;
use Exception;
use Maatwebsite\Excel\Facades\Excel;

class ProdiController extends Controller
{
    public function show(Request $request)
    {
        $daftarprodi = Prodi::all();
        return Inertia::render('Admin/pages/Data/Prodi/ListProdi', ['daftarprodi' => $daftarprodi]);
    }

    public function add(Request $request)
    {
        return Inertia::render('Admin/pages/Data/Prodi/AddProdi');
    }

    public function save(Request $request)
    {

        // dd($request);
        $validated = $request->validate([
            'name' => 'required',
            'kode' => 'required',
        ]);

        Prodi::create($validated);

        return redirect('/admin/daftarprodi');
    }

    public function import()
    {
        return Inertia::render('Admin/pages/Data/Prodi/ImportProdi');
    }

    public function importprodi(Request $request)
    {

        Excel::import(new ProdiImport, $request->file('dataprodi'));

        return redirect()->route('admin.daftarprodi');
    }
    public function edit($id)
    {
        $prodi = Prodi::find($id);

        return Inertia::render('Admin/pages/Data/Prodi/EditProdi', ['prodi' => $prodi]);
    }

    public function delete($id)
    {
        $prodi = Prodi::find($id);
        $result = $prodi->delete();
        if ($result) {
            return redirect()->back()->with('message', ['success' => 'Berhasil Menghapus Prodi']);
        }
        return redirect()->back()->with('message', ['error' => 'Gagal Menghapus Prodi']);
    }

    public function update(Request $request, $id)
    {
        $prodi = Prodi::find($id);
        $result = $prodi->update([
            'name' => $request->name,
            'kode' => $request->kode
        ]);

        if ($result) {
            return redirect('admin/daftarprodi')->with('message', ['success' => 'Prodi berhasil diupdate']);
        }
        return redirect('admin/daftarprodi')->with('message', ['success' => 'Terjadi Kesalahan']);
    }

    public function getProdi(){
        try{
            $data = Prodi::all();
            return response()->json([
                'data' => $data,
            ], 200);
        }catch(Exception $e){
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
