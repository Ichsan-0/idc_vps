<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BimbinganRekapExport implements FromQuery, WithHeadings, WithMapping
{
    private $query;

    private int $rowNumber = 0;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function query()
    {
        return $this->query;
    }

    public function headings(): array
    {
        return [
            'No',
            'NIM',
            'Nama Mahasiswa',
            'Kegiatan',
            'Tahun Ajaran',
            'Kelas / Tempat',
            'Bimbingan Ke',
            'Tanggal',
            'Judul',
            'Deskripsi',
            'Status',
            'Supervisor',
            'Catatan Supervisor',
            'Divalidasi Pada',
        ];
    }

    public function map($row): array
    {
        $this->rowNumber++;

        $statusLabels = [
            'approved' => 'Disetujui',
            'pending' => 'Menunggu validasi',
            'rejected' => 'Perlu revisi',
        ];

        return [
            $this->rowNumber,
            $row->username_mahasiswa,
            $row->nama_mahasiswa,
            strtoupper((string) $row->tipe),
            $row->nama_gelombang,
            $row->tipe === 'kpm' ? $row->nama_tempat_kpm : $row->nama_sekolah,
            $row->bimbingan_ke,
            $row->tanggal,
            $row->judul,
            $row->deskripsi,
            $statusLabels[$row->status] ?? $row->status,
            $row->nama_supervisor ?: $row->username_supervisor,
            $row->catatan_supervisor,
            $row->validated_at,
        ];
    }
}
