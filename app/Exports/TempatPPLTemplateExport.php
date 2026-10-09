<?php

namespace App\Exports;

use App\Models\Gelombang;
use App\Models\LowonganPPL;
use App\Models\Prodi;
use App\Models\Sekolah;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TempatPPLTemplateExport implements WithMultipleSheets
{
    protected $idGelombang;

    public function __construct($idGelombang = null)
    {
        $this->idGelombang = $idGelombang;
    }

    public function sheets(): array
    {
        return [
            new LokasiPPLDataSheet($this->idGelombang),
            new ReferensiProdiSheet(),
            new PetunjukPengisianLokasiSheet(),
        ];
    }
}

/**
 * Sheet 1: Data Lokasi & Kuota Prodi PPL
 */
class LokasiPPLDataSheet extends DefaultValueBinder implements FromArray, WithHeadings, ShouldAutoSize, WithStyles, WithTitle, WithColumnFormatting, WithCustomValueBinder
{
    protected $idGelombang;
    protected $prodis;

    public function __construct($idGelombang = null)
    {
        $this->idGelombang = $idGelombang;
        $this->prodis = Prodi::select('id', 'kode', 'name')->orderBy('id')->get();
    }

    public function title(): string
    {
        return 'Data Lokasi & Kuota PPL';
    }

    public function bindValue(Cell $cell, $value)
    {
        $col = $cell->getColumn();
        // Paksa kolom No (A), NIP (C), Kabupaten (D), Kecamatan (E), Desa (F) sebagai TEXT murni
        // agar NIP tidak tampil dalam notasi ilmiah eksponensial (seperti 1.96704E+17)
        if (in_array($col, ['A', 'C', 'D', 'E', 'F'])) {
            $cell->setValueExplicit((string)$value, DataType::TYPE_STRING);
            return true;
        }

        return parent::bindValue($cell, $value);
    }

    public function headings(): array
    {
        $headers = [
            'No',
            'Nama Sekolah',
            'NIP Supervisor',
            'Kabupaten',
            'Kecamatan',
            'Desa',
        ];

        foreach ($this->prodis as $prodi) {
            $label = $prodi->kode ?: $prodi->name;
            $headers[] = "Kuota {$label}";
        }

        return $headers;
    }

