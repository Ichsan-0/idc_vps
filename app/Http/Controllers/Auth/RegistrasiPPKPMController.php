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
     * Simpan data registrasi mahasiswa PPKPM.
     */
    public function store(Request $request): RedirectResponse
    {
        $verifiedData = session('verified_mahasiswa');

        if (!$verifiedData) {
            return redirect()->route('verifikasi.mahasiswa');
        }

        $request->validate([
            'name'         => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class.',email',
            'password'     => ['required', 'confirmed', Rules\Password::defaults()],
            'hp'           => 'required|string|max:20',
            'jk'           => 'required|string|in:L,P',
            'id_prodi'     => 'required|exists:prodi_tbl,id',
            'semester'     => 'required|numeric',
            'ipk'          => 'required|numeric|min:0|max:4',
            'nilai_micro_teaching' => 'required|string',
            'cluster_kegiatan'     => 'required|string',
            'alamat_asal'         => 'required|string|max:500',
            'province_code'        => 'required|string',
            'regency_code'         => 'required|string',
            'subdistrict_code'     => 'required|string',
            'village_code'         => 'required|string',
            'link_transkrip_nilai'  => 'nullable|file|mimes:pdf|max:512',
            'link_surat_pernyataan' => 'required|file|mimes:pdf|max:512',
            'link_surat_kesiapan'   => 'required|file|mimes:pdf|max:512',
        ]);

        $latestGelombang = \App\Models\Gelombang::latest()->first();

        DB::transaction(function () use ($request, $verifiedData, $latestGelombang) {
            // 1. Simpan User
            $user = User::create([
                'name'         => $request->name,
                'email'        => $request->email,
                'username'     => $verifiedData['nim'],
                'password'     => Hash::make($request->password),
                'role'         => 'mahasiswa',
            ]);

            event(new Registered($user));

            Auth::login($user);

            // 2. Handle File Uploads (Simpan di storage/app/public)
            $paths = [];
            foreach (['link_transkrip_nilai', 'link_surat_pernyataan', 'link_surat_kesiapan'] as $field) {
                if ($request->hasFile($field)) {
                    $file = $request->file($field);
                    $folder = str_replace('link_', '', $field);
                    $filename = $folder . '_' . $verifiedData['nim'] . '_' . time() . '.' . $file->getClientOriginalExtension();
                    $paths[$field] = $file->storeAs($folder, $filename, 'public');
                }
            }

            // 3. Simpan Mahasiswa
            Mahasiswa::create([
                'nim'                  => $verifiedData['nim'],
                'id_prodi'             => $request->id_prodi,
                'no_hp_wa'             => $request->hp,
                'jk'                   => $request->jk,
                'semester'             => $request->semester,
                'ipk'                  => $request->ipk,
                'nilai_micro_teaching' => $request->nilai_micro_teaching,
                'cluster_kegiatan'     => $request->cluster_kegiatan,
                'alamat_asal'         => $request->alamat_asal,
                'province_code'        => $request->province_code,
                'regency_code'         => $request->regency_code,
                'subdistrict_code'     => $request->subdistrict_code,
                'village_code'         => $request->village_code,
                'province_code_now'    => $request->province_code_now,
                'regency_code_now'     => $request->regency_code_now,
                'subdistrict_code_now' => $request->subdistrict_code_now,
                'village_code_now'     => $request->village_code_now,
                'id_gelombang'         => $latestGelombang ? $latestGelombang->id : null,
                'status'               => 'submitted',
                'link_transkrip_nilai'  => $paths['link_transkrip_nilai'] ?? null,
                'link_surat_pernyataan' => $paths['link_surat_pernyataan'] ?? null,
                'link_surat_kesiapan'   => $paths['link_surat_kesiapan'] ?? null,
            ]);

            $token = $user->createToken('api-token')->plainTextToken;
            session(['access_token' => $token]);
        });

        session()->forget('verified_mahasiswa');

        return redirect()->route('dashboard');
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
