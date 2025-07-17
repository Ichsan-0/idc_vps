<?php

namespace App\Http\Controllers;

use App\Models\Mahasiswa;
use App\Models\Prodi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfilController extends Controller
{
    public function index()
    {

        // $data_mahasiswa = Mahasiswa::where('nim', Auth::user()->username)->first();
        return Inertia::render('frontpage/Profil', []);
    }

    public function store(Request $request)
    {
    }

    public function update(Request $request)
    {

        $mahasiswa = Mahasiswa::where('nim', Auth::user()->username)->first();
        // dd($request);

        // dd($mahasiswa);
        $data = [
            'id_prodi' => $request->id_prodi,
            'provinsi' => $request->provinsi,
            'kabupaten' => $request->kabupaten,
            'kecamatan' => $request->kecamatan,
            'desa' => $request->desa,
            'provinsi_now' => $request->provinsi_now,
            'kabupaten_now' => $request->kabupaten_now,
            'kecamatan_now' => $request->kecamatan_now,
            'desa_now' => $request->desa_now,
            'ipk' => $request->ipk,
            'khs' => $request->khs,
            'jk' => $request->jk,
            'no_hp_wa' => $request->no_hp_wa,
            'nilai_microteaching' => $request->nilai_microteaching,

        ];

        if ($request->hasFile('khs')) {
            $file = $request->file('khs');
            $extension = $file->getClientOriginalExtension();
            $customFilename = 'khs_' . Auth::user()->username . '.' . $extension;

            // Store the file with the custom filename
            $path = Storage::putFile('cover', $file);

            // Save the file path to the data array to be updated in the database
            $data['khs'] = $path;
        }
        // dd($data);

        $mahasiswa->update($data);


        return redirect()->route('profil')->with('message', 'Profile updated successfully.');
    }
}
