<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Data;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\File as RulesFile;
use Inertia\Inertia;
use ZipStream\File;

class ProfilController extends Controller
{
    public function index()
    {
        $user = Auth::user()->username;
        $prodi = Prodi::all();
        $link_grup = "";
        $user_data = Mahasiswa::where('nim', $user)->first();
        if ($user_data->status === 'accepted') {
            $link_grup = Data::all()->first()->link_grup;
        }
        $mahasiswa = User::where('username', $user)->with('dataMahasiswa')->first();
        return Inertia::render('Mahasiswa/profil', [
            'mahasiswa' => $mahasiswa,
            'list_prodi' => $prodi,
            'link_grup' => $link_grup,
            'base_url' => url('/')
        ]);
    }
    public function save(Request $request)
    {
        $data_mahasiswa = Mahasiswa::where('nim', Auth::user()->username)->first();

        $validated = $request->validate([
            'province_code' => 'required',
            'regency_code' => 'required',
            'subdistrict_code' => 'required',
            'village_code' => 'required',
            'ipk' => 'required|numeric',
            'id_prodi' => 'required',
            'nilai_micro_teaching' => 'required',
            "no_hp_wa" => 'required|regex:/^08\d{8,12}$/',
            'cluster_kegiatan' => 'required',
            'semester' => 'required',
            'transkrip' => 'required|file|mimes:pdf|max:500',
            'jk' => 'required',

        ], [
            'province_code.required' => 'Provinsi wajib diisi',
            'regency_code.required' => 'Kabupaten wajib diisi',
            'subdistrict_code.required' => 'Kecamatan wajib diisi',
            'village_code.required' => 'Desa wajib diisi',
            'id_prodi.required' => 'Prodi wajib diisi',
            'ipk.required' => 'IPK terakhir wajib diisi',
            'no_hp_wa.required' => 'No HP/WA wajib diisi',
            'no_hp_wa.regex' => 'No HP/WA harus dimulai dari 08 dan dengan panjang 10 s.d 14 digit',
            'cluster_kegiatan.required' => 'Cluster kegiatan wajib diisi',
            'transkrip.required' => 'Transkrip nilai wajib diisi',
            'transkrip.max' => 'File transkrip nilai maksimal 500kb',
            'jk' => 'Jenis Kelamin Wajib Diisi',

        ]);
        DB::beginTransaction();
        try {
            if ($data_mahasiswa->status === 'revisi' || $data_mahasiswa->status === null) {

                if ($request->hasFile('transkrip')) {

                    $file = $request->file('transkrip');

                    $custom_file_name = 'transkrip_' . Auth::user()->username . '.' . $file->getClientOriginalExtension();
                    $file_path = $file->storeAs('transkrip_nilai', $custom_file_name, 'public');

                    $validated['link_transkrip_nilai'] = $file_path;
                    unset($validated['transkrip']);
                    $validated['status'] = 'submitted';
                    // dd($validated);
                    $result = $data_mahasiswa->update($validated);
                    // dd($result);
                }

                DB::commit();
                return redirect()->back()->with('message', ['success' => 'Profil Berhasil di Diperbaharui'])->with('status', 'success');
            } elseif ($data_mahasiswa->status === 'accepted') {
                DB::rollBack();

                return redirect()->back()->with('message', ['error' => 'Pendaftaranmu sudah disetujui'])->with('status', 'error');
            } elseif ($data_mahasiswa->status === 'submitted') {
                DB::rollBack();

                return redirect()->back()->with('message', ['error' => 'Data kamu sedang di-review']);
            } elseif ($data_mahasiswa->status === 'rejected') {
                DB::rollBack();

                return redirect()->back()->with('message', ['error' => 'Biodatamu ditolak, silakan daftar di gelombang selanjutnya']);
            }
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('message', ['error' => 'error:' . $e->getMessage()]);
        }
    }
}
