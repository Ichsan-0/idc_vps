<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskPPL extends Model
{
    use HasFactory;
    protected $fillable = [
        'name', 
        'tenggat', 
        'deskripsi', 
        'tipe'
    ];

    protected $table = 'task_ppl';
}
