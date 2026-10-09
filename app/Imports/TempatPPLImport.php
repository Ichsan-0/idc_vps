<?php

namespace App\Imports;

use App\Models\LowonganPPL;
use App\Models\Prodi;
use App\Models\Sekolah;
use App\Models\SekolahMaster;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TempatPPLImport implements WithMultipleSheets
{
    protected $idGelombang;
    protected $dataImport;

    public function __construct($idGelombang)
    {
        $this->idGelombang = $idGelombang;
        $this->dataImport = new TempatPPLDataImport($idGelombang);
    }

    public function sheets(): array
    {
        return [
            0 => $this->dataImport,
        ];
    }

    public function getExistingSchools(): array
    {
        return $this->dataImport->getExistingSchools();
    }

    public function getDuplicateInFile(): array
    {
        return $this->dataImport->getDuplicateInFile();
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

    public function getLowonganCreatedCount(): int
    {
        return $this->dataImport->getLowonganCreatedCount();
    }

    public function getErrors(): array
    {
        return $this->dataImport->getErrors();
    }
}

class TempatPPLDataImport implements ToCollection
{
    protected $idGelombang;
    protected $importedCount = 0;
    protected $updatedCount = 0;
    protected $skippedCount = 0;
    protected $lowonganCreatedCount = 0;
    protected $existingSchools = [];
    protected $duplicateInFile = [];
    protected $errors = [];

    public function __construct($idGelombang)
    {
        $this->idGelombang = $idGelombang;
    }

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            return;
        }

        $allProdis = Prodi::all();

        // 1. Deteksi letak kolom header
        $firstRow = $rows->first();
        $hasHeader = false;
        $nameIndex = null;
        $supervisorIndex = null;
        $kabupatenIndex = null;
        $kecamatanIndex = null;
        $desaIndex = null;
        $quotaCols = []; // [colIndex => Prodi]

        $firstRowValues = is_array($firstRow) ? $firstRow : $firstRow->toArray();
        foreach ($firstRowValues as $index => $val) {
            $rawText = trim((string)$val);
            $normalized = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $rawText));

            if (in_array($normalized, ['namasekolah', 'nama', 'sekolah', 'schoolname'])) {
                $nameIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['nipsupervisor', 'supervisor', 'nip', 'usernamesupervisor', 'pengawas'])) {
                $supervisorIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['kabupaten', 'kabupatenkota', 'regency', 'kota'])) {
                $kabupatenIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['kecamatan', 'subdistrict', 'distrik'])) {
                $kecamatanIndex = $index;
                $hasHeader = true;
            } elseif (in_array($normalized, ['desa', 'kelurahan', 'village', 'gampong'])) {
                $desaIndex = $index;
                $hasHeader = true;
            } else {
                // Cek apakah kolom kuota prodi (e.g. "Kuota MPI", "MPI", "Kuota Manajemen Pendidikan Islam")
                foreach ($allProdis as $prodi) {
                    $prodiKode = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', (string)$prodi->kode));
                    $prodiName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', (string)$prodi->name));

                    if (!empty($prodiKode) && ($normalized === "kuota{$prodiKode}" || $normalized === $prodiKode)) {
                        $quotaCols[$index] = $prodi;
                        $hasHeader = true;
                        break;
                    } elseif ($normalized === "kuota{$prodiName}" || $normalized === $prodiName) {
                        $quotaCols[$index] = $prodi;
                        $hasHeader = true;
                        break;
                    }
                }
            }
        }

        $dataRows = $rows;
        if ($hasHeader) {
            $dataRows = $rows->slice(1);
        } else {
            // Default column layout fallback
            $firstVal = trim((string)($firstRowValues[0] ?? ''));
            if (is_numeric($firstVal)) {
                $nameIndex = 1;
                $supervisorIndex = 2;
                $kabupatenIndex = 3;
                $kecamatanIndex = 4;
                $desaIndex = 5;
            } else {
                $nameIndex = 0;
                $supervisorIndex = 1;
                $kabupatenIndex = 2;
                $kecamatanIndex = 3;
                $desaIndex = 4;
            }
        }

        if ($nameIndex === null) {
            $nameIndex = isset($firstRowValues[1]) ? 1 : 0;
        }

        // 2. Pre-analisis baris: Cek duplikasi di dalam file yang diunggah
        $seenInFile = [];
        $duplicateInFile = [];
        $validRows = [];

        foreach ($dataRows as $row) {
            $rowValues = is_array($row) ? $row : $row->toArray();
            $schoolName = isset($rowValues[$nameIndex]) ? trim((string)$rowValues[$nameIndex]) : '';

            // Skip baris kosong atau header berulang
            if (empty($schoolName) || strtolower($schoolName) === 'nama sekolah' || strtolower($schoolName) === 'nama') {
                continue;
            }

            $normalizedName = strtolower(preg_replace('/\s+/', ' ', $schoolName));

            // Cek duplikasi di dalam file yang diunggah
            if (isset($seenInFile[$normalizedName])) {
                $duplicateInFile[] = $schoolName;
            } else {
                $seenInFile[$normalizedName] = true;
            }

            $validRows[] = [
                'schoolName' => $schoolName,
                'rowValues' => $rowValues,
            ];
        }

        if (!empty($duplicateInFile)) {
            $this->duplicateInFile = array_values(array_unique($duplicateInFile));
            return;
        }

        // 3. Proses penyimpanan & sinkronisasi data
        foreach ($validRows as $item) {
            $schoolName = $item['schoolName'];
            $rowValues = $item['rowValues'];

            $supervisorVal = ($supervisorIndex !== null && isset($rowValues[$supervisorIndex]))
                ? trim((string)$rowValues[$supervisorIndex])
                : null;
            if ($supervisorVal === '') $supervisorVal = null;

            $kabupatenVal = ($kabupatenIndex !== null && isset($rowValues[$kabupatenIndex]))
                ? trim((string)$rowValues[$kabupatenIndex])
                : null;
            if ($kabupatenVal === '') $kabupatenVal = null;

            $kecamatanVal = ($kecamatanIndex !== null && isset($rowValues[$kecamatanIndex]))
                ? trim((string)$rowValues[$kecamatanIndex])
                : null;
            if ($kecamatanVal === '') $kecamatanVal = null;

            $desaVal = ($desaIndex !== null && isset($rowValues[$desaIndex]))
                ? trim((string)$rowValues[$desaIndex])
                : null;
            if ($desaVal === '') $desaVal = null;

            // 1. Resolve supervisor
            $usernameSupervisor = null;
            if (!empty($supervisorVal)) {
                // Konversi notasi ilmiah atau float dari format angka Excel (misal 1.98709E+17)
                if (is_numeric($supervisorVal) || stripos((string)$supervisorVal, 'e+') !== false) {
                    $numVal = (float)$supervisorVal;
                    if ($numVal > 0) {
                        $supervisorVal = number_format($numVal, 0, '', '');
                    }
                }
                $cleanNip = trim((string)$supervisorVal);

                // Cari berdasarkan username atau nama lengkap
                $user = User::where('username', $cleanNip)
                    ->orWhere('name', $cleanNip)
                    ->first();

                // Jika belum ketemu, coba cari berdasarkan digit NIP bersih
                if (!$user) {
                    $digitsOnly = preg_replace('/\D/', '', $cleanNip);
                    if (!empty($digitsOnly)) {
                        $user = User::where('username', $digitsOnly)->first();
                    }
                }

                // Jika belum ketemu dan panjang >= 4, coba LIKE query
                if (!$user && strlen($cleanNip) >= 4) {
                    $user = User::where('name', 'LIKE', '%' . $cleanNip . '%')
                        ->orWhere('username', 'LIKE', '%' . $cleanNip . '%')
                        ->first();
                }

                if ($user) {
                    $usernameSupervisor = $user->username;
                } else {
                    $usernameSupervisor = preg_replace('/\s+/', '', $cleanNip);
                }
            }

            // 2. Resolve SekolahMaster
            $master = SekolahMaster::where(function ($q) use ($schoolName) {
                $q->where('name', 'LIKE', $schoolName)
                  ->orWhereRaw('TRIM(name) LIKE ?', [$schoolName]);
            })->first();

            // Fallback ke supervisor dari data master jika baris excel kosong
            if (empty($usernameSupervisor) && $master && !empty($master->username_supervisor)) {
                $usernameSupervisor = $master->username_supervisor;
            }

            if (!$master) {
                $master = SekolahMaster::create([
                    'name' => $schoolName,
                    'username_supervisor' => $usernameSupervisor,
                    'regency' => $kabupatenVal,
                    'sub_district' => $kecamatanVal,
                    'village' => $desaVal,
                ]);
            } else {
                $masterUpdates = [];
                if (!empty($usernameSupervisor) && empty($master->username_supervisor)) {
                    $masterUpdates['username_supervisor'] = $usernameSupervisor;
                }
                if (empty($master->regency) && !empty($kabupatenVal)) $masterUpdates['regency'] = $kabupatenVal;
                if (empty($master->sub_district) && !empty($kecamatanVal)) $masterUpdates['sub_district'] = $kecamatanVal;
                if (empty($master->village) && !empty($desaVal)) $masterUpdates['village'] = $desaVal;
                if (!empty($masterUpdates)) {
                    $master->update($masterUpdates);
                }
            }

            // 3. Cek apakah sekolah sudah ada di sekolah_tbl untuk gelombang ini
            $sekolah = Sekolah::where('id_gelombang', $this->idGelombang)
                ->where(function ($q) use ($master, $schoolName) {
                    if ($master) {
                        $q->where('id_sekolah', $master->id);
                    }
                    $q->orWhere('name', 'LIKE', $schoolName)
                      ->orWhereRaw('TRIM(name) LIKE ?', [$schoolName]);
                })
                ->first();

            if ($sekolah) {
                // Perbarui data sekolah yang sudah ada jika ada perubahan
                $sekolahUpdates = [];
                if (!empty($usernameSupervisor) && $sekolah->username_supervisor !== $usernameSupervisor) {
                    $sekolahUpdates['username_supervisor'] = $usernameSupervisor;
                }
                if (!empty($kabupatenVal) && $sekolah->regency !== $kabupatenVal) {
                    $sekolahUpdates['regency'] = $kabupatenVal;
                }
                if (!empty($kecamatanVal) && $sekolah->sub_district !== $kecamatanVal) {
                    $sekolahUpdates['sub_district'] = $kecamatanVal;
                }
                if (!empty($desaVal) && $sekolah->village !== $desaVal) {
                    $sekolahUpdates['village'] = $desaVal;
                }
                if ($master && $sekolah->id_sekolah !== $master->id) {
                    $sekolahUpdates['id_sekolah'] = $master->id;
                }
                if (!empty($sekolahUpdates)) {
                    $sekolah->update($sekolahUpdates);
                }

                $this->updatedCount++;
            } else {
                // Tambahkan sekolah baru ke sekolah_tbl
                $sekolah = Sekolah::create([
                    'name' => $schoolName,
                    'id_sekolah' => $master->id,
                    'id_gelombang' => $this->idGelombang,
                    'username_supervisor' => $usernameSupervisor ?: ($master ? $master->username_supervisor : null),
                    'province' => '11',
                    'regency' => $kabupatenVal ?: $master->regency,
                    'sub_district' => $kecamatanVal ?: $master->sub_district,
                    'village' => $desaVal ?: $master->village,
                ]);

                $this->importedCount++;
            }

            // 4. Proses kuota lowongan prodi untuk sekolah ini (baik sekolah baru maupun yang sudah ada)
            $schoolDisplayName = $sekolah->name ?: ($master ? $master->name : $schoolName);
            foreach ($quotaCols as $colIdx => $prodi) {
                $quotaRaw = trim((string)($rowValues[$colIdx] ?? ''));
                if ($quotaRaw !== '' && is_numeric($quotaRaw)) {
                    $quotaNum = (int)$quotaRaw;
                    if ($quotaNum > 0) {
                        LowonganPPL::updateOrCreate(
                            [
                                'id_sekolah' => $sekolah->id,
                                'id_prodi' => $prodi->id,
                            ],
                            [
                                'name' => 'PPL ' . $prodi->name . ' ' . $schoolDisplayName,
                                'quota' => $quotaNum,
                                'description' => 'Lowongan PPL Jurusan ' . $prodi->name . ' di ' . $schoolDisplayName,
                            ]
                        );
                        $this->lowonganCreatedCount++;
                    } elseif ($quotaNum === 0) {
                        $existingLowongan = LowonganPPL::where('id_sekolah', $sekolah->id)
                            ->where('id_prodi', $prodi->id)
                            ->first();
                        if ($existingLowongan && $existingLowongan->quota != 0) {
                            $existingLowongan->update(['quota' => 0]);
                            $this->lowonganCreatedCount++;
                        }
                    }
                }
            }
        }
    }

    public function getExistingSchools(): array
    {
        return $this->existingSchools;
    }

    public function getDuplicateInFile(): array
    {
        return $this->duplicateInFile;
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

    public function getLowonganCreatedCount(): int
    {
        return $this->lowonganCreatedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
