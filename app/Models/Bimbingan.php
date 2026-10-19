<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bimbingan extends Model
{
    use HasFactory;

    protected $table = 'bimbingan_tbl';

    protected $fillable = [
        'tipe',
        'id_kelas',
        'username_mahasiswa',
        'username_supervisor',
        'bimbingan_ke',
        'tanggal',
        'judul',
        'deskripsi',
        'file_lampiran',
        'status',
        'catatan_supervisor',
        'validated_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'validated_at' => 'datetime',
        'bimbingan_ke' => 'integer',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(User::class, 'username_mahasiswa', 'username');
    }

    public function mahasiswaData()
    {
        return $this->belongsTo(Mahasiswa::class, 'username_mahasiswa', 'nim');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'username_supervisor', 'username');
    }

    public function tempatKpm()
    {
        return $this->belongsTo(TempatKPM::class, 'id_kelas', 'id');
    }

    public function sekolahPpl()
    {
        return $this->belongsTo(Sekolah::class, 'id_kelas', 'id');
    }
}
