<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\SevimaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class VerifikasiMahasiswaController extends Controller
{
    /**
     * Tampilkan halaman form verifikasi NIM & tanggal lahir.
     */
    public function create(): Response
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

                return back()->withErrors([
                    'nim' => 'Gagal menghubungi server Sevima. Coba lagi nanti.',
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

            // Fetch transkrip data API
            $transkripResponse = $sevima->getTranskripMahasiswa($request->nim);
            $nilaiMicroTeaching = '';

            if ($transkripResponse->successful()) {
                $transkripJson = $transkripResponse->json();
                $transkripData = $transkripJson['data'] ?? [];

                if (is_array($transkripData) && count($transkripData) > 0) {
                    foreach ($transkripData as $item) {
                        if (isset($item['attributes']['nama_mata_kuliah'])) {
                            $namaMk = strtolower(trim($item['attributes']['nama_mata_kuliah']));
                            if ($namaMk === 'micro teaching' || $namaMk === 'microteaching') {
                                // Defaulting to nilai_huruf, but fallback to nilai if it's named differently
                                $nilaiMicroTeaching = $item['attributes']['nilai_huruf'] ?? $item['attributes']['nilai'] ?? '';
                                break;
                            }
                        }
                    }
                }
            }

            // Verifikasi berhasil! Simpan data ke session dan redirect ke registrasi
            $verifiedData = [
                'nim'            => $attributes['nim']            ?? $request->nim,
                'nama'           => $attributes['nama']           ?? null,
                'tanggal_lahir'  => $tglLahirNormal,
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
            ];

            session(['verified_mahasiswa' => $verifiedData]);

            return redirect()->route('registrasi.ppkpm');

        } catch (\Exception $e) {
            Log::error('[Verifikasi] Exception tidak terduga', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return back()->withErrors([
                'nim' => 'Terjadi kesalahan pada sistem. Coba lagi nanti.',
            ]);
        }
    }
}
