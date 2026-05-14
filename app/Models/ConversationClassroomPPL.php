<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationClassroomPPL extends Model
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

    protected $table = 'conversation_classroom_ppl';
}
