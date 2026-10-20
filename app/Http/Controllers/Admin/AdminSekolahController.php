<?php

namespace App\Http\Controllers\Admin;

use App\Exports\OperatorProdiExport;
use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use App\Models\AdminSekolah;
use App\Models\AmprahamPPL;
use App\Models\Sekolah;
use App\Models\SekolahMaster;
use App\Models\User as ModelsUser;
use Error;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AdminSekolahController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/pages/Pengguna/AdminSekolah/ListAdminSekolah', [
            'base_url' => url('/'),
            'sekolah_list' => SekolahMaster::orderBy('name')->get(['id', 'name']),
        ]);
    }



    public function kepsek_pamong_save(Request $request)
    {

        $idGelombang = $request->id_gelombang;
        $sekolah = Sekolah::where('id_sekolah', $request->id_sekolah)
            ->where('id_gelombang', $idGelombang)
            ->first();


        DB::beginTransaction();
        try {
            if (!$sekolah) {
                throw new Error('Sekolah tidak ditemukan', 404);
            }
            if ($request->hasFile('dokumen')) {
                $file = $request->file('dokumen');
                $path = $file->store('public/pdf');
                $data = [
                    'name' => $request->name,
                    'nip' => $request->nip,
                    'jabatan' => $request->jabatan,
                    'username_mahasiswa' => $request->username_mahasiswa,
                    'no_rekening' => $request->no_rekening,
                    'no_npwp' => $request->no_npwp,
                    'id_sekolah' => $request->id_sekolah,
                    'pangkat_dan_golongan' => $request->pangkat_golongan,
                    'nama_bank' => $request->nama_bank,
                    'nama_di_buku_rekening' => $request->nama_di_buku_rekening,
                    'link_document' => $path,
                    'id_gelombang' => $idGelombang
                ];

                AmprahamPPL::create($data);
                DB::commit();

                return response()->json([
                    'status' => 'ok',
                    'code' => '200',
                    'message' => 'success'
                ]);
            } else {
                throw new \InvalidArgumentException('File "dokumen" is required.');
            }
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'code' => $e->getCode(),
                'message' => $e->getMessage()
            ]);
        }
    }

    public function generate(Request $request)
    {
        $data = [];

        DB::beginTransaction();
        try {
            $sekolah = SekolahMaster::all();
            $createdCount = 0;
            $skippedCount = 0;

            foreach ($sekolah as $dt) {
                $username = strtolower(str_replace(' ', '', $dt->name));
                $email = $username . '@gmail.com';

                // Cek apakah username atau email sudah ada
                $existingUser = ModelsUser::where('username', $username)
                    ->orWhere('email', $email)
                    ->first();

                // Cek apakah sudah ada AdminSekolah dengan id_sekolah ini
                $existingAdmin = AdminSekolah::where('id_sekolah', $dt->id)->first();

                // Jika user atau admin sudah ada, skip
                if ($existingUser || $existingAdmin) {
                    $skippedCount++;
                    continue;
                }

                // Buat user baru
                ModelsUser::factory()->create([
                    'username' => $username,
                    'name' => $dt->name,
                    'email' => $email,
                    'role' => 'opt-sekolah',
                    'password' => Hash::make('ppkpm2025'),
                ]);

                // Buat admin sekolah
                AdminSekolah::create([
                    'email' => $email,
                    'id_sekolah' => $dt->id
                ]);

                $createdCount++;
            }

            $data['status'] = 'ok';
            $data['message'] = 'Berhasil membuat data operator sekolah';
            $data['created'] = $createdCount;
            $data['skipped'] = $skippedCount;
            $data['total'] = $sekolah->count();

            DB::commit();
            return response()->json($data);
        } catch (Exception $e) {
            DB::rollBack();
            $data['status'] = 'error';
            $data['code'] = $e->getCode();
            $data['message'] = $e->getMessage();
            return response()->json($data);
        }
    }
    public function export()
    {
        return Excel::download(new OperatorProdiExport, 'Kredentials_Admin_sekolah.xlsx');
    }

    public function bulk_delete()
    {



        DB::beginTransaction();
        try {
            $opt_sekolah = ModelsUser::where('role', 'opt-sekolah')->get();

            foreach ($opt_sekolah as $opt) {
                $opt->delete();
            }
            $data['status'] = 'ok';
            $data['message'] = 'Berhasil semua data operator sekolah';

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
            $user = ModelsUser::where('email', $email);

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
        $query = ModelsUser::query()
            ->join('operator_sekolah_tbl as opt', 'users.email', '=', 'opt.email')
            ->join('sekolah_master as sm', 'opt.id_sekolah', '=', 'sm.id')
            ->where('users.role', 'opt-sekolah');

        if ($request->filled('search_key')) {
            $search = $request->input('search_key');
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('users.name', 'like', "%{$search}%")
                    ->orWhere('users.username', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%")
                    ->orWhere('sm.name', 'like', "%{$search}%");
            });
        }

        $sortKey = $request->input('sort_key', 'id');
        $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortColumns = [
            'id' => 'users.id',
            'name' => 'users.name',
            'username' => 'users.username',
            'email' => 'users.email',
            'nama_sekolah' => 'sm.name',
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
                'opt.id_sekolah',
                'sm.name as nama_sekolah',
                'users.created_at',
            ])
            ->orderBy($sortColumn, $sortDir)
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'List Admin Sekolah',
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
            'id_sekolah' => 'required|exists:sekolah_master,id',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan pengguna lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
            'password.required' => 'Password awal wajib diisi.',
            'password.min' => 'Password minimal harus 6 karakter.',
            'id_sekolah.required' => 'Sekolah wajib dipilih.',
            'id_sekolah.exists' => 'Sekolah tidak ditemukan.',
        ]);

        if (AdminSekolah::where('id_sekolah', $validated['id_sekolah'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Sekolah ini sudah memiliki akun operator.',
                'errors' => ['id_sekolah' => ['Sekolah ini sudah memiliki akun operator.']],
            ], 422);
        }

        try {
            $user = DB::transaction(function () use ($validated) {
                $user = ModelsUser::create([
                    'name' => $validated['name'],
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'opt-sekolah',
                    'email_verified_at' => now(),
                ]);

                AdminSekolah::create([
                    'email' => $validated['email'],
                    'id_sekolah' => $validated['id_sekolah'],
                ]);

                return $user;
            });

            return response()->json([
                'success' => true,
                'message' => 'Admin Sekolah berhasil ditambahkan.',
                'data' => $user,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan Admin Sekolah: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = ModelsUser::where('id', $id)->where('role', 'opt-sekolah')->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Sekolah tidak ditemukan.',
            ], 404);
        }

        $operator = AdminSekolah::where('email', $user->email)->first();
        if (!$operator) {
            return response()->json([
                'success' => false,
                'message' => 'Data sekolah operator tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,' . $id,
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'id_sekolah' => 'required|exists:sekolah_master,id',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan pengguna lain.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
            'password.min' => 'Password baru minimal harus 6 karakter.',
            'id_sekolah.required' => 'Sekolah wajib dipilih.',
            'id_sekolah.exists' => 'Sekolah tidak ditemukan.',
        ]);

        $duplicate = AdminSekolah::where('id_sekolah', $validated['id_sekolah'])
            ->where('email', '!=', $user->email)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'Sekolah ini sudah memiliki akun operator.',
                'errors' => ['id_sekolah' => ['Sekolah ini sudah memiliki akun operator.']],
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

                // Refresh data mapping; email bisa sudah ikut ter-update lewat FK cascade.
                $operator = AdminSekolah::find($operator->id);
                if ($operator) {
                    $operator->email = $validated['email'];
                    $operator->id_sekolah = $validated['id_sekolah'];
                    $operator->save();
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Admin Sekolah berhasil diperbarui.',
                'data' => $user->fresh(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui Admin Sekolah: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $user = ModelsUser::where('id', $id)->where('role', 'opt-sekolah')->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Sekolah tidak ditemukan.',
            ], 404);
        }

        try {
            DB::transaction(function () use ($user) {
                AdminSekolah::where('email', $user->email)->delete();
                $user->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Admin Sekolah berhasil dihapus.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus Admin Sekolah: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function list()
    {
        return Inertia::render('Admin/pages/Data/KepsekPamong/List');
    }
}
