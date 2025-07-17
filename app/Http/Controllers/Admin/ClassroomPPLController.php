<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConversationClassroomPPL;
use App\Models\LamaranPPL;
use App\Models\Mahasiswa;
use App\Models\Sekolah;
use App\Models\TaskPPLSubmission;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use function Laravel\Prompts\select;

class ClassroomPPLController extends Controller
{
    public function index($id)
    {


        return Inertia::render('SupervisorKPM/PenilaianPPL/ListMahasiswa', [
            'data' => ['id_sekolah' => $id,],
            'base_url' => url('/')
        ]);
    }

    public function list_mahasiswa(Request $request)
    {

        try {
            $data = LamaranPPL::join('lowongan_ppl_tbl as l_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'l_ppl.id')
                ->join('users as us', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'us.username')
                ->join('mahasiswa_tbl as m_tbl', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'm_tbl.nim')
                ->join('prodi_tbl as p_tbl', 'm_tbl.id_prodi', '=', 'p_tbl.id')
                ->join('sekolah_tbl as s_tbl', 'l_ppl.id_sekolah', '=', 's_tbl.id')
                ->selectRaw(
                    'ROW_NUMBER() OVER (ORDER BY lamaran_ppl_tbl.username_mahasiswa) AS number,
                    us.name as nama_mahasiswa,
                    lamaran_ppl_tbl.username_mahasiswa as nim,
                    p_tbl.name as nama_prodi,
                    s_tbl.name as nama_sekolah,
                    m_tbl.nilai_supervisor_ppl,
                    m_tbl.nilai_pamong,
                    CASE WHEN m_tbl.nilai_supervisor_ppl IS NULL AND nilai_pamong IS NULL AND link_instrument_penilaian IS NULL THEN "Belum Dinilai" ELSE "Sudah Dinilai" END AS status
                    '
                )
                ->where('lamaran_ppl_tbl.status', 'accepted')
                ->where('l_ppl.id_sekolah', $request->id_sekolah)
                ->get();
            return response()->json(
                ['success' => true, 'data' => $data]
            );
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function detailTugasMahasiswa($id_sekolah, $nim)
    {
        $check = Sekolah::where('id', $id_sekolah)->where('username_supervisor', Auth::user()->username)->first();
        if ($check) {
            $mahasiswa = Mahasiswa::join('users as us', 'mahasiswa_tbl.nim', '=', 'us.username')
                ->join('prodi_tbl as p_tbl', 'mahasiswa_tbl.id_prodi', '=', 'p_tbl.id')
                ->select(
                    'us.name as nama_mahasiswa',
                    'mahasiswa_tbl.nim as nim',
                    'p_tbl.name as nama_prodi',
                    'mahasiswa_tbl.link_instrument_penilaian',
                    'mahasiswa_tbl.nilai_pamong',
                    'mahasiswa_tbl.nilai_supervisor_ppl'
                )
                ->where('nim', $nim)->first();
            $link_laporan = TaskPPLSubmission::where('username_mahasiswa', $nim)->where('id_kelas', $id_sekolah)->select('link')->first();

            $mahasiswa['link_laporan'] = $link_laporan ? $link_laporan->link : null;
            return Inertia::render('SupervisorKPM/PenilaianPPL/DetailMahasiswa', [
                'data' => ['id_sekolah' => $id_sekolah, 'data_mahasiswa' => $mahasiswa],
                'base_url' => url('/')
            ]);
        } else {
            return redirect('/supervisor/classroom/home');
        }
    }

    public function updateNilai(Request $request, $nim)
    {

        try {
            DB::beginTransaction();
            $mahasiswa = Mahasiswa::where('nim', $nim)->first();
            $data = [
                'nilai_pamong' => $request->nilai_pamong,
                'nilai_supervisor_ppl' => $request->nilai_supervisor_ppl
            ];

            $submission = TaskPPLSubmission::where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('username_mahasiswa', $request->username_mahasiswa)
                ->first();
            if ($mahasiswa) {
                if ($request->hasFile('instrument')) {
                    $file = $request->file('instrument');
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('public/instrument_ppl', $filename);
                    $data['link_instrument_penilaian'] = $path;
                    if ($mahasiswa->link_instrument_penilaian) {
                        Storage::delete($mahasiswa->link_instrument_penilaian);
                    }
                    $mahasiswa->update($data);
                    $submission->update(['status' => 'dinilai']);
                    DB::commit();
                    return response()->json([
                        'success' => true,
                        'message' => "Berhasil memperbaharui data mahasiswa",

                    ], 200);
                } else {
                    throw new Exception('Instrument wajib diunggah', 400);
                    DB::rollBack();
                }
            } else {
                throw new Exception('Mahasiswa tidak ditemukan', 404);
                DB::rollBack();
            }
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function supervisorMakePrivateComment(Request $request)
    {
        try {
            DB::beginTransaction();
            $data = [
                'tipe' => $request->tipe,
                'id_tugas' => $request->id_tugas,
                'id_kelas' => $request->id_kelas,
                'created_by' => $request->created_by,
                'receiver' => $request->receiver,
                'message' => $request->message
            ];

            ConversationClassroomPPL::create($data);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Berhasil menambahkan komentar',
                'data' => $data,
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function supervisorGetPrivateComment(Request $request)
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
