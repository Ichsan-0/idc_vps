<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\SevimaService;
use Carbon\Carbon;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\DispensasiSyarat;

class VerifikasiMahasiswaController extends Controller
{
    /**
     * Tampilkan halaman form verifikasi NIM & tanggal lahir.
     */
    public function create()
    {
        return Inertia::render('Auth/VerifikasiMahasiswa');
    }

    /**
     * Cek data mahasiswa ke API Sevima berdasarkan NIM dan tanggal lahir.
     * Endpoint: GET /mahasiswa/{nim}
     * Response: { "data": { "attributes": { "nim": ..., "tanggal_lahir": ..., ... } } }
     */
    public function check(Request $request, SevimaService $sevima)
    {
        $request->validate([
            'nim'           => 'required|string',
            'tanggal_lahir' => 'required|date_format:Y-m-d',
        ]);

        if (\App\Models\User::where('username', $request->nim)->exists() || \App\Models\Mahasiswa::where('nim', $request->nim)->exists()) {
            return back()->withErrors([
                'nim' => 'NIM ' . $request->nim . ' sudah terdaftar dalam sistem. Silakan login atau hubungi admin.',
            ]);
        }

        try {
            $response = $sevima->getMahasiswaByNim($request->nim);

            // Jika API gagal atau 404
            if ($response->failed()) {
                Log::error('[Verifikasi] API gagal', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                if ($response->status() === 404) {
                    return back()->withErrors([
                        'nim' => 'Mahasiswa dengan NIM tersebut tidak ditemukan.',
                    ]);
                }

                $status = $response->status();
                $body = substr($response->body(), 0, 100);
                return back()->withErrors([
                    'nim' => "Gagal menghubungi server Sevima. Status: {$status}. Body: {$body}",
                ]);
            }

            $json = $response->json();

            // Log seluruh response untuk debug
            Log::debug('[Verifikasi] Raw API Response', [
                'nim'      => $request->nim,
                'response' => $json,
            ]);

            // Endpoint /mahasiswa/{nim} mengembalikan object tunggal:
            // { "data": { "attributes": { ... } } }
            $attributes = $json['data']['attributes'] ?? null;

            // Fallback: jika response langsung { "attributes": { ... } }
            if (!$attributes) {
                $attributes = $json['attributes'] ?? null;
            }

            if (!$attributes) {
                Log::warning('[Verifikasi] Struktur response tidak dikenali', ['json' => $json]);
                return back()->withErrors([
                    'nim' => 'Mahasiswa dengan NIM tersebut tidak ditemukan.',
                ]);
            }

            // Log semua keys yang tersedia di attributes (untuk debug nama field)
            Log::debug('[Verifikasi] Attributes keys tersedia', [
                'nim_input'       => $request->nim,
                'attributes_keys' => array_keys($attributes),
                'attributes'      => $attributes,
            ]);

            // Ambil tanggal lahir dari attributes
            $tglLahirApi = $attributes['tanggal_lahir']
                ?? $attributes['tgl_lahir']
                ?? $attributes['birthdate']
                ?? $attributes['birth_date']
                ?? null;

            if (empty($tglLahirApi)) {
                Log::warning('[Verifikasi] Field tanggal_lahir tidak ditemukan', [
                    'available_keys' => array_keys($attributes),
                ]);
                return back()->withErrors([
                    'tanggal_lahir' => 'Data tanggal lahir tidak tersedia di sistem. Hubungi admin.',
                ]);
            }

            // Normalisasi ke YYYY-MM-DD
            try {
                $tglLahirNormal = Carbon::parse($tglLahirApi)->format('Y-m-d');
            } catch (\Exception $e) {
                $tglLahirNormal = substr($tglLahirApi, 0, 10);
            }

            $tglLahirInput = $request->tanggal_lahir;

            Log::debug('[Verifikasi] Perbandingan tanggal lahir', [
                'input'    => $tglLahirInput,
                'api_raw'  => $tglLahirApi,
                'api_norm' => $tglLahirNormal,
                'match'    => ($tglLahirNormal === $tglLahirInput),
            ]);

            if ($tglLahirNormal !== $tglLahirInput) {
                return back()->withErrors([
                    'tanggal_lahir' => 'Tanggal lahir tidak sesuai dengan data mahasiswa.',
                ]);
            }

            // Fetch perwalian data API
            $perwalianResponse = $sevima->getPerwalianMahasiswa($request->nim);
            $semesterPerwalian = '';
            $ipkPerwalian = '';

            if ($perwalianResponse->successful()) {
                $perwalianJson = $perwalianResponse->json();
                $perwalianData = $perwalianJson['data'] ?? [];
                
                if (is_array($perwalianData) && count($perwalianData) > 0) {
                    $highestItem = null;
                    $highestId = -1;
                    
                    foreach ($perwalianData as $item) {
                        $id = isset($item['id']) ? (int) $item['id'] : -1;
                        if ($id > $highestId) {
                            $highestId = $id;
                            $highestItem = $item;
                        }
                    }
                    
                    if ($highestItem && isset($highestItem['attributes'])) {
                        $semesterPerwalian = $highestItem['attributes']['semester_mahasiswa'] ?? '';
                        $ipkPerwalian = $highestItem['attributes']['ipk'] ?? '';
                    }
                }
            }

            // Determine if MPI student
            $prodiName = isset($attributes['program_studi']) ? trim($attributes['program_studi']) : '';
            $isMpi = (stripos($prodiName, 'Manajemen Pendidikan Islam') !== false) || (stripos($prodiName, 'MPI') !== false);

            // Fetch transkrip data API
            $transkripResponse = $sevima->getTranskripMahasiswa($request->nim);
            $nilaiMicroTeaching = '';
            $sksDiambil = 0;

            if ($transkripResponse->successful()) {
                $transkripJson = $transkripResponse->json();
                $transkripData = $transkripJson['data'] ?? [];

                if (is_array($transkripData) && count($transkripData) > 0) {
                    foreach ($transkripData as $item) {
                        $attrs = $item['attributes'] ?? [];
                        
                        // Hitung total SKS diambil
                        $sks = (float)($attrs['sks_mata_kuliah'] ?? $attrs['sks'] ?? 0);
                        $sksDiambil += $sks;

                        if (isset($attrs['nama_mata_kuliah']) && empty($nilaiMicroTeaching)) {
                            $cleanedMk = strtolower(trim($attrs['nama_mata_kuliah']));
                            $cleanedMk = preg_replace('/\s+/', ' ', $cleanedMk);

                            $isMatch = false;
                            if ($isMpi) {
                                $isMatch = ($cleanedMk === 'micro profesi / program latihan profesi (plp) i') ||
                                           ($cleanedMk === 'micro profesi/program latihan profesi (plp) i') ||
                                           ($cleanedMk === 'micro profesi / program latihan profesi (plp) 1') ||
                                           ($cleanedMk === 'micro profesi/program latihan profesi (plp) 1') ||
                                           (strpos($cleanedMk, 'micro profesi') !== false) ||
                                           (strpos($cleanedMk, 'program latihan profesi') !== false && strpos($cleanedMk, 'plp') !== false);
                            } else {
                                $isMatch = ($cleanedMk === 'micro teaching' || $cleanedMk === 'microteaching');
                            }

                            if ($isMatch) {
                                // Defaulting to nilai_huruf, but fallback to nilai if it's named differently
                                $nilaiMicroTeaching = $attrs['nilai_huruf'] ?? $attrs['nilai'] ?? '';
                            }
                        }
                    }
                }
            }

            // Verifikasi berhasil! Simpan data ke session dan redirect ke registrasi
            $verifiedData = [
                'nim'            => $attributes['nim']            ?? $request->nim,
                'nama'           => $attributes['nama']           ?? null,
                'tanggal_lahir'  => $tglLiarNormal ?? $tglLahirNormal,
                'jenis_kelamin'  => $attributes['jenis_kelamin']  ?? null,
                'tempat_lahir'   => $attributes['tempat_lahir']   ?? null,
                'agama'          => $attributes['agama']          ?? null,
                'program_studi'  => $attributes['program_studi']  ?? null,
                'angkatan'       => $attributes['angkatan']       ?? null,
                'status'         => $attributes['status']         ?? null,
                'email'          => $attributes['email']          ?? null,
                'hp'             => $attributes['hp']             ?? $attributes['telepon'] ?? null,
                'alamat'         => $attributes['alamat']         ?? $attributes['alamat_asal'] ?? $attributes['domisili'] ?? null,
                'semester'       => $semesterPerwalian,
                'ipk'            => $ipkPerwalian,
                'nilai_micro_teaching' => $nilaiMicroTeaching,
                'sks_diambil'    => $sksDiambil,
            ];

            $dispensasi = DispensasiSyarat::where('nim', $request->nim)->first();
            $hasDispensasiRecord = $dispensasi ? true : false;
            $skipMicroteaching = $dispensasi ? $dispensasi->skip_microteaching : false;
            $skipSks = $dispensasi ? $dispensasi->skip_sks : false;

            // 1. Jika nilai micro teaching belum ada
            if (!$skipMicroteaching && empty($nilaiMicroTeaching)) {
                return redirect()
                    ->route('verifikasi.mahasiswa')
                    ->with('micro_warning', [
                        'type' => 'not_found',
                        'is_mpi' => $isMpi,
                        'sks_diambil' => $sksDiambil,
                        'nim' => $attributes['nim'] ?? $request->nim,
                        'nama' => $attributes['nama'] ?? $attributes['name'] ?? '',
                        'has_dispensasi' => $hasDispensasiRecord,
                    ]);
            }

            // 2. Jika nilai di bawah B-
            $nilaiClean = strtoupper(trim($nilaiMicroTeaching));
            $validGrades = ['A', 'A-', 'B+', 'B', 'B-'];
            if (!$skipMicroteaching && !in_array($nilaiClean, $validGrades)) {
                return redirect()
                    ->route('verifikasi.mahasiswa')
                    ->with('micro_warning', [
                        'type' => 'under_grade',
                        'nilai' => $nilaiMicroTeaching,
                        'is_mpi' => $isMpi,
                        'sks_diambil' => $sksDiambil,
                        'nim' => $attributes['nim'] ?? $request->nim,
                        'nama' => $attributes['nama'] ?? $attributes['name'] ?? '',
                        'has_dispensasi' => $hasDispensasiRecord,
                    ]);
            }

            // 3. Jika total SKS di bawah 132 SKS
            if (!$skipSks && $sksDiambil < 132) {
                return redirect()
                    ->route('verifikasi.mahasiswa')
                    ->with('micro_warning', [
                        'type' => 'insufficient_sks',
                        'sks_diambil' => $sksDiambil,
                        'nilai' => $nilaiMicroTeaching,
                        'is_mpi' => $isMpi,
                        'nim' => $attributes['nim'] ?? $request->nim,
                        'nama' => $attributes['nama'] ?? $attributes['name'] ?? '',
                        'has_dispensasi' => $hasDispensasiRecord,
                    ]);
            }

            // Nilai micro ada dan sesuai syarat (atau dispen) → simpan session dan lanjut ke registrasi
            session(['verified_mahasiswa' => $verifiedData]);

            return redirect()->route('registrasi.ppkpm');

        } catch (ConnectionException $e) {
            Log::error('[Verifikasi] Koneksi ke Sevima gagal', [
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'nim' => 'Tidak dapat terhubung ke server Sevima. Pastikan koneksi internet server aktif atau hubungi admin.',
            ]);

        } catch (\Exception $e) {
            Log::error('[Verifikasi] Exception tidak terduga', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return back()->withErrors([
                'nim' => 'Terjadi kesalahan pada sistem: ' . $e->getMessage(),
            ]);
        }
    }

    public function ajukanPertimbangan(Request $request)
    {
        $request->validate([
            'nim' => 'required|string',
            'nama' => 'required|string',
            'alasan' => 'required|string',
            'sks_diambil' => 'nullable|integer',
            'nilai_microteaching' => 'nullable|string',
        ]);

        try {
            $existing = DispensasiSyarat::where('nim', $request->nim)->first();

            // Fetch current active gelombang
            $activeGelombang = \App\Models\Gelombang::where('active', true)->first() 
                ?? \App\Models\Gelombang::latest()->first();
            $idGelombang = $activeGelombang ? $activeGelombang->id : null;

            if ($existing) {
                $existing->update([
                    'nama' => $request->nama,
                    'id_gelombang' => $idGelombang ?? $existing->id_gelombang,
                    'alasan' => $request->alasan,
                    'sks_diambil' => $request->sks_diambil ?? $existing->sks_diambil,
                    'nilai_microteaching' => $request->nilai_microteaching ?? $existing->nilai_microteaching,
                    'status' => 'pending',
                ]);
            } else {
                DispensasiSyarat::create([
                    'nim' => $request->nim,
                    'nama' => $request->nama,
                    'id_gelombang' => $idGelombang,
                    'alasan' => $request->alasan,
                    'sks_diambil' => $request->sks_diambil ?? 0,
                    'nilai_microteaching' => $request->nilai_microteaching ?? '-',
                    'skip_microteaching' => false,
                    'skip_sks' => false,
                    'status' => 'pending',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Permohonan pertimbangan dispensasi berhasil diajukan. Silakan tunggu peninjauan dari admin.'
            ]);
        } catch (\Exception $e) {
            Log::error('[Verifikasi] Gagal mengajukan pertimbangan', [
                'message' => $e->getMessage(),
                'nim' => $request->nim,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat mengajukan pertimbangan: ' . $e->getMessage()
            ], 500);
        }
    }
}
