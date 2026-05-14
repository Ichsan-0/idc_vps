<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Data extends Model
{
    use HasFactory;
    protected $fillable = ['buka_pendaftaran', 'link_grup', 'buka_lengkapi_profil', 'buka_lamaran_ppl', 'buka_lamaran_kpm', 'buka_cetak_sertifikat'];

    protected $table = 'data_tbl';
}
