<?php

namespace App\Http\Controllers\SupervisorKPM;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Sekolah;
use App\Models\Task;
use App\Models\TempatKPM;
use App\Models\TempatPPL;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Laravel\Prompts\select;

class ClassroomController extends Controller
{
    public function index()
    {

        $kelas = TempatKPM::where('username_supervisor', Auth::user()->username)->get();
        $kelas_ppl = Sekolah::where('username_supervisor', Auth::user()->username)->get();

        return Inertia::render(
            'SupervisorKPM/Classroom/Home',
            ['kelas' => $kelas, 'kelas_ppl' => $kelas_ppl]
        );
    }

    public function getPrivateComment(Request $request)
    {

        $data = [];

        try {
            $supervisor = DB::table('comment')
                ->join('users as us', 'comment.created_by', '=', 'us.username')
                ->where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('receiver', $request->username_mahasiswa)
                ->select(
                    'us.name as sender_name',
                    'comment.message',
                    'comment.id as id_comment',
                    'comment.created_at'
                );

            $mahasiswa = DB::table('comment')
                ->join('users as us', 'comment.created_by', '=', 'us.username')
                ->where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('created_by', $request->username_mahasiswa)
                ->select(
                    'us.name as sender_name',
                    'comment.message',
                    'comment.id as id_comment',
                    'comment.created_at'
                );

            $comments = collect($supervisor->union($mahasiswa)->get())->sortBy('created_at')->values();


            $data['success'] = true;
            $data['data'] = $comments;

            return response()->json($data);
        } catch (Exception $e) {
            $data['success'] = false;
            $data['message'] = $e->getMessage();
            return response()->json($data);
        }





        return response()->json($supervisor);
    }

    public function viewTask($id)
    {

        return Inertia::render('SupervisorKPM/Classroom/ViewKelas', [
            'base_url' => url('/'),
            'data' => [
                'id_kelas' => $id
            ]
        ]);
    }

    public function detail($id_kelas, $id_tugas)
    {
        return Inertia::render('SupervisorKPM/Classroom/DetailTask', [
            'base_url' => url('/'),
            'data' => [
                'id_kelas' => $id_kelas,
                'id_tugas' => $id_tugas
            ]
        ]);
    }

    public function tugasMahasiswa($id_kelas, $id_tugas)
    {
        return Inertia::render('SupervisorKPM/Classroom/TugasMahasiswa', [
            'base_url' => url('/'),
            'data' => [
                'id_kelas' => $id_kelas,
                'id_tugas' => $id_tugas
            ]
        ]);
    }
}
