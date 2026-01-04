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
        return $this->belongsTo(Sekolah::class, 'id_sekolah', 'id');
    }
    
    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'id_prodi', 'id');
    }
    
    public function pelamar()
    {
        return $this->hasMany(LamaranPPL::class, 'id_lowongan_ppl', 'id');
    }
    
    // Alias untuk konsistensi
    public function lamarans()
    {
        return $this->hasMany(LamaranPPL::class, 'id_lowongan_ppl', 'id');
    }
    
    public function accepted_pelamar()
    {
        return $this->hasMany(LamaranPPL::class, 'id_lowongan_ppl', 'id')
                    ->where('status', 'accepted');
    }
}