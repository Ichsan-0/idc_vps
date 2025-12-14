<?php

namespace App\Http\Controllers\Admin;

use App\Exports\StudentExport;
use App\Http\Controllers\Controller;
use App\Imports\MahasiswaImport;
use App\Models\LowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\TempatKPM;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;


class MahsiswaController extends Controller
{
    public function index(Request $request)
    {
        $daftarmahasiswa = Mahasiswa::join('users', 'users.username', '=', 'mahasiswa_tbl.nim')
            ->leftjoin('prodi_tbl', 'prodi_tbl.id', '=', 'mahasiswa_tbl.id_prodi')
            ->select('users.name', 'prodi_tbl.name as nama_prodi', 'mahasiswa_tbl.*')
            ->orderBy('mahasiswa_tbl.status', 'desc')
            ->get();

        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/StudentList', ['daftarmahasiswa' => $daftarmahasiswa]);
    }

    public function updateStatus(Request $request, $id)
    {


        try {
            $mahasiswa = Mahasiswa::where('nim', $id)->first();
            $data = [
                'status' => $request->status,
                'keterangan' => $request->keterangan
            ];
            if (!$mahasiswa) {
                return response()->json([
                    'satus' => 'Gagal mengupdate status mahasiswa',
                    'code' => 404,
                    'message' => 'Mahasiswa tidak ditemukan'
                ], 404);
            }

            $result = $mahasiswa->update($data);


            return response()->json([
                'satus' => 'Berhasil mengupdate status mahasiswa',
                'code' => 200,
                'data' => $result
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'satus' => 'Gagal mengupdate status',
                'code' => $e->getCode(),
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function add(Request $request)
    {
        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/AddMahasiswa');
    }

    public function importmahasiswa(Request $request)
    {
        // dd($request);

        Excel::import(new MahasiswaImport, $request->file('daftarmahasiswa'));

        return redirect()->route('admin.daftarmahasiswa');
    }

    public function edit(Request $request, $nim)
    {
        $dataprodi = Prodi::all();
        $dataLowongan = LowonganPPL::join('sekolah_tbl', 'sekolah_tbl.id', '=', 'ppl_tbl.id_sekolah')
            ->select('ppl_tbl.*', DB::raw("CONCAT('PPL ',ppl_tbl.name, ' ',  sekolah_tbl.name) AS nama_lowongan"))
            ->get();
        // dd($dataLowongan);
        $datamahasiswa = Mahasiswa::where('mahasiswa_tbl.nim', $nim)
            ->join('users', 'users.username', '=',  'mahasiswa_tbl.nim')
            ->select('users.name', 'mahasiswa_tbl.*')
            ->first();

        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/EditMahasiswa', [
            'datalowongan' => $dataLowongan,
            'dataprodi' => $dataprodi,
            'datamahasiswa' => $datamahasiswa,
        ]);
        // dd($datamahasiswa);
    }

    public function update(Request $request, $nim)
    {

        $data = [
            'id_prodi' => $request->id_prodi,
            'id_lowongan_ppl' => $request->id_lowongan_ppl,
        ];

        $mahasiswa = Mahasiswa::where('mahasiswa_tbl.nim', $nim)->first();
        if ($mahasiswa) {
            $result = $mahasiswa->update($data);
            if ($result) {
                return redirect()->route('admin.daftarmahasiswa')->with('message', ['success' => 'Berhasil Memperbaharui Data Mahasiswa']);
            }
        }
        return redirect()->route('admin.daftarmahasiswa')->with('message', ['error' => 'terjadi kesalahan']);
    }
    public function detail($id)
    {
        $mahasiswa = User::where('username', $id)->with(['dataMahasiswa', 'dataMahasiswa.prodi'])->first();

        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/DetailMahasiswa', ['mahasiswa' => $mahasiswa, 'base_url' => url('/')]);
    }

    public function getMahasiswaByUsername(Request $request)
    {
        // return response()->json('test');
        $username = $request->query('x');
        $query = User::query();

        try {
            $query
                ->select(
                    'users.name',
                    'users.username as nim',
                    'users.email',
                    'ptbl.name as nama_prodi',
                    'mhs.jk as gender',
                    'mhs.cluster_kegiatan',
                    'mhs.nilai_micro_teaching',
                    'gtbl.name as nama_gelombang',
                    'mhs.status',
                    'mhs.no_hp_wa',
                    'mhs.province_code as provinsi_asal',
                    'mhs.regency_code as kabupaten_asal',
                    'mhs.subdistrict_code as kecamatan_asal',
                    'mhs.village_code as desa_asal',
                    'mhs.province_code_now as provinsi_sekarang',
                    'mhs.regency_code_now as kabupaten_sekarang',
                    'mhs.subdistrict_code_now as kecamatan_sekarang',
                    'mhs.village_code_now as desa_sekarang',
                    'mhs.ipk',
                    'mhs.nilai_micro_teaching',
                    'mhs.link_transkrip_nilai',
                    'mhs.link_surat_pernyataan',
                    'mhs.link_surat_kesiapan',
                    'mhs.semester',
                    'mhs.cluster_kegiatan',
                    'mhs.keterangan'


                )
                ->join('mahasiswa_tbl as mhs', 'users.username', '=', 'mhs.nim')
                ->leftJoin('prodi_tbl as ptbl', 'mhs.id_prodi', '=', 'ptbl.id')
                ->leftJoin('gelombang_tbl as gtbl', 'mhs.id_gelombang', '=', 'gtbl.id');



            if ($username) {
                $query->where('users.username', $username);
            }

            $data = $query->first();

            return response()->json([
                'message' => 'Successfully get data',
                'data' => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed when getting data',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getMahasiswaByEmailPage(Request $request)
    {
        $username = $request->query('x');
        return Inertia::render('Admin/pages/Pengguna/Mahasiswa/StudentsDetail', ['id' => $username, 'base_url' => url('/')]);
    }

    public function listMahasiswa(Request $request)
    {
        // $query = TempatKPM::query();
        $query = User::query();
        $search = $request->query('search');
        $sortBy = $request->query('sortBy', 'created_at');
        $sortOrder = $request->query('sortOrder', 'desc');
        $perPage = $request->query('perPage', 10);
        $idGelombang = $request->query('idGelombang');
        $status = $request->query('status');
        $data = [];


        try {
            $query
                ->select(
                    'users.name',
                    'users.username as nim',
                    'users.email',
                    'ptbl.name as nama_prodi',
                    'mhs.jk as gender',
                    'mhs.cluster_kegiatan',
                    'mhs.nilai_micro_teaching',
                    'gtbl.name as nama_gelombang',
                    'mhs.status',

                )
                ->join('mahasiswa_tbl as mhs', 'users.username', '=', 'mhs.nim')
                ->leftJoin('prodi_tbl as ptbl', 'mhs.id_prodi', '=', 'ptbl.id')
                ->leftJoin('gelombang_tbl as gtbl', 'mhs.id_gelombang', '=', 'gtbl.id');



            if ($idGelombang) {
                $query->where('mhs.id_gelombang', $idGelombang);
            }
            $query->orderBy('mhs.status', 'DESC');
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('users.name', 'like', "%$search%")
                        ->orWhere('users.username', 'like', "%$search%")
                        ->orWhere('users.email', 'like', "%$search%");
                });
            }
            if($status !== null || !empty($status)){
                $query->where('mhs.status', $status);

            }

            $data = $query->paginate($perPage);



            return response()->json([
                'message' => 'Successfully get all data',
                'data' => $data,
                'gelombang' => $idGelombang
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed when getting data',
                'error' => $e->getMessage()
            ]);
        }
    }


    public function exportData(Request $request)
    {
        $idGelombang = $request->query('idGelombang');
        return Excel::download(new StudentExport($idGelombang), 'Mahasiswa PPKPM.xlsx');
    }
}
