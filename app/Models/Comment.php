<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'tipe',
        'id_kelas',
        'id_tugas',
        'receiver',
        'message'
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'username', 'created_by');
    }

    public function kelas()
    {
        return $this->hasOne(TempatKPM::class, 'id', 'id_kelas');
    }

    public function tugas()
    {
        return $this->hasOne(Task::class, 'id', 'id_tugas');
    }

    protected $table = 'comment';
}
