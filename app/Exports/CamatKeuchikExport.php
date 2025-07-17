<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class CamatKeuchikExport implements FromCollection, WithHeadings, WithMapping, WithColumnFormatting
{
    public function collection()
    {
        return DB::table('ampraham_kpm_tbl as kpm')
            ->selectRaw(
                'ROW_NUMBER() OVER (ORDER BY kpm.id) AS row_index,
                kpm.name,
                kpm.nama_di_buku_rekening,
                CASE WHEN kpm.nip = "null" then "-" else kpm.nip end as nip,
                CASE WHEN kpm.jabatan = "null" then "-" else kpm.jabatan end as jabatan,
                CASE WHEN kpm.pangkat_dan_golongan = "null" then "-" else kpm.pangkat_dan_golongan end as pangkat_dan_golongan ,
                kpm.kecamatan,
                CASE WHEN kpm.desa = "null" then "-" else kpm.desa end as desa ,
                nama_bank,
                no_rekening,
                no_npwp,
                kpm.status'
            )->get();
    }
    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'Nama Di Buku Rekening',
            'NIP',
            'Jabatan',
            'Pangkat & Golongan',
            'Kecamatan',
            'Desa',
            'Nama Bank',
            'No. Rekening',
            'No. NPWP',
            'Status'
        ];
    }


    public function map($row): array
    {
        return [
            $row->row_index,
            $row->name,
            $row->nama_di_buku_rekening,
            "'" . $row->nip, // Add single quote for text formatting
            $row->jabatan,
            $row->pangkat_dan_golongan,
            $row->kecamatan,
            $row->desa,
            $row->nama_bank,
            "'" . $row->no_rekening, // Ensure no_rekening is treated as text
            "'" . $row->no_npwp, // Ensure no_npwp is treated as text
            $row->status,
        ];
    }

    public function columnFormats(): array
    {
        // Dynamically apply text format to all columns
        $columns = range('A', 'Z'); // Extend if more columns are needed
        $formats = [];
        foreach ($columns as $column) {
            $formats[$column] = NumberFormat::FORMAT_TEXT;
        }
        return $formats;
    }
}
