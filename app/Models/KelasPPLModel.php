<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KelasPPLModel extends Model
{
    use HasFactory;

    protected $fillable = ['id_gelombang', 'id_sekolah', 'username_supervisor'];

    protected $table = 'kelas_ppl';
    
}
