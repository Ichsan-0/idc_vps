<?php

namespace App\Http\Controllers\Admin;

use App\Exports\SupervisorExport;
use App\Http\Controllers\Controller;
use App\Imports\SupervisorImport;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Resources\SupervisorResource;


class SupervisorController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'supervisor_kpm');
        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('users.name', 'like', '%' . $request->search_key . '%');
            });
        }
        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY users.id) AS row_index,
                users.id,
               users.name as name,
               users.email,
               users.username'
        );
        $data = $query->paginate(10);

        return new SupervisorResource(true, 'List Supervisor', $data);
    }
    public function import()
    {
        return Inertia::render('Admin/pages/Pengguna/Supervisor/ImportSupervisor');
    }

    public function importsupervisor(Request $request)
    {
        try {
            $import = Excel::import(new SupervisorImport, $request->file('daftarsupervisor'));
            return new SupervisorResource(true, 'Berhasil Import Data Supervisor', $import);
        } catch (\Exception $e) {
            return new SupervisorResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function exportsupervisor()
    {
        try {
            return Excel::download(new SupervisorExport, 'Kredentials_Supervisor.xlsx');
        } catch (\Exception $e) {
            return new SupervisorResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function delete($id)
    {
        try {
            // dd($id);
            $supervisor = User::find($id);
            if ($supervisor) {
                $result = $supervisor->delete();
                if ($result) {
                    // return redirect()->back()->with('message', ['success' => 'Berhasil Menghapus Supervisor']);
                    return new SupervisorResource(true, 'Berhasil Menghapus Supervisor', null);
                }
            }
            // return redirect()->back()->with('message', ['error' => 'Gagal Menghapus Supervisor']);
            return new SupervisorResource(false, 'Gagal Menghapus Supervisor', null);
        } catch (\Exception $e) {
            return new SupervisorResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function edit($id) {}

    public function update(Request $request, $id)
    {
        try {
            // Data yang akan diupdate
            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'username' => $request->username,

            ];



            // Cari user berdasarkan ID
            $user = User::find($id);

            if ($user) {
                // Update data user
                $user->update($data);

                // Response sukses
                return new SupervisorResource(true, 'Supervisor Berhasil diupdate', $user);
            }

            // Jika user tidak ditemukan
            return new SupervisorResource(false, 'Supervisor tidak ditemukan', null);
        } catch (\Exception $e) {
            return new SupervisorResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function show($id)
    {
        try {
            //find post by ID
            $user = User::find($id);

            //return single User as a resource
            return new SupervisorResource(true, 'Detail Data User!', $user);
        } catch (\Exception $e) {
            return new SupervisorResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function tambah(Request $request)
    {

        // dd($request);
        return Inertia::render('Admin/pages/Pengguna/Supervisor/AddSupervisor');
    }

    public function save(Request $request)
    {
        try {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'username' => $request->username,
                'role' => $request->role,
            ];

            $user = User::create($data);
            if ($user) {
                // return redirect('/admin/daftarsupervisor')->with('message', ['success' => 'Supervisor Berhasil ditambahkan']);
                return new SupervisorResource(true, 'Supervisor Berhasil ditambahkan', $user);
            }
            // return redirect('/admin/daftarsupervisor')->with('message', ['success' => 'Supervisor Berhasil ditambahkan']);
            return new SupervisorResource(false, 'Supervisor gagal ditambahkan', null);
        } catch (\Exception $e) {
            return new SupervisorResource(false, $e->getMessage(), $e->getCode());
        }
    }
}
