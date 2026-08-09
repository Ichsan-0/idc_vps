<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispensasiSyarat extends Model
{
    use HasFactory;

    protected $table = 'dispensasi_syarat';

    protected $fillable = [
        'nim',
        'nama',
        'program_studi',
        'id_gelombang',
        'sks_diambil',
        'nilai_microteaching',
        'skip_microteaching',
        'skip_sks',
        'alasan',
        'status'
    ];

    protected $casts = [
        'skip_microteaching' => 'boolean',
        'skip_sks' => 'boolean',
    ];

    public function gelombang()
    {
        return $this->belongsTo(Gelombang::class, 'id_gelombang');
    }
}
