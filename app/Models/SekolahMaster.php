<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SekolahMaster extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'province', 'regency', 'sub_district', 'village'];

    protected $table = 'sekolah_master';


}
