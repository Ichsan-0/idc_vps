<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupervisorKPMController extends Controller
{
    public function list(Request $request)
    {
        return Inertia::render(
            'Admin/pages/Pengguna/SupervisorKPM/List',
            [
                'base_url' => url('/')
            ]

        );
    }

    public function add(Request $request)
    {
        return Inertia::render('Admin/pages/Pengguna/SupervisorKPM/Add', [
            'base_url' => url('/')
        ]);
    }

    public function edit($id)
    {
        return Inertia::render('Admin/pages/Pengguna/SupervisorKPM/Edit', [
            'base_url' => url('/'),
            'data' => ['id_supervisor' => $id]
        ]);
    }

    public function import(Request $request)
    {
        return Inertia::render('Admin/pages/Pengguna/SupervisorKPM/Import', [
            'base_url' => url('/')
        ]);
    }

    
}
