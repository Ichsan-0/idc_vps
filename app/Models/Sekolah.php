<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sekolah extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'province', 'regency', 'sub_district', 'village', 'username_supervisor', 'id_sekolah', 'id_gelombang'];

    protected $table = 'sekolah_tbl';

    public function supervisor()
    {
        return $this->hasOne(User::class, 'username', 'username_supervisor');
    }
    public function master()
    {
        return $this->belongsTo(SekolahMaster::class, 'id_sekolah', 'id');
    }
}
