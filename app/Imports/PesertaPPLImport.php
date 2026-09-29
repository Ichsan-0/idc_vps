<?php

namespace App\Imports;

use App\Models\LamaranPPL;
use App\Models\LowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\Sekolah;
use App\Models\SekolahMaster;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class PesertaPPLImport implements WithMultipleSheets
{
    protected $idGelombang;
    protected $dataImport;

    public function __construct($idGelombang = null)
    {
        $this->idGelombang = $idGelombang;
        $this->dataImport = new PesertaPPLDataImport($idGelombang);
    }

    public function sheets(): array
    {
        return [
            0 => $this->dataImport,
        ];
    }

    public function getImportedCount(): int
    {
        return $this->dataImport->getImportedCount();
    }

    public function getUpdatedCount(): int
    {
        return $this->dataImport->getUpdatedCount();
    }

    public function getSkippedCount(): int
    {
        return $this->dataImport->getSkippedCount();
    }

    public function getErrors(): array
    {
        return $this->dataImport->getErrors();
    }
}

class PesertaPPLDataImport implements ToCollection
{
    protected $idGelombang;
    protected $importedCount = 0;
    protected $updatedCount = 0;
    protected $skippedCount = 0;
    protected $errors = [];

    public function __construct($idGelombang = null)
    {
        $this->idGelombang = $idGelombang;
    }

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            return;
        }

        // 1. Deteksi letak kolom berdasarkan header
        $colIndex = [
            'nim' => 1,
            'sekolah' => 2,
            'status' => 3,
            'keterangan' => 4,
            'nama' => null,
            'prodi' => null,
        ];

        $firstRow = $rows->first();
        $startRowIndex = 0;

        foreach ($firstRow as $idx => $val) {
            $rawText = trim((string)$val);
            $normalized = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $rawText));

            if (in_array($normalized, ['nim', 'username', 'nomorinduk', 'npm'])) {
                $colIndex['nim'] = $idx;
                $startRowIndex = 1;
            } elseif (in_array($normalized, ['sekolah', 'namasekolah', 'sekolahmadrasah', 'lokasi', 'tempatppl', 'namasekolahatauidsekolah', 'idsekolah'])) {
                $colIndex['sekolah'] = $idx;
                $startRowIndex = 1;
            } elseif (in_array($normalized, ['status', 'statuslamaran', 'statuspenerimaan'])) {
                $colIndex['status'] = $idx;
                $startRowIndex = 1;
            } elseif (in_array($normalized, ['keterangan', 'ket', 'catatan', 'note', 'deskripsi'])) {
                $colIndex['keterangan'] = $idx;
                $startRowIndex = 1;
            } elseif (in_array($normalized, ['nama', 'namamahasiswa', 'namalengkap', 'studentname'])) {
                $colIndex['nama'] = $idx;
                $startRowIndex = 1;
            } elseif (in_array($normalized, ['prodi', 'kodeprodi', 'jurusan', 'programstudi', 'kodenamaprodi'])) {
                $colIndex['prodi'] = $idx;
                $startRowIndex = 1;
            }
        }

        $allProdis = Prodi::all();

        foreach ($rows->slice($startRowIndex) as $rowNumber => $row) {
            $rawNim = trim((string)($row[$colIndex['nim']] ?? ''));
            // Normalisasi jika NIM terbaca sebagai angka ilmiah/float dari Excel
            if (is_numeric($rawNim) || stripos($rawNim, 'e+') !== false) {
                $numVal = (float)$rawNim;
                if ($numVal > 0) {
                    $rawNim = number_format($numVal, 0, '', '');
                }
            }
            $nim = trim($rawNim);
            if (empty($nim) || strtolower($nim) === 'nim') {
                continue;
            }

            $sekolahVal = isset($colIndex['sekolah']) && isset($row[$colIndex['sekolah']])
                ? trim((string)$row[$colIndex['sekolah']])
                : '';
            $statusVal = isset($colIndex['status']) && isset($row[$colIndex['status']])
                ? strtolower(trim((string)$row[$colIndex['status']]))
                : '';
            $keteranganVal = isset($colIndex['keterangan']) && isset($row[$colIndex['keterangan']])
                ? trim((string)$row[$colIndex['keterangan']])
                : '';

            $namaVal = (isset($colIndex['nama']) && $colIndex['nama'] !== null && isset($row[$colIndex['nama']]))
                ? trim((string)$row[$colIndex['nama']])
                : '';
            $prodiVal = (isset($colIndex['prodi']) && $colIndex['prodi'] !== null && isset($row[$colIndex['prodi']]))
                ? trim((string)$row[$colIndex['prodi']])
                : '';

            $status = in_array($statusVal, ['accepted', 'submitted', 'rejected']) ? $statusVal : 'accepted';
            $keterangan = !empty($keteranganVal) ? $keteranganVal : 'Peserta PPL';

            // 1. Cari data Mahasiswa dan User di Database berdasarkan NIM
            $mahasiswa = Mahasiswa::where('nim', $nim)->first();
            $user = User::where('username', $nim)->first();

            // 2. Resolusi Program Studi: Diambil otomatis dari relasi mahasiswa_tbl.id_prodi
            $prodi = null;
            if ($mahasiswa && !empty($mahasiswa->id_prodi)) {
                $prodi = $allProdis->firstWhere('id', $mahasiswa->id_prodi);
            }

            // Fallback: Jika di database belum ada id_prodi tetapi disediakan di Excel (template lama)
            if (!$prodi && !empty($prodiVal)) {
                $prodi = $this->resolveProdi($prodiVal, $allProdis, null);
            }

            if (!$prodi) {
                $this->skippedCount++;
                $this->errors[] = "Baris " . ($rowNumber + 1) . ": Mahasiswa dengan NIM '{$nim}' belum terdaftar di data mahasiswa atau belum memiliki Program Studi.";
                continue;
            }

            // 3. Resolusi Sekolah
            $sekolah = $this->resolveSekolah($sekolahVal);
            if (!$sekolah) {
                $this->skippedCount++;
                $this->errors[] = "Baris " . ($rowNumber + 1) . ": Sekolah '{$sekolahVal}' tidak ditemukan.";
                continue;
            }

            // 4. Verifikasi Kuota yang SUDAH ADA di Sekolah untuk Prodi Mahasiswa
            $lowongan = LowonganPPL::where('id_sekolah', $sekolah->id)
                ->where('id_prodi', $prodi->id)
                ->first();

            if (!$lowongan) {
                $this->skippedCount++;
                $this->errors[] = "Baris " . ($rowNumber + 1) . ": Sekolah '{$sekolah->name}' tidak membuka kuota lowongan untuk Prodi '{$prodi->name}'. Data dilewati.";
                continue;
            }

            // Cek apakah kuota sudah penuh
            $acceptedCount = LamaranPPL::where('id_lowongan_ppl', $lowongan->id)
                ->where('status', 'accepted')
                ->where('username_mahasiswa', '!=', $nim)
                ->count();

            if ($status === 'accepted' && $acceptedCount >= $lowongan->quota) {
                $this->skippedCount++;
                $this->errors[] = "Baris " . ($rowNumber + 1) . ": Kuota Prodi '{$prodi->name}' di '{$sekolah->name}' sudah penuh (Kuota: {$lowongan->quota}, Terisi: {$acceptedCount}). Data dilewati.";
                continue;
            }

            // 5. Pastikan User Mahasiswa terdaftar
            if (!$user) {
                $user = User::create([
                    'username' => $nim,
                    'name' => $namaVal ?: ('Mahasiswa ' . $nim),
                    'email' => $nim . '@student.ar-raniry.ac.id',
                    'role' => 'mahasiswa',
                    'password' => Hash::make($nim),
                ]);
            } else {
                if (!empty($namaVal) && ($user->name === ('Mahasiswa ' . $nim) || empty($user->name))) {
                    $user->name = $namaVal;
                    $user->save();
                }
            }

            // 6. Pastikan record di mahasiswa_tbl ada dan terisi
            if (!$mahasiswa) {
                $mahasiswa = Mahasiswa::create([
                    'nim' => $nim,
                    'id_prodi' => $prodi->id,
                    'id_gelombang' => $this->idGelombang ?: $sekolah->id_gelombang,
                    'jk' => 'L',
                ]);
            } else {
                $needsSave = false;
                if (empty($mahasiswa->id_gelombang) && ($this->idGelombang || $sekolah->id_gelombang)) {
                    $mahasiswa->id_gelombang = $this->idGelombang ?: $sekolah->id_gelombang;
                    $needsSave = true;
                }
                if ($needsSave) {
                    $mahasiswa->save();
                }
            }

            // 7. Simpan atau perbarui Lamaran PPL
            $allSchoolLowonganIds = LowonganPPL::where('id_sekolah', $sekolah->id)->pluck('id');
            $existingLamaran = LamaranPPL::where('username_mahasiswa', $nim)
                ->whereIn('id_lowongan_ppl', $allSchoolLowonganIds)
                ->first();

            if ($existingLamaran) {
                $existingLamaran->update([
                    'id_lowongan_ppl' => $lowongan->id,
                    'status' => $status,
                    'keterangan' => $keterangan,
                ]);
                $this->updatedCount++;
            } else {
                LamaranPPL::create([
                    'username_mahasiswa' => $nim,
                    'id_lowongan_ppl' => $lowongan->id,
                    'status' => $status,
                    'keterangan' => $keterangan,
                ]);
                $this->importedCount++;
            }
        }
    }

    /**
     * Resolusi Sekolah berdasarkan ID atau Nama
     */
    protected function resolveSekolah($sekolahVal)
    {
        if (empty($sekolahVal)) {
            if ($this->idGelombang) {
                return Sekolah::where('id_gelombang', $this->idGelombang)->first();
            }
            return Sekolah::first();
        }

        if (is_numeric($sekolahVal)) {
            $sekolah = Sekolah::find((int)$sekolahVal);
            if ($sekolah) return $sekolah;

            if ($this->idGelombang) {
                $sekolah = Sekolah::where('id_sekolah', (int)$sekolahVal)
                    ->where('id_gelombang', $this->idGelombang)
                    ->first();
                if ($sekolah) return $sekolah;
            }
        }

        if ($this->idGelombang) {
            $sekolah = Sekolah::where('id_gelombang', $this->idGelombang)
                ->where('name', 'like', "%{$sekolahVal}%")
                ->first();
            if ($sekolah) return $sekolah;
        }

        $sekolah = Sekolah::where('name', 'like', "%{$sekolahVal}%")->first();
        if ($sekolah) return $sekolah;

        $master = SekolahMaster::where('name', 'like', "%{$sekolahVal}%")->first();
        if ($master) {
            $sekolah = Sekolah::where('id_sekolah', $master->id)->first();
            if ($sekolah) return $sekolah;
        }

        return null;
    }

    /**
     * Resolusi Program Studi berdasarkan Kode ID, Singkatan, atau Nama
     */
    protected function resolveProdi($prodiVal, $allProdis, $fallbackProdi)
    {
        if (empty($prodiVal)) {
            return $fallbackProdi;
        }

        if (is_numeric($prodiVal)) {
            $found = $allProdis->firstWhere('id', (int)$prodiVal);
            if ($found) return $found;
        }

        $cleanVal = strtoupper(trim($prodiVal));
        $found = $allProdis->first(function ($p) use ($cleanVal) {
            return strtoupper(trim($p->kode ?: '')) === $cleanVal;
        });
        if ($found) return $found;

        $found = $allProdis->first(function ($p) use ($prodiVal) {
            return stripos($p->name, $prodiVal) !== false;
        });
        if ($found) return $found;

        return $fallbackProdi;
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getUpdatedCount(): int
    {
        return $this->updatedCount;
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
