<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SertifikatSekolahModel extends Model
{
    use HasFactory;
    protected $fillable = [
        'nomor_surat',
        'periode_ppl',
        'tanggal_surat',
        'open_print_certificate',
        'id_gelombang'
    ];

    protected $table = 'sertifikat_sekolah_tbl';
}
