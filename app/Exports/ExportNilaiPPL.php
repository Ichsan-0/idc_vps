<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ExportNilaiPPL implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = DB::table(DB::raw("(
            SELECT 
            ROW_NUMBER() OVER (
            ORDER BY s_tbl.name) AS row_index,
                us.name AS nama_mahasiswa,
                us.username AS nim,
                s_tbl.name AS nama_sekolah,
                (
            SELECT us1.name
            FROM users us1
            WHERE us1.username = s_tbl.username_supervisor
            LIMIT 1) AS nama_supervisor,
                m_tbl.nilai_pamong,
                m_tbl.nilai_supervisor_ppl,
                m_tbl.link_instrument_penilaian,
                (
            SELECT link
            FROM task_ppl_submission t_ppl
            WHERE t_ppl.username_mahasiswa = m_tbl.nim LIMIT 1) AS link_laporan
            FROM lamaran_ppl_tbl AS l_ppl
            JOIN mahasiswa_tbl AS m_tbl ON l_ppl.username_mahasiswa = m_tbl.nim
            JOIN users AS us ON l_ppl.username_mahasiswa = us.username
            JOIN lowongan_ppl_tbl AS lw_ppl ON l_ppl.id_lowongan_ppl = lw_ppl.id
            JOIN sekolah_tbl AS s_tbl ON lw_ppl.id_sekolah = s_tbl.id
            WHERE l_ppl.status = 'accepted'
        ) as numbered_data"));

        return $query->get();
    }
    public function headings(): array
    {
        return ['No', 'Name', 'NIM', 'Sekolah', 'Nilai Supervisor', 'Nama Supervisor', 'Nilai Pamong', 'Instrument Penilaian', 'Laporan PPL'];
    }

    public function map($row): array
    {
        return [
            $row->row_index,
            $row->nama_mahasiswa,
            $row->nim,
            $row->nama_sekolah,
            $row->nama_supervisor,
            $row->nilai_pamong,
            $row->nilai_supervisor_ppl,
            $row->link_laporan,
            $row->link_instrument_penilaian ? url('/') . "/storage/" . str_replace('public/', '', $row->link_instrument_penilaian) : ""

        ];
    }
}
