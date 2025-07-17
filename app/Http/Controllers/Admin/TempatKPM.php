<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use App\Models\TempatKPM as ModelsTempatKPM;
use App\Models\User as ModelsUser;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TempatKPM extends Controller
{
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
}
