<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ExportNilaiPPL;
use App\Exports\NilaiKPMExport;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ClassroomController extends Controller
{
    public function tugas()
    {
        return Inertia::render('Admin/pages/ClassroomKPM/Tugas/List', [
            'base_url' => url('/')
        ]);
    }

    public function tugas_add()
    {
        return Inertia::render('Admin/pages/ClassroomKPM/Tugas/Add', ['base_url' => url('/')]);
    }

    public function tugas_edit($id)
    {
        return Inertia::render('Admin/pages/ClassroomKPM/Tugas/Edit', [
            'id' => $id,
            'base_url' => url('/')
        ]);
    }

    public function studentScore()
    {
        return Inertia::render('Admin/pages/ClassroomKPM/Tugas/ListNilaiMahasiswa', [
            'base_url' => url('/')
        ]);
    }

    public function queryNilai(Request $request)
    {
        $search = $request->search; // Ambil keyword pencarian

        // Buat query utama dengan ROW_NUMBER()
        $query = DB::table(DB::raw('( 
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY t_kpm.name) AS number, 
                    lamaran_kpm_tbl.username_mahasiswa, 
                    us.name AS nama_mahasiswa, 
                    t_kpm.name AS nama_tempat_kpm,
                    (SELECT name FROM users WHERE users.username = t_kpm.username_supervisor) as nama_supervisor 
                FROM lamaran_kpm_tbl
                JOIN users AS us ON lamaran_kpm_tbl.username_mahasiswa = us.username
                JOIN tempat_kpm_tbl AS t_kpm ON lamaran_kpm_tbl.id_tempat_kpm = t_kpm.id
                WHERE lamaran_kpm_tbl.status = "accepted"
            ) as numbered_data'));

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('numbered_data.username_mahasiswa', 'LIKE', "%$search%")
                    ->orWhere('numbered_data.nama_mahasiswa', 'LIKE', "%$search%")
                    ->orWhere('numbered_data.nama_tempat_kpm', 'LIKE', "%$search%");
            });
        }

        $mahasiswaPaginated = $query->paginate(10);

        $data = $mahasiswaPaginated->items();

        $taskHeaders = DB::table('task')
            ->select('id as id_tugas', 'name as nama_tugas')
            ->orderBy('created_at', 'asc')
            ->get();

        foreach ($data as &$mahasiswa) {
            $username = $mahasiswa->username_mahasiswa;

            $tasks = DB::table('task as t')
                ->leftJoin('task_submission as ts', function ($join) use ($username) {
                    $join->on('t.id', '=', 'ts.id_tugas')
                        ->where('ts.username_mahasiswa', '=', $username);
                })
                ->select(
                    't.id as id_tugas',
                    't.name as nama_tugas',
                    DB::raw('COALESCE(ts.score, 0) as score')
                )
                ->orderBy('t.created_at', 'asc')
                ->get();

            $mahasiswa->tasks = $tasks;
        }


        return response()->json([
            'current_page' => $mahasiswaPaginated->currentPage(),
            'headers' => $taskHeaders,
            'data' => $data,
            'last_page' => $mahasiswaPaginated->lastPage(),
            'next_page_url' => $mahasiswaPaginated->nextPageUrl(),
            'prev_page_url' => $mahasiswaPaginated->previousPageUrl(),
            'total' => $mahasiswaPaginated->total(),
            'to' => min($mahasiswaPaginated->currentPage() * 10, $mahasiswaPaginated->total()),

        ]);
    }
    public function nilaiPPL()
    {
        return Inertia::render('Admin/pages/ClassroomKPM/Tugas/ListNilaiMahasiswaPPL', [
            'base_url' => url('/')
        ]);
    }

    public function exportNilaiKPM()
    {



        return Excel::download(new NilaiKPMExport, 'nilai kpm.xlsx');;
    }

    public function exportStudentsScorePPL()
    {
        date_default_timezone_set('Asia/Jakarta');

        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $filename = "Nilai_PPL_{$timestamp}.xlsx";

        return Excel::download(new ExportNilaiPPL, $filename);
    }

    public function getStudentsScore(Request $request)
    {
        try {
            $search = $request->search;
            $query = DB::table(DB::raw("(
                SELECT 
                ROW_NUMBER() OVER (
                ORDER BY s_tbl.name) AS row_index,
                    us.name AS nama_mahasiswa,
                    us.username AS nim,
                    s_tbl.name AS nama_sekolah,
                    (
                SELECT us1.name
                FROM users us1
                WHERE us1.username = s_tbl.username_supervisor
                LIMIT 1) AS nama_supervisor,
                    m_tbl.nilai_pamong,
                    m_tbl.nilai_supervisor_ppl,
                    m_tbl.link_instrument_penilaian,
                    (
                SELECT link
                FROM task_ppl_submission t_ppl
                WHERE t_ppl.username_mahasiswa = m_tbl.nim LIMIT 1) AS link_laporan
                FROM lamaran_ppl_tbl AS l_ppl
                JOIN mahasiswa_tbl AS m_tbl ON l_ppl.username_mahasiswa = m_tbl.nim
                JOIN users AS us ON l_ppl.username_mahasiswa = us.username
                JOIN lowongan_ppl_tbl AS lw_ppl ON l_ppl.id_lowongan_ppl = lw_ppl.id
                JOIN sekolah_tbl AS s_tbl ON lw_ppl.id_sekolah = s_tbl.id
                WHERE l_ppl.status = 'accepted'
            ) as numbered_data"));

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('numbered_data.nim', 'LIKE', "%$search%")
                        ->orWhere('numbered_data.nama_mahasiswa', 'LIKE', "%$search%")
                        ->orWhere('numbered_data.nama_sekolah', 'LIKE', "%$search%")
                        ->orWhere('numbered_data.nama_supervisor', 'LIKE', "%$search%");
                });
            }
            $data = $query->paginate(10);
            return response()->json([
                'success' => false,
                'message' => "Successfully get data",
                'data' => $data
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
