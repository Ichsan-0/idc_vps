<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PelamarPPLTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function headings(): array
    {
        return [
            'No',
            'NIM',
            'Nama Mahasiswa',
            'Lowongan / Prodi',
            'Status',
            'Keterangan'
        ];
    }

    public function array(): array
    {
        return [
            [
                '1',
                '200201001',
                'Ahmad Fauzi',
                'Pendidikan Agama Islam',
                'accepted',
                'Penempatan PPL'
            ],
            [
                '2',
                '200201002',
                'Siti Nurhaliza',
                'Pendidikan Bahasa Arab',
                'accepted',
                'Penempatan PPL'
            ],
            [
                '3',
                '200201003',
                'Rahmat Hidayat',
                '',
                'accepted',
                'Penempatan PPL'
            ]
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2563EB'], // Primary blue
                ],
            ],
        ];
    }
}
