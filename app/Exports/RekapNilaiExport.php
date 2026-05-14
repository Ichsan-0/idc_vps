<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RekapNilaiExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */

    protected $id_gelombang;
    

    public function __construct($id_gelombang)
    {
        $this->id_gelombang = $id_gelombang;
    }
    public function collection()
    {
        $data = DB::table('nilai_ppkpm_view')
                ->select(
                    'nama_mahasiswa',
                    'nim',
                    'no_hp',
                    'nama_prodi',
                    'cluster_kegiatan',
                    'nama_tempat_kpm',
                    'nilai_supervisor_kpm',
                    'nilai_keuchik',
                    'SM_KPM',
                    'PK_KPM',
                    'LK_KPM',
                    'nama_tempat_ppl',
                    'nilai_supervisor_ppl',
                    'nilai_pamong',
                    'SM_PPL',
                    'PK_PPL',
                    'LK_PPL',
                    'nilai_ppkpm',
                    'index_nilai_ppkpm',
                    'nama_gelombang'
                )
                ->where('id_gelombang_tertinggi', $this->id_gelombang)->get();
           

        return $data;
    }
    public function headings(): array{
        $headings = [
            'Nama',
            'NIM',
            'No Hp',
            'Program Studi',
            'Cluster Kegiatan',
            'Tempat KPM',
            'Nilai SPV KPM',
            'Nilai Keuchik',
            'SM KPM',
            'PK KPM (75%)',
            'LK KPM (25%)',
            'Sekolah',
            'Nilai SPV PPL',
            'Nilai Pamong',
            'SM PPL',
            'PK PPL (75%)',
            'LK PPL (25%)',
            'NILAI PPKPM',
            'HURUF',
            'nama_gelombang'
        ];

        return $headings;

    }

}
