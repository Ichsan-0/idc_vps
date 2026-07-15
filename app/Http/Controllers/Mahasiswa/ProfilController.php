<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Data;
use App\Models\Gelombang;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use App\Services\SevimaService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File as RulesFile;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use ZipStream\File;

class ProfilController extends Controller
{
    public function default()
    {
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
    $latestGelombang = Gelombang::latest()->first();

    $rules = [
        'province_code' => 'required',
        'regency_code' => 'required',
        'subdistrict_code' => 'required',
        'village_code' => 'required',
        'province_code_now' => 'required',
        'regency_code_now' => 'required',
        'subdistrict_code_now' => 'required',
        'village_code_now' => 'required',
        'ipk' => 'required|numeric',
        'id_prodi' => 'required',
        'nilai_micro_teaching' => 'required',
        "no_hp_wa" => 'required|regex:/^08\d{8,12}$/',
        'cluster_kegiatan' => 'required',
        'semester' => 'required',
        'jk' => 'required',
        'alamat_asal' => 'required',
    ];

    // Hanya validasi file jika status revisi/null dan belum ada file
    if (!$data_mahasiswa->link_surat_pernyataan) {
        $rules['link_surat_pernyataan'] = 'required|file|mimes:pdf|max:500';
    }

    if (!$data_mahasiswa->link_surat_kesiapan) {
        $rules['link_surat_kesiapan'] = 'required|file|mimes:pdf|max:500';
    }

    $messages = [
        'province_code.required' => 'Provinsi wajib diisi',
        'regency_code.required' => 'Kabupaten wajib diisi',
        'subdistrict_code.required' => 'Kecamatan wajib diisi',
        'village_code.required' => 'Desa wajib diisi',
        'province_code_now.required' => 'Provinsi wajib diisi',
        'regency_code_now.required' => 'Kabupaten wajib diisi',
        'subdistrict_code_now.required' => 'Kecamatan wajib diisi',
        'village_code_now.required' => 'Desa wajib diisi',
        'ipk.required' => 'IPK terakhir wajib diisi',
        'ipk.numeric' => 'IPK harus berupa angka',
        'id_prodi.required' => 'Prodi wajib diisi',
        'nilai_micro_teaching.required' => 'Nilai micro teaching wajib diisi',
        'no_hp_wa.required' => 'No HP/WA wajib diisi',
        'no_hp_wa.regex' => 'No HP/WA harus dimulai dari 08 dan dengan panjang 10 s.d 14 digit',
        'cluster_kegiatan.required' => 'Cluster kegiatan wajib diisi',
        'semester.required' => 'Semester wajib diisi',
        'jk.required' => 'Jenis Kelamin wajib diisi',
        'alamat_asal.required' => 'Alamat asal wajib diisi',
        'link_surat_pernyataan.required' => 'Surat pernyataan prodi wajib diisi',
        'link_surat_pernyataan.mimes' => 'File surat pernyataan harus format PDF',
        'link_surat_pernyataan.max' => 'File surat pernyataan maksimal 500kb',
        'link_surat_kesiapan.required' => 'Surat kesiapan mahasiswa wajib diisi',
        'link_surat_kesiapan.mimes' => 'File surat kesiapan harus format PDF',
        'link_surat_kesiapan.max' => 'File surat kesiapan maksimal 500kb',
    ];

    // Validasi
    $validated = $request->validate($rules, $messages);

    DB::beginTransaction();
    try {
        if ($data_mahasiswa->status === 'revisi' || $data_mahasiswa->status === null) {
            // Persiapkan data untuk update
            $updateData = [
                'province_code' => $validated['province_code'],
                'regency_code' => $validated['regency_code'],
                'subdistrict_code' => $validated['subdistrict_code'],
                'village_code' => $validated['village_code'],
                'province_code_now' => $validated['province_code_now'],
                'regency_code_now' => $validated['regency_code_now'],
                'subdistrict_code_now' => $validated['subdistrict_code_now'],
                'village_code_now' => $validated['village_code_now'],
                'ipk' => $validated['ipk'],
                'id_prodi' => $validated['id_prodi'],
                'nilai_micro_teaching' => $validated['nilai_micro_teaching'],
                'no_hp_wa' => $validated['no_hp_wa'],
                'cluster_kegiatan' => $validated['cluster_kegiatan'],
                'semester' => $validated['semester'],
                'jk' => $validated['jk'],
                'alamat_asal' => $validated['alamat_asal'],
                'status' => 'submitted',
                'id_gelombang' => $latestGelombang->id,
                'updated_at' => now(),
            ];

            // Handle file upload untuk transkrip nilai
            if ($request->hasFile('link_transkrip_nilai')) {
                $file = $request->file('link_transkrip_nilai');
                
                // Delete old file if exists
                if ($data_mahasiswa->link_transkrip_nilai && Storage::disk('public')->exists($data_mahasiswa->link_transkrip_nilai)) {
                    Storage::disk('public')->delete($data_mahasiswa->link_transkrip_nilai);
                }
                
                $custom_file_name = 'transkrip_' . Auth::user()->username . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file_path = $file->storeAs('transkrip_nilai', $custom_file_name, 'public');
                $updateData['link_transkrip_nilai'] = $file_path;
            } else {
                // Jika tidak upload file baru, pertahankan file lama
                $updateData['link_transkrip_nilai'] = $data_mahasiswa->link_transkrip_nilai;
            }

            // Handle file upload untuk surat pernyataan
            if ($request->hasFile('link_surat_pernyataan')) {
                $file = $request->file('link_surat_pernyataan');
                
                // Delete old file if exists
                if ($data_mahasiswa->link_surat_pernyataan && Storage::disk('public')->exists($data_mahasiswa->link_surat_pernyataan)) {
                    Storage::disk('public')->delete($data_mahasiswa->link_surat_pernyataan);
                }
                
                $custom_file_name = 'surat_pernyataan_' . Auth::user()->username . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file_path = $file->storeAs('documents/surat_pernyataan', $custom_file_name, 'public');
                $updateData['link_surat_pernyataan'] = $file_path;
            } else {
                // Jika tidak upload file baru, pertahankan file lama
                $updateData['link_surat_pernyataan'] = $data_mahasiswa->link_surat_pernyataan;
            }

            // Handle file upload untuk surat kesiapan
            if ($request->hasFile('link_surat_kesiapan')) {
                $file = $request->file('link_surat_kesiapan');
                
                // Delete old file if exists
                if ($data_mahasiswa->link_surat_kesiapan && Storage::disk('public')->exists($data_mahasiswa->link_surat_kesiapan)) {
                    Storage::disk('public')->delete($data_mahasiswa->link_surat_kesiapan);
                }
                
                $custom_file_name = 'surat_kesiapan_' . Auth::user()->username . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file_path = $file->storeAs('documents/surat_kesiapan', $custom_file_name, 'public');
                $updateData['link_surat_kesiapan'] = $file_path;
            } else {
                // Jika tidak upload file baru, pertahankan file lama
                $updateData['link_surat_kesiapan'] = $data_mahasiswa->link_surat_kesiapan;
            }

            // Update data mahasiswa
            $result = $data_mahasiswa->update($updateData);

            DB::commit();
            
   
            
            return redirect()->back()->with('message', ['success' => 'Profil Berhasil diperbaharui!']);
            
        } elseif ($data_mahasiswa->status === 'accepted') {
            DB::rollBack();
            return redirect()->back()->with('message', ['error' => 'Pendaftaranmu sudah disetujui, tidak dapat mengubah data.']);
            
        } elseif ($data_mahasiswa->status === 'submitted') {
            DB::rollBack();
            return redirect()->back()->with('message', ['error' => 'Data kamu sedang di-review, tidak dapat mengubah data.']);
            
        } elseif ($data_mahasiswa->status === 'rejected') {
            DB::rollBack();
            return redirect()->back()->with('message', ['error' => 'Biodatamu ditolak, silakan daftar di gelombang selanjutnya.']);
        }
        
    } catch (ValidationException $e) {
        DB::rollBack();
        throw $e;
        
    } catch (Exception $e) {
        DB::rollBack();
   
        
        return redirect()->back()->with('message', ['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
    }
}

    /**
     * Ambil data transkrip nilai mahasiswa aktif dari Sevima API.
     */
    public function getTranskrip(SevimaService $sevima)
    {
        $nim = Auth::user()->username;

        try {
            $response = $sevima->getTranskripMahasiswa($nim);

            if ($response->failed()) {
                return response()->json(['error' => 'Gagal menghubungi server Sevima.'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Lihat/preview dokumen yang diupload secara secure.
     */
    public function viewDocument($type)
    {
        $mahasiswa = Mahasiswa::where('nim', Auth::user()->username)->first();
        if (!$mahasiswa) {
            abort(404);
        }

        $filePath = null;
        if ($type === 'transkrip') {
            $filePath = $mahasiswa->link_transkrip_nilai;
        } elseif ($type === 'surat_pernyataan') {
            $filePath = $mahasiswa->link_surat_pernyataan;
        } elseif ($type === 'surat_kesiapan') {
            $filePath = $mahasiswa->link_surat_kesiapan;
        }

        if (!$filePath || !Storage::disk('public')->exists($filePath)) {
            abort(404, 'File tidak ditemukan.');
        }

        return response()->file(Storage::disk('public')->path($filePath), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . basename($filePath) . '"'
        ]);
    }
}
