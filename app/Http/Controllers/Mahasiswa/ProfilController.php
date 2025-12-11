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
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File as RulesFile;
use Inertia\Inertia;
use ZipStream\File;

class ProfilController extends Controller
{
    public function default(){
        return redirect('/profil');
    }
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

        $rules = [
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
            'jk' => 'required',
            'alamat_asal' => 'required',
        ];

        if (!$data_mahasiswa->link_transkrip_nilai) {
            $rules['link_transkrip_nilai'] = 'required|file|mimes:pdf|max:500';
        } else {
            $rules['link_transkrip_nilai'] = 'nullable|file|mimes:pdf|max:500';
        }

        if (!$data_mahasiswa->link_surat_pernyataan) {
            $rules['link_surat_pernyataan'] = 'required|file|mimes:pdf|max:500';
        } else {
            $rules['link_surat_pernyataan'] = 'nullable|file|mimes:pdf|max:500';
        }

        if (!$data_mahasiswa->link_surat_kesiapan) {
            $rules['link_surat_kesiapan'] = 'required|file|mimes:pdf|max:500';
        } else {
            $rules['link_surat_kesiapan'] = 'nullable|file|mimes:pdf|max:500';
        }

        $messages = [
            'province_code.required' => 'Provinsi wajib diisi',
            'regency_code.required' => 'Kabupaten wajib diisi',
            'subdistrict_code.required' => 'Kecamatan wajib diisi',
            'village_code.required' => 'Desa wajib diisi',
            'id_prodi.required' => 'Prodi wajib diisi',
            'ipk.required' => 'IPK terakhir wajib diisi',
            'no_hp_wa.required' => 'No HP/WA wajib diisi',
            'no_hp_wa.regex' => 'No HP/WA harus dimulai dari 08 dan dengan panjang 10 s.d 14 digit',
            'cluster_kegiatan.required' => 'Cluster kegiatan wajib diisi',
            'link_transkrip_nilai.required' => 'Transkrip nilai wajib diisi',
            'link_transkrip_nilai.max' => 'File transkrip nilai maksimal 500kb',
            'link_surat_pernyataan.required' => 'Surat pernyataan prodi wajib diisi',
            'link_surat_pernyataan.max' => 'File surat pernyataan maksimal 500kb',
            'link_surat_kesiapan.required' => 'Surat kesiapan mahasiswa wajib diisi',
            'link_surat_kesiapan.max' => 'File surat kesiapan maksimal 500kb',
            'jk' => 'Jenis Kelamin Wajib Diisi',
            'alamat_asal.required' => 'Alamat asal wajib diisi',
        ];

        $validated = $request->validate($rules, $messages);
        DB::beginTransaction();
        try {
            if ($data_mahasiswa->status === 'revisi' || $data_mahasiswa->status === null) {

                if ($request->hasFile('link_transkrip_nilai')) {

                    $file = $request->file('link_transkrip_nilai');
                    
                    // Delete old file if exists
                    if ($data_mahasiswa->link_transkrip_nilai && Storage::disk('public')->exists($data_mahasiswa->link_transkrip_nilai)) {
                        Storage::disk('public')->delete($data_mahasiswa->link_transkrip_nilai);
                    }

                    $custom_file_name = 'transkrip_' . Auth::user()->username . '.' . $file->getClientOriginalExtension();
                    $file_path = $file->storeAs('transkrip_nilai', $custom_file_name, 'public');

                    $validated['link_transkrip_nilai'] = $file_path;
                }

                if ($request->hasFile('link_surat_pernyataan')) {
                    $file = $request->file('link_surat_pernyataan');
                    
                    // Delete old file if exists
                    if ($data_mahasiswa->link_surat_pernyataan && Storage::disk('public')->exists($data_mahasiswa->link_surat_pernyataan)) {
                        Storage::disk('public')->delete($data_mahasiswa->link_surat_pernyataan);
                    }
                    
                    $custom_file_name = 'surat_pernyataan_' . Auth::user()->username . '.' . $file->getClientOriginalExtension();
                    $file_path = $file->storeAs('documents/surat_pernyataan', $custom_file_name, 'public');
                    $validated['link_surat_pernyataan'] = $file_path;
                }

                if ($request->hasFile('link_surat_kesiapan')) {
                    $file = $request->file('link_surat_kesiapan');
                    
                    // Delete old file if exists
                    if ($data_mahasiswa->link_surat_kesiapan && Storage::disk('public')->exists($data_mahasiswa->link_surat_kesiapan)) {
                        Storage::disk('public')->delete($data_mahasiswa->link_surat_kesiapan);
                    }
                    
                    $custom_file_name = 'surat_kesiapan_' . Auth::user()->username . '.' . $file->getClientOriginalExtension();
                    $file_path = $file->storeAs('documents/surat_kesiapan', $custom_file_name, 'public');
                    $validated['link_surat_kesiapan'] = $file_path;
                }

                $validated['status'] = 'submitted';
                // dd($validated);
                $result = $data_mahasiswa->update($validated);
                // dd($result);

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
