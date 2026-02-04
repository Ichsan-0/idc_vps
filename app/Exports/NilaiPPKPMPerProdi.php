<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class NilaiPPKPMPerProdi implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */

    protected $id_prodi;
    protected $id_gelombang;
    

    public function __construct($id_prodi, $id_gelombang)
    {
        $this->id_prodi = $id_prodi;
        $this->id_gelombang = $id_gelombang;
    }

    public function collection()
    {
        $data = [];
        $query = DB::table('nilai_ppkpm_view')
                ->select(
                    'nama_mahasiswa',
                    'nim',
                    'no_hp',
                    'nama_prodi',
                    'cluster_kegiatan',
                    'nama_tempat_kpm',
                    'SM_KPM',
                    'nama_tempat_ppl',
                    'SM_PPL',
                    'nilai_ppkpm',
                    'index_nilai_ppkpm'
                )
                ->where('id_gelombang_tertinggi', $this->id_gelombang);

        if(!empty($this->id_prodi)){
            $query->where(function($subQuery){
                $subQuery->where('id_prodi', $this->id_prodi);

            });
        }
        $data = $query->get();
        
        

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
            'Nilai KPM',
            'Sekolah',
            'Nilai PPL',
            'NILAI PPKPM',
            'HURUF'
        ];

        return $headings;

    }
}
