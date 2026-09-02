<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesaMaster;
use App\Models\Gelombang;
use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use App\Models\TempatKPM as ModelsTempatKPM;
use App\Models\User as ModelsUser;
use Error;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Termwind\Components\Raw;

use function PHPUnit\Framework\isEmpty;

class TempatKPM extends Controller
{
    public function getAllTempatKPM()
    {

        $gelombangData = Gelombang::latest()->first();


        $data = ModelsTempatKPM::where('id_gelombang', $gelombangData->id)->get();
        return response()->json(['data' => $data]);
    }

    public function getAllStudents(Request $request)
    {
        $query = ModelsUser::query();
        $data = [];

        $search = $request->search;
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%$search%")
                    ->orWhere('users.username', 'like', "%$search%");
            })->where('users.role', 'user');
            $data = $query->get();
        }

        return response()->json(['data' => $data]);
    }
    public function list_pelamar()
    {
        // $pelamar = DB::raw('SELECT * FROM users');

        $pelamar = LamaranKPM::join('users as us', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'us.username')
            ->join('tempat_kpm_tbl as t_kpm', 'lamaran_kpm_tbl.id_tempat_kpm', '=', 't_kpm.id')
            ->join('mahasiswa_tbl as m_t', 'us.username', '=', 'm_t.nim')
            ->join('prodi_tbl as p_tbl', 'm_t.id_prodi', '=', 'p_tbl.id')
            ->select(
                'lamaran_kpm_tbl.id',
                't_kpm.name as nama_tempat_kpm',
                't_kpm.qouta as quota',
                't_kpm.id as id_tempat_kpm',
                'us.name as nama_mahasiswa',
                'm_t.nim',
                'm_t.jk',
                'p_tbl.name as nama_prodi',
                DB::raw('(SELECT COUNT(*) FROM lamaran_kpm_tbl AS l_kpm WHERE l_kpm.status = "accepted" AND l_kpm.id_tempat_kpm = t_kpm.id) AS accepted_pelamar_count'),
                DB::raw('(SELECT COUNT(*) FROM lamaran_kpm_tbl AS l_kpm JOIN mahasiswa_tbl AS m_td ON l_kpm.username_mahasiswa = m_td.nim WHERE l_kpm.status = "accepted" AND m_td.jk = "Pria"  AND l_kpm.id_tempat_kpm = t_kpm.id ) AS jumlah_pria'),
                DB::raw('(SELECT COUNT(*) FROM lamaran_kpm_tbl AS l_kpm JOIN mahasiswa_tbl AS m_td ON l_kpm.username_mahasiswa = m_td.nim WHERE l_kpm.status = "accepted" AND m_td.jk = "Wanita"  AND l_kpm.id_tempat_kpm = t_kpm.id ) AS jumlah_wanita'),
            )
            ->where('lamaran_kpm_tbl.status', 'submitted')
            ->orderBy('lamaran_kpm_tbl.created_at', 'asc')
            ->get();
        return Inertia::render('Admin/pages/KPM/ListPelamarLowonganKPM', ['pelamar' => $pelamar]);
    }
    public function list()
    {
        // $tempat_kpm = ModelsTempatKPM::withCount('accepted_pelamar')->get();

        $tempat_kpm = ModelsTempatKPM::select(
            'tempat_kpm_tbl.id',
            'tempat_kpm_tbl.name',
            'tempat_kpm_tbl.qouta',
            DB::raw('
                JSON_OBJECT(
                    "regency", tempat_kpm_tbl.regency,
                    "sub_district", tempat_kpm_tbl.sub_district,
                    "village", tempat_kpm_tbl.village
                ) AS location
            '),
            DB::raw('(SELECT COUNT(*) FROM lamaran_kpm_tbl AS l_kpm WHERE l_kpm.status = "accepted" AND l_kpm.id_tempat_kpm = tempat_kpm_tbl.id) AS accepted_pelamar_count'),
            DB::raw('(SELECT COUNT(*) FROM lamaran_kpm_tbl AS l_kpm JOIN mahasiswa_tbl AS m_t ON l_kpm.username_mahasiswa = m_t.nim WHERE l_kpm.status = "accepted" AND m_t.jk = "Pria"  AND l_kpm.id_tempat_kpm = tempat_kpm_tbl.id ) AS jumlah_pria'),
            DB::raw('(SELECT COUNT(*) FROM lamaran_kpm_tbl AS l_kpm JOIN mahasiswa_tbl AS m_t ON l_kpm.username_mahasiswa = m_t.nim WHERE l_kpm.status = "accepted" AND m_t.jk = "Wanita"  AND l_kpm.id_tempat_kpm = tempat_kpm_tbl.id ) AS jumlah_wanita'),
            DB::raw('(SELECT users.name FROM users WHERE tempat_kpm_tbl.username_supervisor = users.username) as nama_supervisor')

        )->get();
        $tempat_kpm->transform(function ($item) {
            $item->location = json_decode($item->location);
            return $item;
        });
        return Inertia::render('Admin/pages/KPM/TempatKPM', ['tempat_kpm' => $tempat_kpm]);
    }

    public function detail_pelamar($id)
    {

        $lamaran = LamaranKPM::where('id', $id)->with(['kpm', 'pelamar', 'data_user', 'data_user.prodi'])->first();
        $tempatkpm = ModelsTempatKPM::withCount('accepted_pelamar')->where('id', $lamaran->kpm->id)->first();
        $jumlah_pria = LamaranKPM::join('mahasiswa_tbl as m_t', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'm_t.nim')
            ->where('lamaran_kpm_tbl.id_tempat_kpm', $lamaran->kpm->id)
            ->where('lamaran_kpm_tbl.status', 'accepted')
            ->where('m_t.jk', 'Pria')
            ->count();
        $jumlah_wanita = LamaranKPM::join('mahasiswa_tbl as m_t', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'm_t.nim')
            ->where('lamaran_kpm_tbl.id_tempat_kpm', $lamaran->kpm->id)
            ->where('lamaran_kpm_tbl.status', 'accepted')
            ->where('m_t.jk', 'Wanita')
            ->count();
        $tempatkpm['jumlah_pria'] = $jumlah_pria;
        $tempatkpm['jumlah_wanita'] = $jumlah_wanita;
        return Inertia::render('Admin/pages/KPM/FollowUpLamaranKPM', [
            'lamaran' => $lamaran,
            'tempatkpm' => $tempatkpm,

        ]);
    }

    public function followup(Request $request, $id)
    {
        $lamaran = LamaranKPM::find($id);
        $data = [
            'status' => $request->status,
            'keterangan' => $request->keterangan,
        ];
        // dd($lamaran);

        $lamaran_kpm_user = LamaranKPM::where('username_mahasiswa', $lamaran->username_mahasiswa)
            ->where('id', '!=', $id)
            ->get();


        DB::beginTransaction();
        try {

            if (count($lamaran_kpm_user) > 0 && $data['status'] === 'accepted') {
                foreach ($lamaran_kpm_user as $lamaran_user) {
                    $lamaran_user->delete();
                }
            }
            $lamaran->update($data);


            DB::commit();
            return redirect('/admin/tempatkpm/pelamar/list')->with('message', ['success' => 'Berhasil Memperbaharui']);
        } catch (Exception $e) {
            DB::rollBack();
            return redirect('/admin/tempatkpm')->with('message', ['error' => $e->getMessage()]);
        }
    }

    public function add()
    {
        return Inertia::render('Admin/pages/KPM/AddTempatKPM');
    }
    public function save(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'required',
            'regency' => 'required',
            'sub_district' => 'required',
            'village' => 'required',
            'qouta' => 'required|numeric'

        ]);
        ModelsTempatKPM::create($validated);

        return redirect('/admin/tempatkpm');
    }

    public function detail(Request $request, $id)
    {
        $tempat_kpm = ModelsTempatKPM::where('id', $id)->withCount('accepted_pelamar')->first();


        $pelamar = LamaranKPM::where('id_tempat_kpm', $id)->with(['pelamar', 'data_user', 'data_user.prodi'])->get();

        return Inertia::render('Admin/pages/KPM/DetailTempatKPM', [
            'tempat_kpm' => $tempat_kpm,
            'pelamar' => $pelamar,

        ]);
    }

    public function edit($id)
    {
        $tempat_kpm = ModelsTempatKPM::find($id);
        $supervisor = ModelsUser::where('role', 'supervisor_kpm')->get();
        return Inertia::render('Admin/pages/KPM/EditTempatKPM', [
            'tempat_kpm' => $tempat_kpm,
            'supervisor' => $supervisor
        ]);
    }
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'required',
            'regency' => 'required',
            'sub_district' => 'required',
            'village' => 'required',
            'qouta' => 'required|numeric',
            'username_supervisor' => 'required',

        ]);
        $tempat_kpm = ModelsTempatKPM::find($id);
        $tempat_kpm->update($validated);
        return redirect('/admin/tempatkpm');
    }
    public function delete($id)
    {
        $tempat = ModelsTempatKPM::find($id);
        $tempat->delete();
        return redirect()->back();
    }

    public function home()
    {
        return Inertia::render('Admin/pages/KPM/TempatKPM/ListTempatKPM');
    }

    public function getData(Request $request)
    {


        $query = ModelsTempatKPM::query();
        $search = $request->query('search');
        $sortBy = $request->query('sortBy', 'created_at');
        $sortOrder = $request->query('sortOrder', 'desc');
        $perPage = $request->query('perPage', 10);
        $idGelombang = $request->query('idGelombang');
        $data = [];


        try {
            $query
                ->select(
                    'tempat_kpm_tbl.id',
                    'dt.name',
                    'dt.regency',
                    'dt.sub_district',
                    'dt.village',
                    'tempat_kpm_tbl.username_supervisor',
                    'usr.name as nama_supervisor',
                    'tempat_kpm_tbl.qouta',
                    'tempat_kpm_tbl.quota_lk',
                    'tempat_kpm_tbl.quota_pr',
                    DB::raw('COUNT(lkt.username_mahasiswa) as total'),
                    DB::raw("SUM(CASE WHEN mtb.jk = 'Pria' THEN 1 ELSE 0 END) as total_male"),
                    DB::raw("SUM(CASE WHEN mtb.jk = 'Wanita' THEN 1 ELSE 0 END) as total_female")

                )
                ->join('master_desa_tbl as dt', 'tempat_kpm_tbl.id_desa', '=', 'dt.id')
                ->join('gelombang_tbl as gt', 'tempat_kpm_tbl.id_gelombang', '=', 'gt.id')
                ->leftjoin('lamaran_kpm_tbl as lkt', 'tempat_kpm_tbl.id', '=', 'lkt.id_tempat_kpm')
                ->leftjoin('mahasiswa_tbl as mtb', 'lkt.username_mahasiswa', '=', 'mtb.nim')
                ->leftjoin("users as usr", 'tempat_kpm_tbl.username_supervisor', '=', 'usr.username')
                ->where(function ($q) {
                    $q->where('lkt.status', 'accepted')
                        ->orWhereNull('lkt.status');
                })
                ->groupBy(
                    'tempat_kpm_tbl.id',
                    'dt.name',
                    'dt.regency',
                    'dt.sub_district',
                    'dt.village',
                    'username_supervisor',
                    'tempat_kpm_tbl.qouta',
                    'tempat_kpm_tbl.quota_lk',
                    'tempat_kpm_tbl.quota_pr'
                );


            if ($idGelombang) {
                $query->where('tempat_kpm_tbl.id_gelombang', $idGelombang);
            }
            if (in_array($sortBy, ['name']) && in_array($sortOrder, ['ASC', 'DESC'])) {
                $query->orderBy($sortBy, $sortOrder);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('dt.name', 'like', "%$search%");
                    // ->orWhere('tahun', 'like', "%$search%");
                });
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

    public function viewTempatKPM(Request $request)
    {
        $query = $request->query('x');
        // dd($query);
        return Inertia::render('Admin/pages/KPM/TempatKPM/ViewTempatKPM', ['id' => $query]);
    }

    public function getDataById($id)
    {
        try {
            $data = ModelsTempatKPM::select(
                'tempat_kpm_tbl.id',
                'md.name as nama_desa',
                'md.id as id_desa',
                'md.regency',
                'md.sub_district',
                'md.village',
                'tempat_kpm_tbl.username_supervisor',
                'tempat_kpm_tbl.qouta',
                'tempat_kpm_tbl.quota_lk',
                'tempat_kpm_tbl.quota_pr',
                'tempat_kpm_tbl.id_gelombang',
                'us.name as nama_supervisor',
                DB::raw("(select SUM(total.jumlah) as jumlah from (SELECT mt.jk AS jenis_kelamin, COUNT(*) AS jumlah FROM lamaran_kpm_tbl lkt JOIN mahasiswa_tbl mt on lkt.username_mahasiswa  = mt.nim WHERE lkt.id_tempat_kpm = 71 and lkt.status = 'accepted' GROUP BY mt.jk) as total) as terisi"),
                DB::raw("(select SUM(total.jumlah) as jumlah from (SELECT mt.jk AS jenis_kelamin, COUNT(*) AS jumlah FROM lamaran_kpm_tbl lkt JOIN mahasiswa_tbl mt on lkt.username_mahasiswa  = mt.nim WHERE lkt.id_tempat_kpm = 71 and lkt.status = 'accepted' and mt.jk = 'Pria' GROUP BY mt.jk) as total) as jumlah_pria"),
                DB::raw("(select SUM(total.jumlah) as jumlah from (SELECT mt.jk AS jenis_kelamin, COUNT(*) AS jumlah FROM lamaran_kpm_tbl lkt JOIN mahasiswa_tbl mt on lkt.username_mahasiswa  = mt.nim WHERE lkt.id_tempat_kpm = 71 and lkt.status = 'accepted' and mt.jk = 'Wanita' GROUP BY mt.jk) as total) as jumlah_wanita")
            )
                ->join('master_desa_tbl as md', 'tempat_kpm_tbl.id_desa', '=', 'md.id')
                ->leftjoin('users as us', 'tempat_kpm_tbl.username_supervisor', '=', 'us.username')
                ->where('tempat_kpm_tbl.id', $id)
                ->first();

            if (!$data) return throw new Error('Not Found', 404);

            return response()->json(['data' => $data]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'Internal server error'
            ]);
        }
    }

    public function getDataDesa(Request $request)
    {
        $search = $request->input('search');
        try {

            $data = DesaMaster::select(
                'id',
                'name'
            );

            if ($search) {
                $data->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%");
                });
            }

            $data = $data->get();


            return response()->json([
                'data' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function getSupervisor(Request $request)
    {
        $search = $request->input('search');
        try {
            $data = ModelsUser::whereIn('role', ['supervisor_kpm', 'supervisor', 'Supervisor_KPM'])->get();

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}

