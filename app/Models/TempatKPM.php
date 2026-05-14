<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use PhpParser\Node\Expr\FuncCall;

class TempatKPM extends Model
{
    use HasFactory;

    protected $table = 'tempat_kpm_tbl';

    protected $fillable = [
        'name',
        'description',
        'qouta',
        'regency',
        'sub_district',
        'village',
        'username_supervisor',
        'id_desa',
        'quota_lk',
        'quota_pr',
        'id_gelombang'
    ];
    



    public function accepted_pelamar()
    {
        return $this->hasMany(LamaranKPM::class, 'id_tempat_kpm')->where('status', 'accepted');
    }

    public function pelamar()
    {
        return $this->hasMany(LamaranKPM::class, 'id_tempat_kpm')->where('status', 'accepted');
    }

    public function gelombang()
    {
        return $this->belongsTo(Gelombang::class, 'id_gelombang', 'id');
    }
}
