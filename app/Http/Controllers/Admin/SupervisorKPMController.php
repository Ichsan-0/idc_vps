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
        return redirect('/admin/users/supervisor-kpm');
    }

    public function edit($id)
    {
        return redirect('/admin/users/supervisor-kpm');
    }

    public function import(Request $request)
    {
        return redirect('/admin/users/supervisor-kpm');
    }

    public function all()
    {
        try {
            $data = \App\Models\User::whereIn('role', ['supervisor_kpm', 'supervisor', 'Supervisor_KPM'])->get();
            return response()->json([
                'status' => true,
                'message' => 'Data Supervisor KPM',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

