<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use function Laravel\Prompts\select;

class ClassroomController extends Controller
{
    public function home()
    {
        $classroom_kpm = LamaranKPM::join('tempat_kpm_tbl as t_kpm', 'lamaran_kpm_tbl.id_tempat_kpm', '=', 't_kpm.id')
            ->select('t_kpm.name as nama_tempat', 't_kpm.id')
            ->where('username_mahasiswa', Auth::user()->username)
            ->where('status', 'accepted')
            ->first();
        $classroom_ppl = LamaranPPL::join('lowongan_ppl_tbl as l_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'l_ppl.id')
            ->join('sekolah_tbl as s_tbl', 'l_ppl.id_sekolah', '=', 's_tbl.id')
            ->select('s_tbl.name as nama_tempat', 's_tbl.id')
            ->where('username_mahasiswa', Auth::user()->username)
            ->where('lamaran_ppl_tbl.status', 'accepted')
            ->first();


        return Inertia::render(
            'Mahasiswa/ClassroomKPM',
            [
                'data' => [
                    'classroom_kpm' => $classroom_kpm,
                    'classroom_ppl' => $classroom_ppl
                ]
            ]

        );
    }

    public function tasks($id)
    {

        $data_kelas = LamaranKPM::where('username_mahasiswa', Auth::user()->username)->where('status', 'accepted')->first();
        // dd($data_kelas);
        if ($data_kelas->id_tempat_kpm == $id) {


            return Inertia::render('Mahasiswa/Classroom/Home', [
                'base_url' => url('/'),
                'id' => $id
            ]);
        }
        return redirect('/classroom');
    }

    public function detail_tugas(Request $request, $id_kelas, $id_tugas)
    {
        $data_kelas = LamaranKPM::where('username_mahasiswa', Auth::user()->username)->where('status', 'accepted')->first();

        if ($data_kelas->id_tempat_kpm == $id_kelas) {

            return Inertia::render('Mahasiswa/Classroom/DetailTask', [
                'base_url' => url('/'),
                'data' => [
                    'id_kelas' => $id_kelas,
                    'id_tugas' => $id_tugas
                ]
            ]);
        }
        return redirect('/classroom');
    }
}
