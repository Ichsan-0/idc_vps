<?php

namespace App\Http\Controllers\OperatorSekolah;

use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use App\Models\AdminSekolah;
use App\Models\AmprahamPPL;
use App\Models\Gelombang;
use App\Models\Sekolah;
use App\Models\User as ModelsUser;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpParser\Node\Stmt\Catch_;
use PHPUnit\Framework\MockObject\ReturnValueNotConfiguredException;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class OpratorSekolahController extends Controller
{
    public function index()
    {
        $data_opt = AdminSekolah::where('email', Auth::user()->email)->first();
        $idSekolah = $data_opt ? $data_opt->id_sekolah : null;

        $kelas_ppl = [];
        $sekolahInfo = null;
        $totalPamong = 0;
        $totalMahasiswa = 0;

        if ($idSekolah) {
            $sekolahInfo = DB::table('sekolah_master')->where('id', $idSekolah)->first();

            $kelas_ppl = Sekolah::where('id_sekolah', $idSekolah)
                ->leftJoin('users as u', 'sekolah_tbl.username_supervisor', '=', 'u.username')
                ->with(['gelombang'])
                ->select('sekolah_tbl.*', 'u.name as nama_supervisor')
                ->orderBy('sekolah_tbl.id_gelombang', 'DESC')
                ->get();

            foreach ($kelas_ppl as $item) {
                $item->total_mahasiswa = DB::table('ampraham_ppl_tbl')
                    ->where('id_sekolah', $idSekolah)
                    ->where('id_gelombang', $item->id_gelombang)
                    ->whereNotNull('username_mahasiswa')
                    ->distinct('username_mahasiswa')
                    ->count('username_mahasiswa');

                if ($item->total_mahasiswa === 0) {
                    $item->total_mahasiswa = DB::table('lamaran_ppl_tbl as lp')
                        ->join('lowongan_ppl_tbl as low', 'lp.id_lowongan_ppl', '=', 'low.id')
                        ->where('low.id_sekolah', $idSekolah)
                        ->whereIn('lp.status', ['accepted', 'lulus'])
                        ->count();
                }

                $item->total_pamong = DB::table('ampraham_ppl_tbl')
                    ->where('id_sekolah', $idSekolah)
                    ->where('id_gelombang', $item->id_gelombang)
                    ->where('jabatan', 'Guru Pamong')
                    ->count();

                $kepsek = DB::table('ampraham_ppl_tbl')
                    ->where('id_sekolah', $idSekolah)
                    ->where('id_gelombang', $item->id_gelombang)
                    ->where('jabatan', 'like', '%Kepala Sekolah%')
                    ->first();

                $item->nama_kepsek = $kepsek ? $kepsek->name : null;
            }

            $totalPamong = DB::table('ampraham_ppl_tbl')
                ->where('id_sekolah', $idSekolah)
                ->where('jabatan', 'Guru Pamong')
                ->count();

            $totalMahasiswa = DB::table('ampraham_ppl_tbl')
                ->where('id_sekolah', $idSekolah)
                ->whereNotNull('username_mahasiswa')
                ->distinct('username_mahasiswa')
                ->count('username_mahasiswa');
        }

        $latestGelombang = Gelombang::where('active', 1)->first() ?? Gelombang::latest()->first();

        return Inertia::render('OperatorSekolah/Dashboard', [
            'kelas_ppl' => $kelas_ppl,
            'sekolahInfo' => $sekolahInfo,
            'latestGelombang' => $latestGelombang,
            'data_opt' => $data_opt,
            'totalPamong' => $totalPamong,
            'totalMahasiswa' => $totalMahasiswa,
            'base_url' => url('/')
        ]);
    }

    public function viewKelas($id)
    {
        $data_opt = AdminSekolah::where('email', Auth::user()->email)->first();

        return Inertia::render('OperatorSekolah/Classroom/ViewKelas', [
            'base_url' => url('/'),
            'data' => [
                'id_sekolah_tbl' => $id
            ],
            'data_opt' => $data_opt
        ]);
    }

    public function getClassroomData($id)
    {
        try {
            $sekolah = Sekolah::where('sekolah_tbl.id', $id)
                ->leftJoin('sekolah_master as sm', 'sekolah_tbl.id_sekolah', '=', 'sm.id')
                ->leftJoin('users as u', 'sekolah_tbl.username_supervisor', '=', 'u.username')
                ->with(['gelombang'])
                ->select(
                    'sekolah_tbl.*',
                    'sm.name as nama_sekolah_master',
                    'u.name as nama_supervisor'
                )
                ->first();

            if (!$sekolah) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kelas Sekolah tidak ditemukan'
                ], 404);
            }

            // Mahasiswa from ampraham_ppl_tbl
            $mahasiswaAmpraham = DB::table('ampraham_ppl_tbl as a')
                ->leftJoin('users as u', 'a.username_mahasiswa', '=', 'u.username')
                ->leftJoin('mahasiswa_tbl as m', 'a.username_mahasiswa', '=', 'm.nim')
                ->leftJoin('prodi_tbl as p', 'm.id_prodi', '=', 'p.id')
                ->where('a.id_sekolah', $sekolah->id_sekolah)
                ->where('a.id_gelombang', $sekolah->id_gelombang)
                ->whereNotNull('a.username_mahasiswa')
                ->select(
                    'a.id as id_ampraham',
                    'a.username_mahasiswa as nim',
                    'u.name as nama_mahasiswa',
                    'p.name as prodi',
                    'm.no_hp_wa as no_hp',
                    'a.name as nama_pamong',
                    'a.nip as nip_pamong',
                    'a.link_document',
                    'a.status'
                )
                ->get();

            $existingNims = $mahasiswaAmpraham->pluck('nim')->filter()->toArray();

            // Also check if any students from lamaran_ppl_tbl that haven't been added to ampraham yet
            $lamaranMahasiswa = DB::table('lamaran_ppl_tbl as lp')
                ->join('lowongan_ppl_tbl as low', 'lp.id_lowongan_ppl', '=', 'low.id')
                ->join('users as u', 'lp.username_mahasiswa', '=', 'u.username')
                ->leftJoin('mahasiswa_tbl as m', 'u.username', '=', 'm.nim')
                ->leftJoin('prodi_tbl as p', 'm.id_prodi', '=', 'p.id')
                ->where('low.id_sekolah', $sekolah->id_sekolah)
                ->whereIn('lp.status', ['accepted', 'lulus'])
                ->whereNotIn('lp.username_mahasiswa', $existingNims)
                ->select(
                    DB::raw('NULL as id_ampraham'),
                    'u.username as nim',
                    'u.name as nama_mahasiswa',
                    'p.name as prodi',
                    'm.no_hp_wa as no_hp',
                    DB::raw('NULL as nama_pamong'),
                    DB::raw('NULL as nip_pamong'),
                    DB::raw('NULL as link_document'),
                    'lp.status'
                )
                ->get();

            $mahasiswa = $mahasiswaAmpraham->concat($lamaranMahasiswa)->values();

            // Tasks from task_ppl with submissions
            $tasks = DB::table('task_ppl')->get();
            foreach ($tasks as $task) {
                $submissions = DB::table('task_ppl_submission as tps')
                    ->join('users as u', 'tps.username_mahasiswa', '=', 'u.username')
                    ->leftJoin('mahasiswa_tbl as m', 'u.username', '=', 'm.nim')
                    ->leftJoin('prodi_tbl as p', 'm.id_prodi', '=', 'p.id')
                    ->where(function($q) use ($id, $sekolah) {
                        $q->where('tps.id_kelas', $id)
                          ->orWhere('tps.id_kelas', $sekolah->id_sekolah);
                    })
                    ->where('tps.id_tugas', $task->id)
                    ->select(
                        'tps.*',
                        'u.name as nama_mahasiswa',
                        'p.name as prodi'
                    )
                    ->get();
                $task->submissions = $submissions;
                $task->submitted_count = $submissions->count();
            }

            // Pamong & Kepsek ampraham
            $ampraham = DB::table('ampraham_ppl_tbl')
                ->where('id_sekolah', $sekolah->id_sekolah)
                ->where('id_gelombang', $sekolah->id_gelombang)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'sekolah' => $sekolah,
                    'mahasiswa' => $mahasiswa,
                    'tasks' => $tasks,
                    'ampraham' => $ampraham
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function kepsek_pamong()
    {
        $data_opt = AdminSekolah::where('email', Auth::user()->email)->first();

        return Inertia::render('OperatorSekolah/PamongKepsek', [
            'base_url' => url('/'),
            'data_opt' => $data_opt
        ]);
    }

    public function kepsek_pamong_detail($id)
    {
        $data = AmprahamPPL::join('sekolah_tbl as s_tbl', 'ampraham_ppl_tbl.id_sekolah', '=', 's_tbl.id_sekolah')
            ->join('sekolah_master as sm', 's_tbl.id_sekolah', '=', 'sm.id')
            ->select('sm.name as nama_sekolah', 'ampraham_ppl_tbl.*')
            ->where('ampraham_ppl_tbl.id', $id)
            ->first();
        return Inertia::render('OperatorSekolah/DetailKepsekPamong', ['data' => $data, 'base_url' => url('/')]);
    }


    public function kepsek_pamong_add(Request $request)
    {
        $idGelombang = $request->idGelombang;
        $nama_gelombang = Gelombang::where('id', $idGelombang)->first()->nama_gelombang;
        $data_opt = AdminSekolah::where('email', Auth::user()->email)->first();
        return Inertia::render('OperatorSekolah/AddKepsekPamong', [
            'base_url' => url('/'),
            'data_opt' => $data_opt,
            'idGelombang' => $idGelombang,
            'nama_gelombang' => $nama_gelombang
        ]);
    }
    public function query(Request $request)
    {
        $gelombang = $request->id_gelombang;
        $sekolah = Sekolah::where('id_sekolah', $request->id_sekolah)
            ->where('id_gelombang', $gelombang)
            ->first();
            
        $query = AmprahamPPL::where('ampraham_ppl_tbl.id_sekolah', $request->id_sekolah)
            ->join('sekolah_tbl as s_tbl', 'ampraham_ppl_tbl.id_sekolah', '=', 's_tbl.id_sekolah')
            ->join('sekolah_master as sm', 's_tbl.id_sekolah', '=', 'sm.id')
            ->leftjoin('users as us', 'ampraham_ppl_tbl.username_mahasiswa', '=', 'us.username')
            ->leftjoin('mahasiswa_tbl as mtbl', 'us.username', '=', 'mtbl.nim')
            ->where('ampraham_ppl_tbl.id_gelombang', $gelombang);

        // Filter berdasarkan search_key
        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('ampraham_ppl_tbl.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('s_tbl.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('us.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('us.username', 'like', '%' . $request->search_key . '%');
            });
        }


        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY ampraham_ppl_tbl.id) AS row_index,
           ampraham_ppl_tbl.*,
            sm.name as nama_sekolah,
            us.name as nama_mahasiswa,
            us.username as nim,
            mtbl.id_gelombang'
        );

        $data = $query->paginate(10);

        return response()->json($data);
    }

    public function delete($id)
    {

        DB::beginTransaction();
        try {
            $ampraham = AmprahamPPL::find($id);

            $link_doc = $ampraham->link_document;
            if (Storage::exists($link_doc)) {
                Storage::delete($link_doc);
            }

            $ampraham->delete();

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => 'Record successfully deleted'
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function edit() {}
}
