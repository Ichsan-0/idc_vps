<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $daftaraadmin = User::where('role', '=', 'admin')
            ->select('users.username', 'users.name', 'users.email', 'users.id')
            ->get();
        return Inertia::render('Admin/pages/Pengguna/Admin/ListAdmin', ['daftaradmin' => $daftaraadmin]);
    }

    public function add()
    {
        return Inertia::render('Admin/pages/Pengguna/Admin/AddAdmin');
    }
    public function save(Request $request)
    {
        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => $request->password,
            'role' => 'admin',
        ];

        $user = User::create($data);
        if ($user) {
            return redirect('admin/daftaradmin')->with('message', ['success' => 'Berhasil Menambahkan Admin']);
        }
        return redirect('admin/daftaradmin')->with('message', ['error' => 'Terjadi kesalahan']);
    }

    public function delete(Request $request, $email)
    {
        $admin = User::where('users.email', $email)->first();
        $result = $admin->delete();
        if ($result) {
            return redirect('admin/daftaradmin')->with('message', ['success' => 'Berhasil Menghapus Admin']);
        }
        return redirect('admin/daftaradmin')->with('message', ['error' => 'Terjadi kesalahan']);
    }
}