    public function array(): array
    {
        // 1. Ambil data sekolah/lokasi PPL yang sudah ada
        $query = Sekolah::query()
            ->with(['master'])
            ->leftJoin('sekolah_master as sm', 'sekolah_tbl.id_sekolah', '=', 'sm.id')
            ->select(
                'sekolah_tbl.*',
                'sm.name as master_name',
                'sm.regency as master_regency',
                'sm.sub_district as master_sub_district',
                'sm.village as master_village',
                'sm.username_supervisor as master_supervisor'
            );

        if ($this->idGelombang) {
            $query->where('sekolah_tbl.id_gelombang', $this->idGelombang);
        } else {
            // Jika gelombang tidak spesifik, cari gelombang aktif atau gelombang yang memiliki data sekolah
            $activeGel = Gelombang::where('active', 1)->first();
            if ($activeGel && Sekolah::where('id_gelombang', $activeGel->id)->exists()) {
                $query->where('sekolah_tbl.id_gelombang', $activeGel->id);
            } else {
                $latestGelWithData = Sekolah::latest('id')->value('id_gelombang');
                if ($latestGelWithData) {
                    $query->where('sekolah_tbl.id_gelombang', $latestGelWithData);
                } elseif ($activeGel) {
                    $query->where('sekolah_tbl.id_gelombang', $activeGel->id);
                }
            }
        }

        $sekolahs = $query->orderBy('sekolah_tbl.id', 'asc')->get();

        // Jika di gelombang ini masih belum ada data sekolah di sekolah_tbl, cek apakah ada di sekolah_master
        if ($sekolahs->isEmpty()) {
            $masters = \App\Models\SekolahMaster::orderBy('id', 'asc')->get();
            if ($masters->isNotEmpty()) {
                $rows = [];
                foreach ($masters as $idx => $master) {
                    $nip = (string)($master->username_supervisor ?? '');
                    if (!empty($nip) && (stripos((string)$nip, 'e+') !== false || stripos((string)$nip, 'e-') !== false)) {
                        $numVal = (float)$nip;
                        if ($numVal > 0) {
                            $nip = number_format($numVal, 0, '', '');
                        }
                    }

                    $row = [
                        (string)($idx + 1),
                        (string)$master->name,
                        (string)$nip,
                        (string)($master->regency ?? ''),
                        (string)($master->sub_district ?? ''),
                        (string)($master->village ?? ''),
                    ];

                    foreach ($this->prodis as $prodi) {
                        $row[] = '0';
                    }

                    $rows[] = $row;
                }

                return $rows;
            }
        }

        // 2. Jika ada data sekolah yang sudah terdaftar, isi ke template Excel
        if ($sekolahs->isNotEmpty()) {
            $sekolahIds = $sekolahs->pluck('id')->filter()->toArray();
            $lowongans = LowonganPPL::whereIn('id_sekolah', $sekolahIds)
                ->get()
                ->groupBy('id_sekolah');

            $rows = [];
            foreach ($sekolahs as $idx => $sekolah) {
                $schoolName = trim((string)($sekolah->master_name ?: $sekolah->name));

                // Bersihkan NIP: Hanya lakukan konversi jika berupa notasi ilmiah (mengandung e+/e-)
                // Jangan convert string angka murni ke (float) karena float IEEE 754 memotong presisi digit ke-16 ke atas (18-digit NIP)
                $nip = trim((string)($sekolah->username_supervisor ?: ($sekolah->master_supervisor ?? '')));
                if (!empty($nip) && (stripos((string)$nip, 'e+') !== false || stripos((string)$nip, 'e-') !== false)) {
                    $numVal = (float)$nip;
                    if ($numVal > 0) {
                        $nip = number_format($numVal, 0, '', '');
                    }
                }
                $nip = (string)$nip;

                $kabupaten = (string)($sekolah->regency ?: ($sekolah->master_regency ?? ''));
                $kecamatan = (string)($sekolah->sub_district ?: ($sekolah->master_sub_district ?? ''));
                $desa = (string)($sekolah->village ?: ($sekolah->master_village ?? ''));

                $row = [
                    (string)($idx + 1),
                    $schoolName,
                    $nip,
                    $kabupaten,
                    $kecamatan,
                    $desa,
                ];

                $sekolahLowongans = $lowongans->get($sekolah->id);

                // Tambahkan kuota tiap program studi
                foreach ($this->prodis as $prodi) {
                    $lowongan = $sekolahLowongans ? $sekolahLowongans->firstWhere('id_prodi', $prodi->id) : null;
                    $quota = ($lowongan && $lowongan->quota > 0) ? (int)$lowongan->quota : 0;
                    $row[] = (string)$quota;
                }

                $rows[] = $row;
            }

            return $rows;
        }

        // 3. Fallback sampel jika belum ada data sama sekali di database
        $row1 = [
            '1',
            'MTsS Keutapang Dua',
            '196704011991031006',
            '1108',
            '1108110',
            '1108110029',
        ];
        $row2 = [
            '2',
            'MTs Lam Ujong',
            '',
            '1108',
            '1108091',
            '1108091004',
        ];
        $row3 = [
            '3',
            'MAN 1 Banda Aceh',
            '197711162003121002',
            '1171',
            '1171010',
            '1171010001',
        ];

        foreach ($this->prodis as $prodi) {
            $row1[] = '0';
            $row2[] = '0';
            $row3[] = '0';
        }

        return [$row1, $row2, $row3];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = max($sheet->getHighestRow(), 2);
        $highestCol = $sheet->getHighestColumn();
        $sheet->getRowDimension(1)->setRowHeight(28);

        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                    'size' => 11,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF047857'], // Emerald-700
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            "A2:{$highestCol}{$highestRow}" => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FFD1D5DB'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            "A2:A{$highestRow}" => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            "C2:C{$highestRow}" => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            "D2:F{$highestRow}" => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            "G2:{$highestCol}{$highestRow}" => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
        ];
    }

    public function columnFormats(): array
    {
        return [
            'A' => NumberFormat::FORMAT_TEXT,
            'C' => NumberFormat::FORMAT_TEXT,
            'D' => NumberFormat::FORMAT_TEXT,
            'E' => NumberFormat::FORMAT_TEXT,
            'F' => NumberFormat::FORMAT_TEXT,
        ];
    }
}

