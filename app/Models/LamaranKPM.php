<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LamaranKPM extends Model
{
    use HasFactory;

    protected $fillable = ['username_mahasiswa', 'id_tempat_kpm', 'status', 'keterangan'];

    protected $table = 'lamaran_kpm_tbl';

    public function kpm()
    {
        return $this->hasOne(TempatKPM::class, 'id', 'id_tempat_kpm');
    }
    public function pelamar()
    {
        return $this->hasOne(User::class, 'username', 'username_mahasiswa');
    }

    public function data_user()
    {
        return $this->hasOne(Mahasiswa::class, 'nim', 'username_mahasiswa');
    }
}
