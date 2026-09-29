<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/pages/Pengguna/Admin/ListAdmin', [
            'base_url' => url('/')
        ]);
    }

    public function apiList(Request $request)
    {
        $query = User::whereIn('role', ['admin', 'Admin']);

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

        return response()->json([
            'success' => true,
            'message' => 'Data Admin',
            'data' => $data
        ]);
    }

    public function apiSave(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan pengguna lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
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
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'admin',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin baru berhasil ditambahkan.',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan admin: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user || strtolower($user->role) !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,' . $id,
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan pengguna lain.',
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
                'username' => $request->username,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Data Admin berhasil diperbarui.',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui admin: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiDelete(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user || strtolower($user->role) !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin tidak ditemukan.'
                ], 404);
            }

            if (auth()->check() && auth()->id() == $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus akun admin yang sedang Anda gunakan saat ini.'
                ], 400);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Admin berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus admin: ' . $e->getMessage()
            ], 500);
        }
    }

    public function add()
    {
        return redirect()->route('admin.daftaradmin');
    }

    public function save(Request $request)
    {
        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ];

        $user = User::create($data);
        if ($user) {
            return redirect()->route('admin.daftaradmin')->with('message', ['success' => 'Berhasil Menambahkan Admin']);
        }
        return redirect()->route('admin.daftaradmin')->with('message', ['error' => 'Terjadi kesalahan']);
    }

    public function delete(Request $request, $email)
    {
        $admin = User::where('users.email', $email)->first();
        if ($admin) {
            $admin->delete();
            return redirect()->route('admin.daftaradmin')->with('message', ['success' => 'Berhasil Menghapus Admin']);
        }
        return redirect()->route('admin.daftaradmin')->with('message', ['error' => 'Admin tidak ditemukan']);
    }
}

