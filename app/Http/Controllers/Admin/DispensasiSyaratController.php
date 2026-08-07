<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DispensasiSyarat;
use App\Services\SevimaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DispensasiSyaratController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status', 'all');
        $search = $request->input('search');
        
        $query = DispensasiSyarat::with('gelombang')->orderBy('created_at', 'desc');
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nim', 'like', "%{$search}%")
                  ->orWhere('alasan', 'like', "%{$search}%");
            });
        }
        
        $dispensations = $query->get();

        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/DispensasiSyarat', [
            'dispensations' => $dispensations,
            'filters' => [
                'status' => $status,
                'search' => $search ?? '',
            ]
        ]);
    }

    public function checkNim(Request $request, SevimaService $sevima)
    {
        $nim = $request->query('nim');
        if (!$nim) {
            return response()->json(['message' => 'NIM tidak boleh kosong.'], 400);
        }

        $response = $sevima->getMahasiswaByNim($nim);

        if ($response->successful()) {
            $json = $response->json();
            $attributes = $json['data']['attributes'] ?? $json['attributes'] ?? null;

            if ($attributes) {
                // Fetch transkrip and calculate SKS & microteaching grade
                $prodiName = isset($attributes['program_studi']) ? trim($attributes['program_studi']) : '';
                $isMpi = (stripos($prodiName, 'Manajemen Pendidikan Islam') !== false) || (stripos($prodiName, 'MPI') !== false);

                $transkripResponse = $sevima->getTranskripMahasiswa($nim);
                $nilaiMicroTeaching = '';
                $sksDiambil = 0;

                if ($transkripResponse->successful()) {
                    $transkripJson = $transkripResponse->json();
                    $transkripData = $transkripJson['data'] ?? [];

                    if (is_array($transkripData) && count($transkripData) > 0) {
                        foreach ($transkripData as $item) {
                            $attrs = $item['attributes'] ?? [];
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
                                    $nilaiMicroTeaching = $attrs['nilai_huruf'] ?? $attrs['nilai'] ?? '';
                                }
                            }
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'data' => [
                        'nim' => $attributes['nim'] ?? $nim,
                        'nama' => $attributes['nama'] ?? $attributes['name'] ?? null,
                        'program_studi' => $attributes['program_studi'] ?? null,
                        'angkatan' => $attributes['angkatan'] ?? null,
                        'sks_diambil' => $sksDiambil,
                        'nilai_microteaching' => $nilaiMicroTeaching ?: '-',
                    ]
                ]);
            }
        }

        return response()->json(['success' => false, 'message' => 'Data mahasiswa tidak ditemukan di Sevima.'], 404);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nim' => 'required|string',
            'nama' => 'required|string',
            'alasan' => 'required|string',
            'skip_microteaching' => 'boolean',
            'skip_sks' => 'boolean',
            'sks_diambil' => 'nullable|integer',
            'nilai_microteaching' => 'nullable|string',
        ]);

        $activeGelombang = \App\Models\Gelombang::where('active', true)->first() 
            ?? \App\Models\Gelombang::latest()->first();
        $idGelombang = $activeGelombang ? $activeGelombang->id : null;

        DispensasiSyarat::updateOrCreate(
            ['nim' => $request->nim],
            [
                'nama' => $request->nama,
                'id_gelombang' => $idGelombang,
                'alasan' => $request->alasan,
                'sks_diambil' => $request->sks_diambil ?? 0,
                'nilai_microteaching' => $request->nilai_microteaching ?? '-',
                'skip_microteaching' => $request->skip_microteaching ?? false,
                'skip_sks' => $request->skip_sks ?? false,
                'status' => 'approved' // Manually added ones are approved by default
            ]
        );

        return redirect()->back()->with('success', 'Dispensasi syarat berhasil ditambahkan/diperbarui.');
    }

    public function toggleRequirement(Request $request)
    {
        $request->validate([
            'nim' => 'required|string',
            'type' => 'required|in:microteaching,sks',
            'value' => 'required|boolean',
        ]);

        $dispensation = DispensasiSyarat::where('nim', $request->nim)->first();

        if (!$dispensation) {
            return response()->json(['success' => false, 'message' => 'Data dispensasi tidak ditemukan.'], 404);
        }

        if ($request->type === 'microteaching') {
            $dispensation->skip_microteaching = $request->value;
        } else {
            $dispensation->skip_sks = $request->value;
        }

        // Auto approve status if admin toggles it to true
        if ($dispensation->skip_microteaching || $dispensation->skip_sks) {
            $dispensation->status = 'approved';
        }

        $dispensation->save();

        return response()->json([
            'success' => true,
            'message' => 'Persyaratan berhasil diperbarui.',
            'data' => $dispensation
        ]);
    }

    public function destroy($nim)
    {
        $dispensation = DispensasiSyarat::where('nim', $nim)->first();

        if ($dispensation) {
            $dispensation->delete();
            return redirect()->back()->with('success', 'Dispensasi syarat berhasil dihapus.');
        }

        return redirect()->back()->with('error', 'Data tidak ditemukan.');
    }

    public function getTranskrip(Request $request, SevimaService $sevima)
    {
        $nim = $request->query('nim');
        if (!$nim) {
            return response()->json(['message' => 'NIM tidak boleh kosong.'], 400);
        }

        $response = $sevima->getTranskripMahasiswa($nim);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json(['message' => 'Gagal mengambil transkrip dari Sevima.'], 500);
    }
}
