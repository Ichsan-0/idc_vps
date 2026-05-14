<?php

namespace App\Http\Controllers\Mahasiswa\Classroom;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Mahasiswa/Classroom/Home');
    }
}
