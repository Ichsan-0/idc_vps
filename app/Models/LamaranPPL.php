<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LamaranPPL extends Model
{
    use HasFactory;
    protected $fillable = ['username_mahasiswa', 'id_lowongan_ppl', 'status', 'keterangan'];

    protected $table = 'lamaran_ppl_tbl';

    public function ppl()
    {
        return $this->hasOne(LowonganPPL::class, 'id', 'id_lowongan_ppl');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'username', 'username_mahasiswa');
    }
    public function data_user()
    {
        return $this->hasOne(Mahasiswa::class, 'nim', 'username_mahasiswa');
    }
}
