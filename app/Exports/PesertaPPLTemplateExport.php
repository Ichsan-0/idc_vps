<?php

namespace App\Exports;

use App\Models\LamaranPPL;
use App\Models\LowonganPPL;
use App\Models\Prodi;
use App\Models\Sekolah;
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

class PesertaPPLTemplateExport implements WithMultipleSheets
{
    protected $idGelombang;

    public function __construct($idGelombang = null)
    {
        $this->idGelombang = $idGelombang;
    }

    public function sheets(): array
    {
        return [
            new PesertaPPLDataSheet(),
            new SekolahDanKuotaSheet($this->idGelombang),
            new PetunjukPengisianSheet(),
        ];
    }
}

/**
 * Sheet 1: Data Peserta PPL (Input Utama - Tanpa Kuota)
 */
class PesertaPPLDataSheet implements FromArray, WithHeadings, ShouldAutoSize, WithStyles, WithTitle, WithColumnFormatting
{
    public function title(): string
    {
        return 'Data Peserta PPL';
    }

    public function headings(): array
    {
        return [
            'No',
            'NIM',
            'Nama Sekolah atau ID Sekolah',
            'Status',
            'Keterangan'
        ];
    }

    public function array(): array
    {
        return [
            [
                '1',
                '200101001',
                'MTsS Keutapang Dua',
                'accepted',
                'Peserta PPL'
            ],
            [
                '2',
                '200101002',
                'MTsS Keutapang Dua',
                'accepted',
                'Peserta PPL'
            ],
            [
                '3',
                '200101003',
                'MTs Lam Ujong',
                'accepted',
                'Peserta PPL'
            ],
            [
                '4',
                '200101004',
                'MTs Lam Ujong',
                'accepted',
                'Peserta PPL'
            ],
        ];
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
            "A2:E{$highestRow}" => [
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
            "D2:D{$highestRow}" => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
        ];
    }

    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT,
        ];
    }
}

/**
 * Sheet 2: Daftar Kode Prodi (Referensi)
 */
class KodeProdiSheet implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles, WithTitle
{
    public function title(): string
    {
        return 'Daftar Kode Prodi';
    }

    public function headings(): array
    {
        return [
            'Kode / ID',
            'Singkatan / Kode Prodi',
            'Nama Program Studi / Jurusan',
            'Contoh Pengisian di Sheet 1'
        ];
    }

    public function collection()
    {
        return Prodi::select('id', 'kode', 'name')
            ->orderBy('id')
            ->get()
            ->map(function ($prodi) {
                return [
                    'id' => $prodi->id,
                    'kode' => $prodi->kode ?: '-',
                    'name' => $prodi->name,
                    'example' => "Bisa diisi: '{$prodi->id}' atau '{$prodi->kode}'",
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
                    'startColor' => ['argb' => 'FF1E40AF'], // Blue-800
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
 * Sheet 3: Daftar Sekolah & Kuota yang Sudah Ada
 */
class SekolahDanKuotaSheet implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles, WithTitle
{
    protected $idGelombang;

    public function __construct($idGelombang = null)
    {
        $this->idGelombang = $idGelombang;
    }

    public function title(): string
    {
        return 'Daftar Sekolah & Kuota';
    }

    public function headings(): array
    {
        return [
            'ID Sekolah',
            'Nama Sekolah',
            'Kabupaten',
            'Kecamatan',
            'Desa',
            'Kuota Jurusan yang Sudah Tersedia (Kuota, Terisi, Sisa)'
        ];
    }

    public function collection()
    {
        $query = Sekolah::query();
        if ($this->idGelombang) {
            $query->where('id_gelombang', $this->idGelombang);
        }

        $sekolahs = $query->orderBy('name')->get();

        if ($sekolahs->isEmpty() && $this->idGelombang) {
            $sekolahs = Sekolah::orderBy('name')->take(20)->get();
        }

        return $sekolahs->map(function ($sekolah) {
            $lowongans = LowonganPPL::where('id_sekolah', $sekolah->id)
                ->with('prodi')
                ->get();

            $kuotaList = [];
            foreach ($lowongans as $l) {
                $prodiName = $l->prodi->kode ?? $l->prodi->name ?? $l->name;
                $terisi = LamaranPPL::where('id_lowongan_ppl', $l->id)->where('status', 'accepted')->count();
                $sisa = max(0, $l->quota - $terisi);
                $kuotaList[] = "{$prodiName} (Kuota: {$l->quota}, Terisi: {$terisi}, Sisa: {$sisa})";
            }

            $kuotaInfo = !empty($kuotaList)
                ? implode('; ', $kuotaList)
                : 'Belum ada kuota jurusan terdaftar (atur kuota saat Import Lokasi atau via Detail Lokasi)';

            return [
                'id' => $sekolah->id,
                'name' => $sekolah->name,
                'regency' => $sekolah->regency ?: '-',
                'sub_district' => $sekolah->sub_district ?: '-',
                'village' => $sekolah->village ?: '-',
                'kuota_info' => $kuotaInfo,
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
                    'startColor' => ['argb' => 'FF0F766E'], // Teal-700
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
            "A2:F{$highestRow}" => [
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
        ];
    }
}

/**
 * Sheet 4: Petunjuk Pengisian
 */
class PetunjukPengisianSheet implements FromArray, WithHeadings, ShouldAutoSize, WithStyles, WithTitle
{
    public function title(): string
    {
        return 'Petunjuk Pengisian';
    }

    public function headings(): array
    {
        return [
            'No',
            'Kolom / Topik',
            'Ketentuan & Cara Pengisian'
        ];
    }

    public function array(): array
    {
        return [
            [
                '1',
                'Sheet Data Peserta PPL',
                'Gunakan Sheet 1 "Data Peserta PPL" untuk mengisikan data penempatan peserta mahasiswa di sekolah tujuan.'
            ],
            [
                '2',
                'NIM',
                'Wajib diisi (NIM mahasiswa). Nama Mahasiswa dan Program Studi akan terhubung secara otomatis dari data mahasiswa yang sudah terdaftar di sistem.'
            ],
            [
                '3',
                'Nama Sekolah atau ID Sekolah',
                'Wajib diisi. Boleh menggunakan Nama Sekolah (contoh: MTsS Keutapang Dua) atau ID Sekolah dari Sheet 2 "Daftar Sekolah & Kuota".'
            ],
            [
                '4',
                'Alur Kuota Penempatan',
                'Sistem akan mencocokkan Program Studi mahasiswa dengan kuota lowongan prodi yang tersedia pada sekolah tujuan. Pastikan kuota untuk prodi mahasiswa masih tersedia di sekolah tujuan (lihat Sheet 2).'
            ],
            [
                '5',
                'Status & Keterangan',
                'Opsional. Status default: accepted (diterima). Keterangan default: Peserta PPL.'
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
            'A2:C6' => [
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
            'A2:A6' => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'B2:B6' => ['font' => ['bold' => true]],
        ];
    }
}
