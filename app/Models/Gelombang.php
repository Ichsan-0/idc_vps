<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gelombang extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'tahun', 'active'];

    protected $table = 'gelombang_tbl';
}
