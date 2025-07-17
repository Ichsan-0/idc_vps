<?php

namespace App\Exports;

use App\Models\Task;
use Illuminate\Database\Eloquent\Casts\Json;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class NilaiKPMExport implements FromCollection, WithHeadings
{
    public function collection()
    {

        $tasks = Task::orderBy('created_at', 'asc')->get();

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

        $students = $query->get();



        // Prepare final ordered data
        $finalData = [];

        foreach ($students as $student) {
            $username = $student->username_mahasiswa;

            // Fetch scores for this student
            $taskScores = DB::table('task as t')
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

            // Initialize student data with general details
            $studentData = [
                'No' => $student->number,
                'Nama' => $student->nama_mahasiswa,
                'NIM' => $student->username_mahasiswa,
                'Tempat KPM' => $student->nama_tempat_kpm,
                'Nama Supervisor' => $student->nama_supervisor,
            ];


            foreach ($tasks as $task) {
                $score = $taskScores->firstWhere('id_tugas', $task->id)->score ?? 0;
                $studentData[$task->name] = $score;
            }

            $finalData[] = $studentData;
        }

        return collect($finalData);
    }
    public function headings(): array
    {


        $tasks = Task::orderBy('created_at', 'asc')->get();


        $header = ['No', 'Nama', 'NIM', 'Tempat KPM', 'Nama Supervisor'];
        foreach ($tasks as $t) {
            array_push($header, $t->name);
        }


        return $header;
    }
}
