<?php

namespace App\Http\Controllers\Admin;

use App\Exports\OperatorProdiExport;
use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use App\Models\AdminSekolah;
use App\Models\AmprahamPPL;
use App\Models\Sekolah;
use App\Models\User as ModelsUser;
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
        return Inertia::render('Admin/pages/Pengguna/AdminSekolah/ListAdminSekolah', ['base_url' => url('/')]);
    }



    public function kepsek_pamong_save(Request $request)
    {

        DB::beginTransaction();
        try {
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
                    'pangkat_dan_golongan' => $request->pangkat_dan_golongan,
                    'nama_bank' => $request->nama_bank,
                    'nama_di_buku_rekening' => $request->nama_di_buku_rekening,
                    'link_document' => $path
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
            $sekolah =  Sekolah::all();

            foreach ($sekolah as $dt) {


                ModelsUser::factory()->create([
                    'username' => strtolower(str_replace(' ', '', $dt->name)),
                    'name' => $dt->name,
                    'email' => strtolower(str_replace(' ', '', $dt->name)) . '@gmail.com',
                    'role' => 'opt-sekolah',
                    'password' => Hash::make('ppkpm2025'),
                ]);

                AdminSekolah::create([
                    'email' => strtolower(str_replace(' ', '', $dt->name)) . '@gmail.com',
                    'id_sekolah' => $dt->id
                ]);
            }
            $data['status'] = 'ok';
            $data['message'] = 'Berhasil membuat  data operator sekolah';

            DB::commit();
            return response()->json($data);
        } catch (Exception $e) {
            DB::rollBack();
            $data['status'] = $e->getCode();
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
        $query = ModelsUser::where('role', 'opt-sekolah')
            ->join('operator_sekolah_tbl as opt_sekolah', 'users.email', '=', 'opt_sekolah.email')
            ->join('sekolah_tbl as s_tbl', 'opt_sekolah.id_sekolah', '=', 's_tbl.id');

        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('users.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('s_tbl.name', 'like', '%' . $request->search_key . '%');
                // ->orWhere('booking_tbl.student_nim', 'like', '%' . $request->search_key . '%');
            });
        }
        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY users.id) AS row_index,
               users.name as nama_opt,
               users.email,
               users.username'
        );

        $data = $query->paginate(10);

        return response()->json($data);
    }

    public function list()
    {
        return Inertia::render('Admin/pages/Data/KepsekPamong/List');
    }
}
