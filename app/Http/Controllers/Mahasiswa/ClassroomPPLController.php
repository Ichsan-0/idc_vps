<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\ConversationClassroomPPL;
use App\Models\LamaranPPL;
use App\Models\Mahasiswa;
use App\Models\TaskPPL;
use App\Models\TaskPPLSubmission;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClassroomPPLController extends Controller
{
    public function tasks(Request $request)
    {
        $tasks = TaskPPL::all();
        $dataKelas = LamaranPPL::join('lowongan_ppl_tbl as l_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'l_ppl.id')
            ->join('sekolah_tbl as s_tbl', 'l_ppl.id_sekolah', '=', 's_tbl.id')
            ->select('s_tbl.name as nama_tempat', 's_tbl.id')
            ->where('username_mahasiswa', Auth::user()->username)
            ->where('lamaran_ppl_tbl.status', 'accepted')
            ->first();
        return Inertia::render('Mahasiswa/ClassroomPPL/Home', [
            'data' => [
                'tasks' => $tasks,
                'data_kelas' => $dataKelas
            ]
        ]);
    }

    public function detailTask(Request $request, $id_task)
    {
        $dataKelas = LamaranPPL::join('lowongan_ppl_tbl as l_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'l_ppl.id')
            ->join('sekolah_tbl as s_tbl', 'l_ppl.id_sekolah', '=', 's_tbl.id')
            ->select('s_tbl.id')
            ->where('username_mahasiswa', Auth::user()->username)
            ->where('lamaran_ppl_tbl.status', 'accepted')
            ->first();

        return Inertia::render('Mahasiswa/ClassroomPPL/DetailTask', [
            'data' => [
                'id_tugas' => $id_task,
                'id_kelas' => $dataKelas->id
            ],
            'base_url' => url('/')
        ]);
    }

    public function getTask(Request $request)
    {
        try {
            $task = TaskPPL::find($request->id_tugas);
            return response()->json([
                'success' => true,
                'data' => $task,
                'message' => "Tugas berhasil di ambil"

            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()

            ], $e->getCode());
        }
    }

    public function getSubmission(Request $request)
    {
        try {
            $submission = TaskPPLSubmission::where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('username_mahasiswa', $request->username_mahasiswa)
                ->first();
            $mahasiswa = Mahasiswa::where('nim', $request->username_mahasiswa)->first();

            if ($mahasiswa) {
                if (($mahasiswa->link_instrument_penilaian === null || $mahasiswa->nilai_pamong || null & $mahasiswa->nilai_supervisor_ppl || null) && $submission === null) {
                    // $submission['status'] = "ditugaskan";
                } else {
                    $submission['nilai_pamong'] = $mahasiswa->nilai_pamong;
                    $submission['nilai_supervisor_ppl'] = $mahasiswa->nilai_supervisor_ppl;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil data',
                'data' => $submission,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()

            ], $e->getCode());
        }
    }

    public function createSubmission(Request $request)
    {
        try {
            //eksiting submission
            $submission = TaskPPLSubmission::where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('username_mahasiswa', $request->username_mahasiswa)
                ->first();
            if ($submission) {
                $data = [
                    'link' => $request->link,
                ];
                $result = $submission->update($data);
                if ($result) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Sumission berhasil diperbaharui',

                    ], 200);
                }
            } else {
                $data = [
                    'id_kelas' => $request->id_kelas,
                    'id_tugas' => $request->id_tugas,
                    'username_mahasiswa' => $request->username_mahasiswa,
                    'status' => $request->status,
                    'link' => $request->link

                ];

                $result = TaskPPLSubmission::create($data);
                if ($result) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Sumission berhasil dibuat',

                    ], 200);
                }
            }
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()

            ], 500);
        }
    }

    public function createComment(Request $request)
    {
        try {
            $data = [
                'tipe' => $request->tipe,
                'id_tugas' => $request->id_tugas,
                'id_kelas' => $request->id_kelas,
                'created_by' => $request->created_by,
                'message' => $request->message
            ];
            $result = ConversationClassroomPPL::create($data);
            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => "Berhasil membuat komentar",
                    'data' => $result,

                ], 200);
            }
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()

            ], $e->getCode());
        }
    }

    public function getPrivateComment(Request $request)
    {
        try {
            $comment = ConversationClassroomPPL::where('tipe', 'private')
                ->when($request->id_kelas, fn($q) => $q->where('id_kelas', $request->id_kelas))
                ->when($request->id_tugas, fn($q) => $q->where('id_tugas', $request->id_tugas))
                ->leftJoin('users as us', 'conversation_classroom_ppl.receiver', '=', 'us.username')
                ->leftJoin('users as usr', 'conversation_classroom_ppl.created_by', '=', 'usr.username')
                ->where(function ($subQuery) use ($request) {
                    $subQuery->where('created_by', $request->created_by)
                        ->orWhere('receiver', $request->created_by);
                })
                ->select(
                    'us.name as receiver_by_name',
                    'usr.name as created_by_name',
                    'conversation_classroom_ppl.*'
                )
                ->orderBy('created_at', 'asc')
                ->get();

            if ($comment) {
                return response()->json([
                    'success' => true,
                    'message' => "Berhasil mengambil data komentar",
                    'data' => $comment,

                ], 200);
            }
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