/**
 * Sheet 2: Daftar Referensi Prodi
 */
class ReferensiProdiSheet implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles, WithTitle
{
    public function title(): string
    {
        return 'Daftar Kode & Nama Prodi';
    }

    public function headings(): array
    {
        return [
            'ID / Kode',
            'Singkatan Prodi',
            'Nama Lengkap Program Studi',
            'Nama Kolom di Sheet 1'
        ];
    }

    public function collection()
    {
        return Prodi::select('id', 'kode', 'name')
            ->orderBy('id')
            ->get()
            ->map(function ($prodi) {
                $singkatan = $prodi->kode ?: '-';
                return [
                    'id' => $prodi->id,
                    'kode' => $singkatan,
                    'name' => $prodi->name,
                    'column_name' => "Kuota {$singkatan}",
                ];
            });
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = max($sheet->getHighestRow(), 2);
        $sheet->getRowDimension(1)->setRowHeight(28);

        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                    'size' => 11,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF1D4ED8'], // Blue-700
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            "A2:D{$highestRow}" => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FFD1D5DB'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            "A2:A{$highestRow}" => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            "B2:B{$highestRow}" => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
        ];
    }
}

/**
 * Sheet 3: Petunjuk Pengisian
 */
class PetunjukPengisianLokasiSheet implements FromArray, WithHeadings, ShouldAutoSize, WithStyles, WithTitle
{
    public function title(): string
    {
        return 'Petunjuk Pengisian';
    }

    public function headings(): array
    {
        return [
            'No',
            'Bagian / Kolom',
            'Ketentuan & Cara Pengisian Kuota'
        ];
    }

    public function array(): array
    {
        return [
            [
                '1',
                'Nama Sekolah',
                'Wajib diisi dengan nama lengkap sekolah / madrasah lokasi PPL. Jika sekolah sudah ada di sistem, template ini otomatis memuat namanya.'
            ],
            [
                '2',
                'NIP Supervisor',
                'Opsional. Diisi dengan NIP dosen supervisor yang telah terdaftar di sistem.'
            ],
            [
                '3',
                'Kabupaten, Kecamatan, Desa',
                'Opsional. Diisi dengan kode wilayah (Kemendagri) atau nama wilayah.'
            ],
            [
                '4',
                'Kolom Kuota [Prodi]',
                'Isikan angka kuota (misal: 5, 4, 3) pada masing-masing kolom prodi yang ingin dibuka lowongannya pada sekolah tersebut.'
            ],
            [
                '5',
                'Prodi Tanpa Kuota',
                'Jika sekolah tidak membuka lowongan untuk jurusan tertentu, cukup isikan angka 0 atau biarkan kosong.'
            ],
            [
                '6',
                'Sinkronisasi Kuota',
                'Saat file diimpor, sistem akan otomatis memperbarui kuota jurusan pada sekolah yang sudah ada, atau membuat lokasi baru jika belum terdaftar.'
            ],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getRowDimension(1)->setRowHeight(28);

        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                    'size' => 11,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF374151'], // Gray-700
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            'A2:C7' => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FFD1D5DB'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            'A2:A7' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'B2:B7' => ['font' => ['bold' => true]],
        ];
    }
}
