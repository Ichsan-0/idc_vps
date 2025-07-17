<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempatPPL extends Model
{
    use HasFactory;

    protected $fillable = ['nama', 'provinsi', 'kabupaten', 'kecamatan',  'username_supervisor'];

    protected $table = 'tempat_ppl_tbl';
}
