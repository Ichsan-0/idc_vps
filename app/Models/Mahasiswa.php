<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    // protected $fillable = ['nim',
    protected $fillable = [
        'nim',
        'id_prodi',
        'no_hp_wa',
        'province_code',
        'regency_code',
        'subdistrict_code',
        'village_code',
        'province_code_now',
        'regency_code_now',
        'village_code_now',
        'ipk',
        'nilai_micro_teaching',
        'link_transkrip_nilai',
        'semester',
        'cluster_kegiatan',
        'valid_data',
        'lulus_mk_micro',
        'kebenaran_data',
        'no_mk',
        'bersedia_dimanasaja',
        'link_ket_no_mk',
        'id_tempat_kpm',
        'id_lowongan_ppl',
        'nilai_supervisor_ppl',
        'nilai_supervisor_kpm',
        'nilai_keuchik',
        'nilai_pamong',
        'link_instrument_penilaian',
        'kode',
        'status',
        'keterangan',
        'jk',
    ];

    protected $table = 'mahasiswa_tbl';

    public function prodi()
    {
        return $this->hasOne(Prodi::class, 'id', 'id_prodi');
    }
}
