<?php

namespace App\Http\Controllers;

use App\Services\Wilayah\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountSettingsController extends Controller
{
    private const ALLOWED_ROLES = [
        'supervisor',
        'supervisor_kpm',
        'opt-sekolah',
        'opt-kecamatan',
    ];

    /**
     * Tampilkan halaman pengaturan akun sesuai role pengguna.
     */
    public function edit(Request $request)
    {
        $user = $request->user();

        if (!$this->isAllowed($user)) {
            return $this->redirectForRole($user);
        }

        $affiliation = null;

        if ($user->role === 'opt-sekolah') {
            $row = DB::table('operator_sekolah_tbl as o')
                ->join('sekolah_master as s', 'o.id_sekolah', '=', 's.id')
                ->where('o.email', $user->email)
                ->select('s.name')
                ->first();

            $affiliation = $row?->name;
        } elseif ($user->role === 'opt-kecamatan') {
            $row = DB::table('operator_kecamatan_tbl')
                ->where('email', $user->email)
                ->select('id_kecamatan')
                ->first();

            if ($row) {
                $affiliation = Wilayah::getNamaKecamatan($row->id_kecamatan)
                    ?? $row->id_kecamatan;
            }
        }

        return Inertia::render('PengaturanAkun/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'roleLabel' => $this->roleLabel($user->role),
            'affiliation' => $affiliation,
        ]);
    }

    /**
     * Simpan perubahan data akun.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if (!$this->isAllowed($user)) {
            return $this->redirectForRole($user);
        }

        $request->merge([
            'name' => trim((string) $request->input('name')),
            'username' => trim((string) $request->input('username')),
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => ['nullable', 'required_with:password', 'current_password'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan pengguna lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
            'current_password.required_with' => 'Password saat ini wajib diisi untuk mengganti password.',
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $oldEmail = $user->email;

        try {
            DB::transaction(function () use ($user, $validated, $oldEmail) {
                $user->name = $validated['name'];
                $user->username = $validated['username'];
                $user->email = $validated['email'];

                if (!empty($validated['password'])) {
                    $user->password = Hash::make($validated['password']);
                }

                if ($oldEmail !== $validated['email']) {
                    $user->email_verified_at = null;
                }

                $user->save();

                if ($oldEmail !== $validated['email']) {
                    // Jaga mapping operator tetap sinkron jika FK cascade tidak aktif.
                    DB::table('operator_sekolah_tbl')
                        ->where('email', $oldEmail)
                        ->update(['email' => $validated['email']]);

                    DB::table('operator_kecamatan_tbl')
                        ->where('email', $oldEmail)
                        ->update(['email' => $validated['email']]);
                }
            });
        } catch (\Throwable $e) {
            return back()->with('message', [
                'error' => 'Gagal menyimpan pengaturan akun: ' . $e->getMessage(),
            ]);
        }

        return back()->with('message', [
            'success' => 'Pengaturan akun berhasil diperbarui.',
        ]);
    }

    private function isAllowed($user): bool
    {
        return $user && in_array($user->role, self::ALLOWED_ROLES, true);
    }

    private function roleLabel(string $role): string
    {
        return match ($role) {
            'supervisor' => 'Supervisor PPL',
            'supervisor_kpm' => 'Supervisor KPM',
            'opt-sekolah' => 'Admin Sekolah',
            'opt-kecamatan' => 'Admin Kecamatan',
            default => 'Pengguna',
        };
    }

    private function redirectForRole($user)
    {
        return match ($user?->role) {
            'admin' => redirect('/admin/dashboard'),
            'user' => redirect('/profil'),
            'supervisor' => redirect('/supervisor/dashboard'),
            'supervisor_kpm' => redirect('/supervisor/classroom/home'),
            'opt-sekolah' => redirect('/operator-sekolah/dashboard'),
            'opt-kecamatan' => redirect('/operator-kecamatan/dashboard'),
            default => redirect('/'),
        };
    }
}
