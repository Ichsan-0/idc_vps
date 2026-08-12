<?php

namespace App\Exports;

use App\Services\Wilayah\Wilayah;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class StudentExport implements FromCollection, WithHeadings, WithMapping, WithColumnFormatting
{
    private $idGelombang;
    private $search;
    private $status;
    private $sortBy;
    private $sortOrder;

    public function __construct($idGelombang = null, $search = null, $status = null, $sortBy = null, $sortOrder = null)
    {
        $this->idGelombang = $idGelombang;
        $this->search = $search;
        $this->status = $status;
        $this->sortBy = $sortBy;
        $this->sortOrder = $sortOrder;
    }

    public function collection()
    {
        $query = DB::table(DB::raw("(
            SELECT
                u.name as nama_mahasiswa,
                u.username as nim,
                u.email as email,
                mtbl.no_hp_wa,
                mtbl.province_code as provinsi_asal,
                mtbl.regency_code as kabupaten_asal,
                mtbl.subdistrict_code as kecamatan_asal,
                mtbl.village_code as desa_asal,
                mtbl.province_code_now as provinsi_sekarang,
                mtbl.regency_code_now as kabupaten_sekarang,
                mtbl.subdistrict_code_now as kecamatan_sekarang,
                mtbl.village_code_now as desa_sekarang,
                mtbl.jk as gender,
                ptbl.name as nama_prodi,
                gtbl.name as nama_gelombang,
                gtbl.id as id_gelombang,
                mtbl.ipk,
                mtbl.nilai_micro_teaching,
                mtbl.cluster_kegiatan,
                mtbl.status as status,
                mtbl.keterangan as keterangan
            FROM users AS u 
            JOIN mahasiswa_tbl AS mtbl on u.username = mtbl.nim
            LEFT JOIN prodi_tbl AS ptbl on mtbl.id_prodi = ptbl.id
            JOIN gelombang_tbl as gtbl on mtbl.id_gelombang = gtbl.id
        ) as mahasiswa"));

        if ($this->idGelombang) {
            $query->where('mahasiswa.id_gelombang', $this->idGelombang);
        }

        if ($this->search) {
            $query->where(function ($q) {
                $q->where('mahasiswa.nama_mahasiswa', 'like', "%{$this->search}%")
                    ->orWhere('mahasiswa.nim', 'like', "%{$this->search}%")
                    ->orWhere('mahasiswa.email', 'like', "%{$this->search}%");
            });
        }

        if (!empty($this->status)) {
            $query->where('mahasiswa.status', $this->status);
        }

        if ($this->sortBy && $this->sortOrder) {
            $columnMap = [
                'name' => 'mahasiswa.nama_mahasiswa',
                'nim' => 'mahasiswa.nim',
                'email' => 'mahasiswa.email',
                'status' => 'mahasiswa.status',
            ];
            $dbCol = $columnMap[$this->sortBy] ?? 'mahasiswa.nim';
            $query->orderBy($dbCol, $this->sortOrder);
        } else {
            $query->orderBy('mahasiswa.status', 'desc');
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Nama Mahasiswa',
            'NIM',
            'Email',
            'No HP/Wa',
            'Provinsi Asal',
            'Kabupaten Asal',
            'Kecamatan Asal',
            'Desa Asal',
            'Provinsi Sekarang',
            'Kabupaten Sekarang',
            'Kecamatan Sekarang',
            'Desa Sekarang',
            'Gender',
            'Nama Prodi',
            'Nama Gelombang',
            'IPK',
            'Nilai Micro',
            'Cluster Kegiatan',
            'Status',
            'Keterangan'
        ];
    }

    public function map($row): array
    {
        // Helper function untuk mendapatkan nama wilayah dengan error handling
        $getWilayahNama = function($kode, $type) {
            if (empty($kode)) return '-';
            
            try {
                return match($type) {
                    'provinsi' => Wilayah::getNamaProvinsi($kode) ?? '-',
                    'kabupaten' => Wilayah::getNamaKabupaten($kode) ?? '-',
                    'kecamatan' => Wilayah::getNamaKecamatan($kode) ?? '-',
                    'desa' => Wilayah::getNamaDesa($kode) ?? '-',
                    default => '-'
                };
            } catch (\Exception $e) {
                return '-';
            }
        };

        return [
            $row->nama_mahasiswa ?? '-',
            "'" . ($row->nim ?? '-'),
            $row->email ?? '-',
            "'" . ($row->no_hp_wa ?? '-'),
            $getWilayahNama($row->provinsi_asal ?? null, 'provinsi'),
            $getWilayahNama($row->kabupaten_asal ?? null, 'kabupaten'),
            $getWilayahNama($row->kecamatan_asal ?? null, 'kecamatan'),
            $getWilayahNama($row->desa_asal ?? null, 'desa'),
            $getWilayahNama($row->provinsi_sekarang ?? null, 'provinsi'),
            $getWilayahNama($row->kabupaten_sekarang ?? null, 'kabupaten'),
            $getWilayahNama($row->kecamatan_sekarang ?? null, 'kecamatan'),
            $getWilayahNama($row->desa_sekarang ?? null, 'desa'),
            $row->gender ?? '-',
            $row->nama_prodi ?? '-',
            $row->nama_gelombang ?? '-',
            is_numeric($row->ipk) ? number_format($row->ipk, 2) : '-',
            $row->nilai_micro_teaching ?? '-',
            $row->cluster_kegiatan ?? '-',
            $this->getStatusText($row->status ?? ''),
            $row->keterangan ?? '-'
        ];
    }

    public function columnFormats(): array
    {
        $columns = range('A', 'Z');
        $formats = [];
        foreach ($columns as $column) {
            $formats[$column] = NumberFormat::FORMAT_TEXT;
        }
        return $formats;
    }

    private function getStatusText($status)
    {
        $statusMap = [
            'accepted' => 'Diterima',
            'rejected' => 'Ditolak',
            'submitted' => 'Submitted',
            'revisi' => 'Revisi'
        ];

        return $statusMap[$status] ?? $status;
    }
}