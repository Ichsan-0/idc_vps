<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmprahamKPM extends Model
{
    use HasFactory;

    protected $table = 'ampraham_kpm_tbl';

    protected $fillable = [
        'link_document',
        'no_rekening',
        'nama_bank',
        'id_desa',
        'id_kecamatan',
        'nama_di_buku_rekening',
        'no_npwp',
        'name',
        'nip',
        'kecamatan',
        'pangkat_dan_golongan',
        'desa',
        'jabatan',
        'status',
        'keterangan'
    ];
}
