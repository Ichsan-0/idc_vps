<?php

namespace App\Http\Controllers\Admin;

use App\Exports\OperatorKecamatanExport;
use App\Http\Controllers\Controller;
use App\Models\AdminKecamatan;
use App\Models\TempatKPM;
use App\Models\User;
use App\Services\Wilayah\Wilayah;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AdminKecamatanController extends Controller
{
    public function index()
    {
        $kecamatanList = collect(array_merge(
            Wilayah::kecamatan('1108'),
            Wilayah::kecamatan('1171')
        ))
            ->map(fn ($item) => [
                'value' => $item['kode'],
                'label' => $item['nama'],
            ])
            ->unique('value')
            ->sortBy('label')
            ->values();

        return Inertia::render('Admin/pages/Pengguna/AdminKecamatan/ListAdminKecamatan', [
            'base_url' => url('/'),
            'kecamatan_list' => $kecamatanList,
        ]);
    }
    public function detail()
    {
        return Inertia::render('OperatorKecamatan/DetailCamatKeuchik');
    }

    public function list()
    {
        return Inertia::render('');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'data_desa' => 'required|array',
        ], [
            'data_desa.required' => 'Data wilayah kecamatan wajib dikirim.',
        ]);

        DB::beginTransaction();
        try {
            $tempatkpm = TempatKPM::select('sub_district')
                ->distinct()
                ->pluck('sub_district');

            $datakecamatan = collect($request->data_desa);
            $created = 0;
            $skipped = 0;

            foreach ($tempatkpm as $kode) {
                $result = $datakecamatan->firstWhere('kode', $kode);
                if (!$result) {
                    $skipped++;
                    continue;
                }

                $nama = $result['nama'] ?? null;
                if (!$nama) {
                    $skipped++;
                    continue;
                }

                $username = strtolower(str_replace(' ', '', $nama));
                $email = $username . '@gmail.com';

                $existingUser = User::where('username', $username)
                    ->orWhere('email', $email)
                    ->first();
                $existingOperator = AdminKecamatan::where('id_kecamatan', $kode)->first();

                if ($existingUser || $existingOperator) {
                    $skipped++;
                    continue;
                }

                User::create([
                    'username' => $username,
                    'name' => $nama,
                    'email' => $email,
                    'password' => Hash::make('ppkpm2025'),
                    'role' => 'opt-kecamatan',
                ]);

                AdminKecamatan::create([
                    'email' => $email,
                    'id_kecamatan' => $kode,
                ]);

                $created++;
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'success' => true,
                'message' => "Berhasil membuat {$created} akun operator kecamatan, {$skipped} dilewati.",
                'created' => $created,
                'skipped' => $skipped,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    public function bulk_delete()
    {



        DB::beginTransaction();
        try {
            $opt_sekolah = User::where('role', 'opt-kecamatan')->get();

            foreach ($opt_sekolah as $opt) {
                $opt->delete();
            }
            $data['status'] = 'ok';
            $data['message'] = 'Berhasil semua data operator kecamatan';

            DB::commit();
            return response()->json($data);
        } catch (Exception $e) {
            DB::rollBack();
            $data['status'] = $e->getCode();
            $data['message'] = $e->getMessage();
            return response()->json($data);
        }
    }
    public function delete($email)
    {

        DB::beginTransaction();
        try {
            $user = User::where('email', $email);

            $user->delete();
            $data['status'] = 'ok';
            $data['message'] = 'Berhasil  menghapus operator sekolah';
            DB::commit();
            return response()->json($data);
        } catch (Exception $e) {
            DB::rollBack();
            $data['status'] = $e->getCode();
            $data['message'] = $e->getMessage();
            return response()->json($data);
        }
    }
    public function query(Request $request)
    {
        $query = User::query()
            ->join('operator_kecamatan_tbl as opt', 'users.email', '=', 'opt.email')
            ->where('users.role', 'opt-kecamatan');

        if ($request->filled('search_key')) {
            $search = $request->input('search_key');
            $matchingCodes = collect(array_merge(
                Wilayah::kecamatan('1108'),
                Wilayah::kecamatan('1171')
            ))
                ->filter(fn ($item) => stripos($item['nama'], $search) !== false)
                ->pluck('kode')
                ->all();

            $query->where(function ($subQuery) use ($search, $matchingCodes) {
                $subQuery->where('users.name', 'like', "%{$search}%")
                    ->orWhere('users.username', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%")
                    ->orWhere('opt.id_kecamatan', 'like', "%{$search}%");

                if (!empty($matchingCodes)) {
                    $subQuery->orWhereIn('opt.id_kecamatan', $matchingCodes);
                }
            });
        }

        $sortKey = $request->input('sort_key', 'id');
        $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortColumns = [
            'id' => 'users.id',
            'name' => 'users.name',
            'username' => 'users.username',
            'email' => 'users.email',
            'kecamatan' => 'opt.id_kecamatan',
            'created_at' => 'users.created_at',
        ];
        $sortColumn = $sortColumns[$sortKey] ?? $sortColumns['id'];

        $perPage = (int) $request->input('entries_per_page', 10);
        if (!in_array($perPage, [5, 10, 25, 50], true)) {
            $perPage = 10;
        }

        $data = $query
            ->select([
                'users.id',
                'users.name',
                'users.username',
                'users.email',
                'users.role',
                'opt.id as operator_id',
                'opt.id_kecamatan',
                'users.created_at',
            ])
            ->orderBy($sortColumn, $sortDir)
            ->paginate($perPage);

        $data->getCollection()->transform(function ($item) {
            $item->nama_kecamatan = Wilayah::getNamaKecamatan($item->id_kecamatan) ?? $item->id_kecamatan;
            return $item;
        });

        return response()->json([
            'success' => true,
            'message' => 'List Admin Kecamatan',
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'id_kecamatan' => 'required|string|max:20',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan pengguna lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
            'password.required' => 'Password awal wajib diisi.',
            'password.min' => 'Password minimal harus 6 karakter.',
            'id_kecamatan.required' => 'Kecamatan wajib dipilih.',
        ]);

        if (!$this->isValidKecamatan($validated['id_kecamatan'])) {
            return response()->json([
                'success' => false,
                'message' => 'Kecamatan tidak ditemukan.',
                'errors' => ['id_kecamatan' => ['Kecamatan tidak ditemukan.']],
            ], 422);
        }

        if (AdminKecamatan::where('id_kecamatan', $validated['id_kecamatan'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Kecamatan ini sudah memiliki akun operator.',
                'errors' => ['id_kecamatan' => ['Kecamatan ini sudah memiliki akun operator.']],
            ], 422);
        }

        try {
            $user = DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'opt-kecamatan',
                    'email_verified_at' => now(),
                ]);

                AdminKecamatan::create([
                    'email' => $validated['email'],
                    'id_kecamatan' => $validated['id_kecamatan'],
                ]);

                return $user;
            });

            return response()->json([
                'success' => true,
                'message' => 'Admin Kecamatan berhasil ditambahkan.',
                'data' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan Admin Kecamatan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::where('id', $id)->where('role', 'opt-kecamatan')->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Kecamatan tidak ditemukan.',
            ], 404);
        }

        $operator = AdminKecamatan::where('email', $user->email)->first();
        if (!$operator) {
            return response()->json([
                'success' => false,
                'message' => 'Data kecamatan operator tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,' . $id,
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'id_kecamatan' => 'required|string|max:20',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan pengguna lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
            'password.min' => 'Password baru minimal harus 6 karakter.',
            'id_kecamatan.required' => 'Kecamatan wajib dipilih.',
        ]);

        if (!$this->isValidKecamatan($validated['id_kecamatan'])) {
            return response()->json([
                'success' => false,
                'message' => 'Kecamatan tidak ditemukan.',
                'errors' => ['id_kecamatan' => ['Kecamatan tidak ditemukan.']],
            ], 422);
        }

        $duplicate = AdminKecamatan::where('id_kecamatan', $validated['id_kecamatan'])
            ->where('email', '!=', $user->email)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'Kecamatan ini sudah memiliki akun operator.',
                'errors' => ['id_kecamatan' => ['Kecamatan ini sudah memiliki akun operator.']],
            ], 422);
        }

        try {
            DB::transaction(function () use ($user, $operator, $validated) {
                $userData = [
                    'name' => $validated['name'],
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                ];

                if (!empty($validated['password'])) {
                    $userData['password'] = Hash::make($validated['password']);
                }

                $user->update($userData);

                $operator = AdminKecamatan::find($operator->id);
                if ($operator) {
                    $operator->email = $validated['email'];
                    $operator->id_kecamatan = $validated['id_kecamatan'];
                    $operator->save();
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Admin Kecamatan berhasil diperbarui.',
                'data' => $user->fresh(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui Admin Kecamatan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $user = User::where('id', $id)->where('role', 'opt-kecamatan')->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Kecamatan tidak ditemukan.',
            ], 404);
        }

        try {
            DB::transaction(function () use ($user) {
                AdminKecamatan::where('email', $user->email)->delete();
                $user->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Admin Kecamatan berhasil dihapus.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus Admin Kecamatan: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function isValidKecamatan(string $kode): bool
    {
        return collect(array_merge(
            Wilayah::kecamatan('1108'),
            Wilayah::kecamatan('1171')
        ))->contains('kode', $kode);
    }
    public function export()
    {
        return Excel::download(new OperatorKecamatanExport, 'Kredentials_Admin_kecamatan.xlsx');
    }
}
