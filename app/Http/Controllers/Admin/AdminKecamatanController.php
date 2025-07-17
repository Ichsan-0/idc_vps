<?php

namespace App\Http\Controllers\Admin;

use App\Exports\OperatorKecamatanExport;
use App\Http\Controllers\Controller;
use App\Models\AdminKecamatan;
use App\Models\TempatKPM;
use App\Models\User;
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

        return Inertia::render('Admin/pages/Pengguna/AdminKecamatan/ListAdminKecamatan', ['base_url' => url('/')]);
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
        $data = [];


        DB::beginTransaction();
        try {
            $tempatkpm = TempatKPM::select('sub_district')
                ->distinct()
                ->get();

            $datakecamatan = collect($request->data_desa);
            foreach ($tempatkpm as $dt) {
                $result = $datakecamatan->firstWhere('kode', $dt['sub_district']);
                User::create([
                    'username' => strtolower(str_replace(' ', '',  $result["nama"])),
                    'name' =>  $result["nama"],
                    'email' => strtolower(str_replace(' ', '',  $result["nama"])) . '@gmail.com',
                    'password' => Hash::make('ppkpm2025'),
                    'role' => 'opt-kecamatan',



                ]);

                AdminKecamatan::create([
                    'email' =>  strtolower(str_replace(' ', '',  $result["nama"])) . '@gmail.com',
                    'id_kecamatan' => $result['kode']
                ]);
            }


            $data['status'] = 'success';
            $data['message'] = 'Berhasil membuat  data operator kecamatan';
            DB::commit();
            return response()->json($data);
        } catch (Exception $e) {
            DB::rollBack();
            $data['status'] = 'error';
            $data['message'] = $e->getMessage();
            return response()->json($data);
        }


        // $result['datamentah'] = $tempatkpm;





        return response()->json($result);
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
        $query = User::where('role', 'opt-kecamatan')
            ->join('operator_kecamatan_tbl as opt_kecamatan', 'users.email', '=', 'opt_kecamatan.email');

        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('users.name', 'like', '%' . $request->search_key . '%');
                // ->orWhere('s_tbl.name', 'like', '%' . $request->search_key . '%');
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
    public function export()
    {
        return Excel::download(new OperatorKecamatanExport, 'Kredentials_Admin_kecamatan.xlsx');
    }
}
