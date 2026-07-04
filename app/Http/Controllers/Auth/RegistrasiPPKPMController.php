<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\User;
use App\Services\SevimaService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegistrasiPPKPMController extends Controller
{
    /**
     * Tampilkan form registrasi PPKPM dengan data yang sudah terverifikasi.
     */
    public function create(): Response|RedirectResponse
    {
        $verifiedData = session('verified_mahasiswa');

        if (!$verifiedData) {
            return redirect()->route('verifikasi.mahasiswa')->withErrors([
                'nim' => 'Silakan lakukan verifikasi NIM terlebih dahulu.',
            ]);
        }

        return Inertia::render('Auth/RegistrasiPPKPM', [
            'verifiedData' => $verifiedData,
            'list_prodi'   => \App\Models\Prodi::all(),
            'base_url'     => url('/'),
        ]);
    }

    /**
     * Simpan data registrasi mahasiswa PPKPM ke tabel users dan mahasiswa_tbl.
     */
    public function store(Request $request): RedirectResponse
    {
        $verifiedData = session('verified_mahasiswa');

        if (!$verifiedData) {
            return redirect()->route('verifikasi.mahasiswa');
        }

        $nim = $verifiedData['nim'];
        if (User::where('username', $nim)->exists() || Mahasiswa::where('nim', $nim)->exists()) {
            return redirect()->route('verifikasi.mahasiswa')->withErrors([
                'nim' => 'NIM ' . $nim . ' sudah terdaftar dalam sistem. Silakan login atau hubungi admin.',
            ]);
        }

        $request->validate([
            // Data Akun
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|lowercase|email|max:255|unique:' . User::class . ',email',
            'password'     => ['required', 'confirmed', Rules\Password::defaults()],

            // Data Pribadi
            'hp'           => 'required|string|max:20',
            'jk'           => 'required|string|in:L,P,Pria,Wanita',
            'id_prodi'     => 'required|exists:prodi_tbl,id',
            'semester'     => 'required|numeric|min:1|max:14',
            'ipk'          => 'required|numeric|min:0|max:4',

            // nullable: nilai micro teaching bisa belum ada dari Sevima
            'nilai_micro_teaching' => 'nullable|string|max:10',
            'cluster_kegiatan'     => 'required|string',

            // Alamat Asal (wajib)
            'alamat_asal'          => 'required|string|max:500',
            'province_code'        => 'required|string',
            'regency_code'         => 'required|string',
            'subdistrict_code'     => 'required|string',
            'village_code'         => 'required|string',

            // Alamat Sekarang (opsional)
            'alamat_sekarang'      => 'nullable|string|max:500',
            'province_code_now'    => 'nullable|string',
            'regency_code_now'     => 'nullable|string',
            'subdistrict_code_now' => 'nullable|string',
            'village_code_now'     => 'nullable|string',

            // Dokumen
            'link_transkrip_nilai'  => 'nullable|file|mimes:pdf|max:512',
            'link_surat_pernyataan' => 'required|file|mimes:pdf|max:512',
            'link_surat_kesiapan'   => 'required|file|mimes:pdf|max:512',
        ], [
            'email.unique'              => 'Email ini sudah terdaftar. Gunakan email lain atau login.',
            'id_prodi.exists'           => 'Program studi tidak ditemukan.',
            'province_code.required'    => 'Provinsi asal wajib diisi.',
            'regency_code.required'     => 'Kabupaten asal wajib diisi.',
            'subdistrict_code.required' => 'Kecamatan asal wajib diisi.',
            'village_code.required'     => 'Desa asal wajib diisi.',
            'link_surat_pernyataan.required' => 'Surat Pernyataan Ka Prodi wajib diunggah.',
            'link_surat_kesiapan.required'   => 'Surat Kesiapan Mahasiswa wajib diunggah.',
            'link_surat_pernyataan.max'      => 'Ukuran Surat Pernyataan maksimal 500KB.',
            'link_surat_kesiapan.max'        => 'Ukuran Surat Kesiapan maksimal 500KB.',
            'link_transkrip_nilai.max'       => 'Ukuran Transkrip Nilai maksimal 500KB.',
        ]);

        $latestGelombang = \App\Models\Gelombang::latest()->first();

        DB::transaction(function () use ($request, $verifiedData, $latestGelombang) {

            // =============================================
            // 1. Simpan ke tabel USERS
            // =============================================
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'username' => $verifiedData['nim'],   // NIM sebagai username
                'password' => Hash::make($request->password),
                'role'     => 'mahasiswa',
            ]);

            event(new Registered($user));

            Auth::login($user);

            // =============================================
            // 2. Handle Upload File ke storage/app/public
            // =============================================
            $paths = [];
            
            // Simpan transkrip ke folder transkrip_nilai
            if ($request->hasFile('link_transkrip_nilai')) {
                $file = $request->file('link_transkrip_nilai');
                $filename = 'transkrip_' . $verifiedData['nim'] . '_' . time() . '.' . $file->getClientOriginalExtension();
                $paths['link_transkrip_nilai'] = $file->storeAs('transkrip_nilai', $filename, 'public');
            }

            // Simpan surat pernyataan ke folder documents/surat_pernyataan
            if ($request->hasFile('link_surat_pernyataan')) {
                $file = $request->file('link_surat_pernyataan');
                $filename = 'surat_pernyataan_' . $verifiedData['nim'] . '_' . time() . '.' . $file->getClientOriginalExtension();
                $paths['link_surat_pernyataan'] = $file->storeAs('documents/surat_pernyataan', $filename, 'public');
            }

            // Simpan surat kesiapan ke folder documents/surat_kesiapan
            if ($request->hasFile('link_surat_kesiapan')) {
                $file = $request->file('link_surat_kesiapan');
                $filename = 'surat_kesiapan_' . $verifiedData['nim'] . '_' . time() . '.' . $file->getClientOriginalExtension();
                $paths['link_surat_kesiapan'] = $file->storeAs('documents/surat_kesiapan', $filename, 'public');
            }

            // Normalisasi jenis kelamin agar seragam dengan database ('Pria' / 'Wanita')
            $jk = $request->jk;
            if ($jk === 'L') $jk = 'Pria';
            if ($jk === 'P') $jk = 'Wanita';

            // =============================================
            // 3. Simpan ke tabel MAHASISWA_TBL
            // =============================================
            Mahasiswa::create([
                // Identitas
                'nim'                  => $verifiedData['nim'],
                'id_prodi'             => $request->id_prodi,
                'jk'                   => $jk,
                'no_hp_wa'             => $request->hp,

                // Akademik
                'semester'             => $request->semester,
                'ipk'                  => $request->ipk,
                'nilai_micro_teaching' => $request->nilai_micro_teaching ?? null,
                'cluster_kegiatan'     => $request->cluster_kegiatan,

                // Alamat Asal
                'alamat_asal'          => $request->alamat_asal,
                'province_code'        => $request->province_code,
                'regency_code'         => $request->regency_code,
                'subdistrict_code'     => $request->subdistrict_code,
                'village_code'         => $request->village_code,

                // Alamat Sekarang
                'alamat_sekarang'      => $request->alamat_sekarang ?? null,
                'province_code_now'    => $request->province_code_now ?? null,
                'regency_code_now'     => $request->regency_code_now ?? null,
                'subdistrict_code_now' => $request->subdistrict_code_now ?? null,
                'village_code_now'     => $request->village_code_now ?? null,

                // Gelombang & Status
                'id_gelombang'         => $latestGelombang ? $latestGelombang->id : null,
                'status'               => 'submitted',

                // Dokumen
                'link_transkrip_nilai'  => $paths['link_transkrip_nilai'] ?? null,
                'link_surat_pernyataan' => $paths['link_surat_pernyataan'] ?? null,
                'link_surat_kesiapan'   => $paths['link_surat_kesiapan'] ?? null,
            ]);

            // =============================================
            // 4. Buat API Token untuk mahasiswa
            // =============================================
            $token = $user->createToken('api-token')->plainTextToken;
            session(['access_token' => $token]);
        });

        // Hapus session verifikasi setelah selesai
        session()->forget('verified_mahasiswa');

        return redirect()->route('profil')->with('message', [
            'success' => 'Pendaftaran berhasil! Selamat datang di IDC. Data Anda sedang dalam proses review.'
        ]);
    }

    /**
     * Ambil data transkrip nilai mahasiswa aktif dari Sevima API.
     */
    public function getTranskrip(SevimaService $sevima)
    {
        $verifiedData = session('verified_mahasiswa');

        if (!$verifiedData) {
            return response()->json(['error' => 'Silakan verifikasi NIM terlebih dahulu.'], 401);
        }

        try {
            $response = $sevima->getTranskripMahasiswa($verifiedData['nim']);

            if ($response->failed()) {
                return response()->json(['error' => 'Gagal menghubungi server Sevima.'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }
}
