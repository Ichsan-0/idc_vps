<?php

namespace App\Exports;

use App\Models\Prodi;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TempatPPLTemplateExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            new LokasiPPLDataSheet(),
            new ReferensiProdiSheet(),
            new PetunjukPengisianLokasiSheet(),
        ];
    }
}

/**
 * Sheet 1: Data Lokasi & Kuota Prodi PPL
 */
class LokasiPPLDataSheet implements FromArray, WithHeadings, ShouldAutoSize, WithStyles, WithTitle, WithColumnFormatting
{
    protected $prodis;

    public function __construct()
    {
        $this->prodis = Prodi::select('id', 'kode', 'name')->orderBy('id')->get();
    }

    public function title(): string
    {
        return 'Data Lokasi & Kuota PPL';
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

        // Sample quotas for prodis:
        // MPI, PGMI, PBA, PBI, PFS, PIAUD, PKM, PMA, PTE, PTI, BK, PPG, PBL, PAI
        $sampleQuotas1 = [5, 4, 3, 5, 0, 0, 0, 4, 0, 5, 2, 0, 0, 6];
        $sampleQuotas2 = [4, 5, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 5];
        $sampleQuotas3 = [6, 6, 4, 6, 3, 0, 3, 5, 0, 6, 3, 0, 3, 8];

        foreach ($this->prodis as $idx => $prodi) {
            $row1[] = (string)($sampleQuotas1[$idx] ?? 0);
            $row2[] = (string)($sampleQuotas2[$idx] ?? 0);
            $row3[] = (string)($sampleQuotas3[$idx] ?? 0);
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
                'Wajib diisi dengan nama lengkap sekolah / madrasah lokasi PPL.'
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
                'Otomatisasi Lowongan',
                'Saat file diimpor, sistem akan otomatis membuat lowongan PPL untuk setiap prodi yang kuotanya > 0 pada sekolah tersebut.'
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
