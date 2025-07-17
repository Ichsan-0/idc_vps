<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use App\Models\User as ModelsUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MahasiswaPPKPMController extends Controller
{
    public function all()
    {
        $mahasiswa = ModelsUser::where('role', 'user')
            ->join('mahasiswa_tbl as m_d', 'users.username', '=', 'm_d.nim')
            ->leftJoinSub(
                DB::table('lamaran_ppl_tbl as l_ppl')
                    ->select('l_ppl.username_mahasiswa', 'l_ppl.id_lowongan_ppl', 'l_ppl.status')
                    ->where('l_ppl.status', '=', 'accepted')
                    ->unionAll(
                        DB::table('lamaran_ppl_tbl as l_ppl_alt')
                            ->select('l_ppl_alt.username_mahasiswa', 'l_ppl_alt.id_lowongan_ppl', DB::raw("'not_accepted' as status"))
                            ->whereNotIn('l_ppl_alt.username_mahasiswa', function ($query) {
                                $query->select('username_mahasiswa')
                                    ->from('lamaran_ppl_tbl')
                                    ->where('status', '=', 'accepted');
                            })
                            ->limit(1) // Batasi hanya satu record
                    ),
                'lamaran',
                'users.username',
                '=',
                'lamaran.username_mahasiswa'
            )
            ->leftJoinSub(
                DB::table('lamaran_kpm_tbl as l_kpm')
                    ->select('l_kpm.username_mahasiswa', 'l_kpm.id_tempat_kpm', 'l_kpm.status',)
                    ->where('l_kpm.status', '=', 'accepted')
                    ->unionAll(
                        DB::table('lamaran_kpm_tbl as l_kpm_alt')
                            ->select('l_kpm_alt.username_mahasiswa', 'l_kpm_alt.id_tempat_kpm', DB::raw("'not_accepted' as status"))
                            ->whereNotIn('l_kpm_alt.username_mahasiswa', function ($query) {
                                $query->select('username_mahasiswa')
                                    ->from('lamaran_kpm_tbl')
                                    ->where('status', '=', 'accepted');
                            })
                            ->limit(1)
                    ),
                'lamaran_kpm',
                'users.username',
                '=',
                'lamaran_kpm.username_mahasiswa'
            )
            ->leftJoin('lowongan_ppl_tbl as lw_ppl', 'lamaran.id_lowongan_ppl', '=', 'lw_ppl.id')
            ->leftJoin('sekolah_tbl as s_d', 'lw_ppl.id_sekolah', '=', 's_d.id')
            ->leftJoin('tempat_kpm_tbl as t_kpm', 'lamaran_kpm.id_tempat_kpm', '=', 't_kpm.id')
            ->join('prodi_tbl as p_d', 'm_d.id_prodi', '=', 'p_d.id')
            ->where('m_d.status', 'accepted')
            ->select(
                'users.name',
                'users.username as nim',
                'm_d.jk',
                'm_d.no_hp_wa',
                'p_d.name as nama_prodi',

                'm_d.cluster_kegiatan',
                DB::raw("CASE WHEN lamaran.status <> 'accepted' THEN NULL ELSE s_d.name END as nama_sekolah"),
                DB::raw("CASE WHEN lamaran_kpm.status <> 'accepted' THEN NULL ELSE t_kpm.name END as nama_tempat_kpm"),
                DB::raw("CASE WHEN lamaran_kpm.status <> 'accepted' THEN NULL ELSE JSON_OBJECT('regency', t_kpm.regency, 'sub_district', t_kpm.sub_district) END AS location"),
                DB::raw("CASE WHEN lamaran.status <> 'accepted' THEN NULL ELSE JSON_OBJECT('regency', s_d.regency, 'sub_district', s_d.sub_district) END AS lokasi_sekolah")

            )
            ->get();
        $mahasiswa->transform(function ($item) {
            $item->location = json_decode($item->location);
            $item->lokasi_sekolah = json_decode($item->lokasi_sekolah);

            return $item;
        });


        return Inertia::render('Admin/pages/Data/PPKPM/ListMahasiswaPPKPM', [
            'mahasiswa' => $mahasiswa
        ]);
    }
}
