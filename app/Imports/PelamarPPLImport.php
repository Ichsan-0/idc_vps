<?php

namespace App\Imports;

use App\Models\LamaranPPL;
use App\Models\LowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\Sekolah;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;

class PelamarPPLImport implements ToCollection
{
    protected $idSekolah;
    protected $defaultIdLowongan;
    protected $importedCount = 0;
    protected $skippedCount = 0;
    protected $errors = [];

    public function __construct($idSekolah, $defaultIdLowongan = null)
    {
        $this->idSekolah = $idSekolah;
        $this->defaultIdLowongan = $defaultIdLowongan;
    }

    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            return;
        }

        // 1. Detect headers
        $firstRow = $rows->first();
        $hasHeader = false;
        $nimIndex = null;
        $nameIndex = null;
        $lowonganIndex = null;
        $statusIndex = null;
        $keteranganIndex = null;

        $firstRowValues = is_array($firstRow) ? $firstRow : $firstRow->toArray();
        foreach ($firstRowValues as $index => $val) {
            $normalized = strtolower(trim(preg_replace('/[^a-zA-Z0-9]/', '', (string)$val)));
            if (in_array($normalized, ['nim', 'usernamemahasiswa', 'nimmahasiswa', 'username', 'nomorindukmahasiswa'])) {
                $nimIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['namamahasiswa', 'nama', 'name', 'studentname'])) {
                $nameIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['lowongan', 'prodi', 'posisi', 'namalowongan', 'lowonganppl', 'jurusan', 'lowonganprodi'])) {
                $lowonganIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['status', 'statuslamaran'])) {
                $statusIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['keterangan', 'catatan', 'note', 'deskripsi'])) {
                $keteranganIndex = $index;
                $hasHeader = true;
            }
        }

        $dataRows = $rows;
        if ($hasHeader) {
            $dataRows = $rows->slice(1);
        } else {
            // Default column fallback:
            // Check if column 0 is index number and column 1 is NIM (numeric, length >= 7)
            $col0 = trim((string)($firstRowValues[0] ?? ''));
            $col1 = trim((string)($firstRowValues[1] ?? ''));
            if (is_numeric($col0) && strlen($col0) < 6 && (is_numeric($col1) && strlen($col1) >= 6)) {
                $nimIndex = 1;
                $nameIndex = 2;
                $lowonganIndex = 3;
                $statusIndex = 4;
                $keteranganIndex = 5;
            } else {
                $nimIndex = 0;
                $nameIndex = 1;
                $lowonganIndex = 2;
                $statusIndex = 3;
                $keteranganIndex = 4;
            }
        }

        if ($nimIndex === null) {
            $nimIndex = 0;
        }

        // Preload school lowongans
        $schoolLowongans = LowonganPPL::where('id_sekolah', $this->idSekolah)->with('prodi')->get();
        $fallbackProdiId = Prodi::first()?->id;

        foreach ($dataRows as $row) {
            $rowValues = is_array($row) ? $row : $row->toArray();
            $nim = isset($rowValues[$nimIndex]) ? trim((string)$rowValues[$nimIndex]) : '';

            // Skip empty rows or header echoes
            if (empty($nim) || strtolower($nim) === 'nim' || strtolower($nim) === 'username') {
                continue;
            }

            $nama = ($nameIndex !== null && isset($rowValues[$nameIndex]))
                ? trim((string)$rowValues[$nameIndex])
                : null;
            $lowonganVal = ($lowonganIndex !== null && isset($rowValues[$lowonganIndex]))
                ? trim((string)$rowValues[$lowonganIndex])
                : null;
            $statusVal = ($statusIndex !== null && isset($rowValues[$statusIndex]))
                ? strtolower(trim((string)$rowValues[$statusIndex]))
                : null;
            $keteranganVal = ($keteranganIndex !== null && isset($rowValues[$keteranganIndex]))
                ? trim((string)$rowValues[$keteranganIndex])
                : null;

            // Normalize status
            if (!in_array($statusVal, ['accepted', 'submitted', 'rejected'])) {
                $statusVal = 'accepted';
            }

            // 1. Ensure User exists
            $user = User::where('username', $nim)->first();
            if (!$user) {
                $userName = !empty($nama) ? $nama : 'Mahasiswa ' . $nim;
                $user = User::create([
                    'name' => $userName,
                    'email' => $nim . '@student.ar-raniry.ac.id',
                    'username' => $nim,
                    'role' => 'user',
                    'password' => Hash::make($nim),
                ]);
            } elseif (!empty($nama) && (empty($user->name) || str_starts_with($user->name, 'Mahasiswa '))) {
                $user->update(['name' => $nama]);
            }

            // 2. Ensure Mahasiswa record exists and has id_prodi
            $mahasiswa = Mahasiswa::where('nim', $nim)->first();
            if (!$mahasiswa) {
                $mahasiswa = Mahasiswa::create([
                    'nim' => $nim,
                    'id_prodi' => $fallbackProdiId,
                    'jk' => 'Pria',
                ]);
            } elseif (empty($mahasiswa->id_prodi) && $fallbackProdiId) {
                $mahasiswa->update(['id_prodi' => $fallbackProdiId]);
            }

            // 3. Resolve Lowongan for this school
            $targetLowongan = null;

            // A. Match from Excel input
            if (!empty($lowonganVal)) {
                if (is_numeric($lowonganVal)) {
                    $targetLowongan = $schoolLowongans->firstWhere('id', (int)$lowonganVal);
                }
                if (!$targetLowongan) {
                    $targetLowongan = $schoolLowongans->first(function ($l) use ($lowonganVal) {
                        return stripos($l->name, $lowonganVal) !== false
                            || ($l->prodi && stripos($l->prodi->name, $lowonganVal) !== false);
                    });
                }
            }

            // B. Match by student's prodi
            if (!$targetLowongan && !empty($mahasiswa->id_prodi)) {
                $targetLowongan = $schoolLowongans->firstWhere('id_prodi', $mahasiswa->id_prodi);
            }

            // C. Match by defaultIdLowongan passed from modal
            if (!$targetLowongan && !empty($this->defaultIdLowongan)) {
                $targetLowongan = $schoolLowongans->firstWhere('id', (int)$this->defaultIdLowongan);
            }

            // D. Fallback to first existing lowongan of this school
            if (!$targetLowongan && $schoolLowongans->isNotEmpty()) {
                $targetLowongan = $schoolLowongans->first();
            }

            // E. If school has NO lowongan at all, create a default lowongan
            if (!$targetLowongan) {
                $sekolah = Sekolah::find($this->idSekolah);
                $schoolName = $sekolah ? $sekolah->name : 'Sekolah';
                $targetLowongan = LowonganPPL::create([
                    'name' => 'PPL ' . $schoolName,
                    'description' => 'Lowongan PPL ' . $schoolName,
                    'quota' => 20,
                    'id_sekolah' => $this->idSekolah,
                    'id_prodi' => $mahasiswa->id_prodi ?? $fallbackProdiId,
                ]);
                $schoolLowongans->push($targetLowongan);
            }

            // If mahasiswa has no prodi or fallback prodi, update to lowongan prodi if available
            if ($targetLowongan->id_prodi && $mahasiswa && ($mahasiswa->id_prodi === $fallbackProdiId || empty($mahasiswa->id_prodi))) {
                $mahasiswa->update(['id_prodi' => $targetLowongan->id_prodi]);
            }

            // 4. Check for duplicate application at this school
            $existingLamaran = LamaranPPL::join('lowongan_ppl_tbl as lppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'lppl.id')
                ->where('lppl.id_sekolah', $this->idSekolah)
                ->where('lamaran_ppl_tbl.username_mahasiswa', $nim)
                ->select('lamaran_ppl_tbl.*')
                ->first();

            if ($existingLamaran) {
                // Update status and lowongan if needed
                $existingLamaran->update([
                    'status' => $statusVal,
                    'id_lowongan_ppl' => $targetLowongan->id,
                    'keterangan' => !empty($keteranganVal) ? $keteranganVal : $existingLamaran->keterangan,
                ]);
                $this->skippedCount++;
                continue;
            }

            // 5. Create LamaranPPL
            LamaranPPL::create([
                'username_mahasiswa' => $nim,
                'id_lowongan_ppl' => $targetLowongan->id,
                'status' => $statusVal,
                'keterangan' => !empty($keteranganVal) ? $keteranganVal : 'Import Excel',
            ]);

            $this->importedCount++;
        }
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
