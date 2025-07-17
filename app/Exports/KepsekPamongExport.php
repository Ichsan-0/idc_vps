<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class KepsekPamongExport implements FromCollection, WithHeadings, WithMapping, WithColumnFormatting
{
    public function collection()
    {
        return DB::table('ampraham_ppl_tbl as ppl')

            ->join('sekolah_tbl as s_tbl', 'ppl.id_sekolah', '=', 's_tbl.id')
            ->leftjoin('users as us', 'ppl.username_mahasiswa', '=', 'us.username')
            ->selectRaw(
                'ROW_NUMBER() OVER (ORDER BY ppl.id) AS row_index,
                us.name as nama_mahasiswa,
                us.username as nim,
                ppl.name,
                ppl.nama_di_buku_rekening,
                ppl.nip,
                ppl.pangkat_dan_golongan,
                ppl.jabatan,
                
                s_tbl.name as sekolah_name,
                
                ppl.nama_bank,
                ppl.no_rekening,
                ppl.no_npwp,
                ppl.status'
            )
            ->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Mahasiswa',
            'NIM',
            'Nama',
            'Nama Di Buku Rekening',
            'NIP',
            'Pangkat & Golongan',
            'Jabatan',
            'Nama Sekolah',
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
            $row->nama_mahasiswa,
            $row->nim,
            $row->name,
            $row->nama_di_buku_rekening,
            "'" . $row->nip, // Add single quote for text formatting
            $row->pangkat_dan_golongan,
            $row->jabatan,
            $row->sekolah_name,
            $row->nama_bank,
            "'" . $row->no_rekening, // Ensure no_rekening is treated as text
            "'" . $row->no_npwp, // Ensure no_npwp is treated as text
            $row->status
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
