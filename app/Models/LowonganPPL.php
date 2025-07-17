<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LowonganPPL extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'quota', 'id_sekolah', 'id_prodi'];

    protected $table = 'lowongan_ppl_tbl';

    public function sekolah()
    {
        return $this->hasOne(Sekolah::class, 'id', 'id_sekolah');
    }
    public function prodi()
    {
        return $this->hasOne(Prodi::class, 'id', 'id_prodi');
    }
    public function pelamar()
    {
        return $this->hasMany(LamaranPPL::class, 'id_lowongan_ppl', 'id');
    }
    public function accepted_pelamar()
    {
        return $this->hasMany(LamaranPPL::class, 'id_lowongan_ppl', 'id')->where('status', 'accepted');
    }
}
