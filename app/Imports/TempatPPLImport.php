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

        // 2. Pre-analisis baris: Cek duplikasi di file dan apakah lokasi sudah ada di database untuk gelombang ini
        $seenInFile = [];
        $existingInDb = [];
        $duplicateInFile = [];
        $pendingRows = [];

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

            // Cek apakah lokasi sekolah sudah ada pada tabel lokasi PPL (sekolah_tbl) untuk gelombang ini
            $master = SekolahMaster::where(function ($q) use ($schoolName) {
                $q->where('name', 'LIKE', $schoolName)
                  ->orWhereRaw('TRIM(name) LIKE ?', [$schoolName]);
            })->first();

            $alreadyExists = Sekolah::where('id_gelombang', $this->idGelombang)
                ->where(function ($q) use ($master, $schoolName) {
                    if ($master) {
                        $q->where('id_sekolah', $master->id);
                    }
                    $q->orWhere('name', 'LIKE', $schoolName)
                      ->orWhereRaw('TRIM(name) LIKE ?', [$schoolName]);
                })
                ->exists();

            if ($alreadyExists) {
                $existingInDb[] = $schoolName;
            } else {
                $pendingRows[] = [
                    'schoolName' => $schoolName,
                    'rowValues' => $rowValues,
                    'master' => $master,
                ];
            }
        }

        if (!empty($duplicateInFile)) {
            $this->duplicateInFile = array_values(array_unique($duplicateInFile));
        }

        if (!empty($existingInDb)) {
            $this->existingSchools = array_values(array_unique($existingInDb));
            // Sesuai permintaan: jika data lokasi sudah ada pada tabel lokasi ppl di tahun ajaran yang dipilih,
            // batalkan proses dan jangan simpan data ke database agar memunculkan pesan error
            return;
        }

        // 3. Jika tidak ada error lokasi sudah ada atau duplikasi, lakukan penyimpanan data baru
        foreach ($pendingRows as $item) {
            $schoolName = $item['schoolName'];
            $rowValues = $item['rowValues'];
            $master = $item['master'];

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

            // Fallback ke supervisor dari data master jika baris excel kosong
            if (empty($usernameSupervisor) && $master && !empty($master->username_supervisor)) {
                $usernameSupervisor = $master->username_supervisor;
            }

            // 2. Resolve or create SekolahMaster
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
                if (!empty($usernameSupervisor)) {
                    $masterUpdates['username_supervisor'] = $usernameSupervisor;
                }
                if (empty($master->regency) && !empty($kabupatenVal)) $masterUpdates['regency'] = $kabupatenVal;
                if (empty($master->sub_district) && !empty($kecamatanVal)) $masterUpdates['sub_district'] = $kecamatanVal;
                if (empty($master->village) && !empty($desaVal)) $masterUpdates['village'] = $desaVal;
                if (!empty($masterUpdates)) {
                    $master->update($masterUpdates);
                }
            }

            // 3. Create Sekolah di sekolah_tbl untuk gelombang ini
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

            // 4. Proses kuota lowongan prodi untuk sekolah ini
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
                                'name' => 'PPL ' . $prodi->name . ' ' . $sekolah->name,
                                'quota' => $quotaNum,
                                'description' => 'Lowongan PPL Jurusan ' . $prodi->name . ' di ' . $sekolah->name,
                            ]
                        );
                        $this->lowonganCreatedCount++;
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
