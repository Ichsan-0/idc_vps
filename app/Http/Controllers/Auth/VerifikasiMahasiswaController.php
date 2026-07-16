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
    public function create()
    {
        header('Content-Type: text/plain; charset=utf-8');
        echo "=========================================\n";
        echo "     WEB SERVER CONTEXT DIAGNOSTICS      \n";
        echo "=========================================\n\n";

        // 1. Cek User yang menjalankan PHP-FPM (cara aman)
        $processUserName = 'Unknown';
        if (function_exists('posix_getpwuid') && function_exists('posix_geteuid')) {
            $user = posix_getpwuid(posix_geteuid());
            $processUserName = $user['name'] ?? 'Unknown';
        } else {
            $processUserName = trim(shell_exec('whoami') ?? 'posix disabled');
        }
        echo "[1] USER RUNNING PHP-FPM: " . $processUserName . "\n\n";

        // 2. Cek Pembacaan File .env
        $envPath = base_path('.env');
        echo "[2] FILE PERMISSIONS FOR .env:\n";
        echo "Path: " . $envPath . "\n";
        if (file_exists($envPath)) {
            echo "Exists: YES\n";
            echo "Permissions: " . substr(sprintf('%o', fileperms($envPath)), -4) . "\n";
            echo "Owner ID: " . fileowner($envPath) . "\n";
            echo "Readable: " . (is_readable($envPath) ? 'YES' : 'NO') . "\n";
        } else {
            echo "Exists: NO\n";
        }
        echo "\n";

        // 3. Cek Nilai Env di Web Context
        $baseUrl = env('SEVIMA_BASE_URL', 'https://api.sevimaplatform.com/siakadcloud/v1');
        $appKey = env('SEVIMA_APP_KEY');
        $secretKey = env('SEVIMA_APP_SECRET');

        echo "[3] SEVIMA ENV VALUES IN WEB CONTEXT:\n";
        echo "SEVIMA_BASE_URL: " . $baseUrl . "\n";
        echo "SEVIMA_APP_KEY: " . ($appKey ? substr($appKey, 0, 5) . '...' : 'KOSONG / TIDAK TERBACA') . "\n";
        echo "SEVIMA_APP_SECRET: " . ($secretKey ? substr($secretKey, 0, 5) . '...' : 'KOSONG / TIDAK TERBACA') . "\n\n";

        // 4. Tes Koneksi ke Sevima dari Web Context
        echo "[4] TESTING SEVIMA API CONNECTION:\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . "/mahasiswa/220212005");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "X-App-Key: " . $appKey,
            "X-Secret-Key: " . $secretKey,
            "Accept: application/json"
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErrNo = curl_errno($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlErrNo) {
            echo "CURL ERROR (#$curlErrNo): $curlError\n";
        } else {
            echo "HTTP STATUS: $httpCode\n";
            echo "RESPONSE BODY: " . substr($response, 0, 300) . "...\n";
        }

        exit;
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

            // Jika nilai micro teaching belum ada, jangan simpan session
            // dan redirect balik ke halaman verifikasi dengan flash warning
            if (empty($nilaiMicroTeaching)) {
                return redirect()
                    ->route('verifikasi.mahasiswa')
                    ->with('micro_warning', true);
            }

            // Nilai micro ada → simpan session dan lanjut ke registrasi
            session(['verified_mahasiswa' => $verifiedData]);

            return redirect()->route('registrasi.ppkpm');

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
}
