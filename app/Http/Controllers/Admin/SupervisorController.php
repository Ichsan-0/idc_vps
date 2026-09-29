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
        $query = User::whereIn('role', ['supervisor_kpm', 'supervisor', 'Supervisor_KPM']);
        if ($request->has('search_key') && !empty($request->search_key)) {
            $search = $request->search_key;
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('users.name', 'like', '%' . $search . '%')
                         ->orWhere('users.username', 'like', '%' . $search . '%')
                         ->orWhere('users.email', 'like', '%' . $search . '%');
            });
        }

        $sortKey = $request->input('sort_key', 'id');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['id', 'name', 'username', 'email', 'created_at'];
        if (!in_array($sortKey, $allowedSorts)) {
            $sortKey = 'id';
        }
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        $perPage = (int) $request->input('entries_per_page', 10);
        if ($perPage < 1) $perPage = 10;

        $data = $query->orderBy($sortKey, $sortDir)->paginate($perPage);

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
            return response()->json([
                'success' => false,
                'message' => 'Gagal import supervisor: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function exportsupervisor()
    {
        try {
            return Excel::download(new SupervisorExport, 'Kredentials_Supervisor.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal export supervisor: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        try {
            $supervisor = User::find($id);
            if ($supervisor) {
                $supervisor->delete();
                return (new SupervisorResource(true, 'Berhasil Menghapus Supervisor', null))
                    ->response()
                    ->setStatusCode(200);
            }
            return response()->json([
                'success' => false,
                'message' => 'Supervisor tidak ditemukan.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus supervisor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function edit($id) {}

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Supervisor tidak ditemukan.'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,' . $id,
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'NIP / Username wajib diisi.',
            'username.unique' => 'NIP / Username sudah digunakan pengguna lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
            'password.min' => 'Password baru minimal harus 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'username' => $request->username,
            ];

            // Password reset jika superadmin mengisi password
            if ($request->filled('password')) {
                $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
            }

            $user->update($data);

            return (new SupervisorResource(true, 'Supervisor Berhasil diupdate', $user))
                ->response()
                ->setStatusCode(200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui supervisor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data supervisor tidak ditemukan.'
                ], 404);
            }

            return new SupervisorResource(true, 'Detail Data User!', $user);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function tambah(Request $request)
    {
        return Inertia::render('Admin/pages/Pengguna/Supervisor/AddSupervisor');
    }

    public function save(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'NIP / Username wajib diisi.',
            'username.unique' => 'NIP / Username sudah terdaftar.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal harus 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => \Illuminate\Support\Facades\Hash::make($request->password),
                'username' => $request->username,
                'role' => $request->role ?: 'supervisor_kpm',
            ];

            $user = User::create($data);
            return (new SupervisorResource(true, 'Supervisor Berhasil ditambahkan', $user))
                ->response()
                ->setStatusCode(200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan supervisor: ' . $e->getMessage()
            ], 500);
        }
    }
}
