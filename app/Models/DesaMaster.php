<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesaMaster extends Model
{
    use HasFactory;

    protected $table = 'master_desa_tbl';

    protected $fillable = ['name', 'description', 'regency', 'sub_district', 'village'];


}
