<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminKecamatan extends Model
{
    use HasFactory;

    protected $table = 'operator_kecamatan_tbl';
    protected $fillable = ['email', 'id_kecamatan'];
}
