<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminSekolah extends Model
{
    use HasFactory;

    protected $table = 'operator_sekolah_tbl';

    protected $fillable = ['id_sekolah', 'email'];
}
