<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmprahamPPL extends Model
{
    use HasFactory;

    protected $table = 'ampraham_ppl_tbl';

    protected $fillable = [
        'link_document',
        'no_rekening',
        'no_npwp',
        'nama_di_buku_rekening',
        'username_mahasiswa',
        'name',
        'nip',
        'pangkat_dan_golongan',
        'id_sekolah',
        'jabatan',
        'nama_bank',
        'status',
        'keterangan'
    ];
}
