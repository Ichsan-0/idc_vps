<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlokasiPPL extends Controller
{
    public function list(){
        return Inertia::render("Admin/pages/PPL/AlokasiPPL/AlokasiPPL");
    }
}
