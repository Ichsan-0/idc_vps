<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskPPLSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'username_mahasiswa',
        'id_kelas',
        'id_tugas',
        'link',
        'status',
        'score'
    ];

    protected $table = 'task_ppl_submission';
}
