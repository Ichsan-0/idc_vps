<?php

namespace App\Exports;

use App\Models\Task;
use Illuminate\Database\Eloquent\Casts\Json;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class NilaiKPMExport implements FromCollection, WithHeadings
{

    protected $idGelombang;

    public function __construct($idGelombang)
    {
        $this->idGelombang = $idGelombang;
        
    }

    public function collection()
    {

        $tasks = Task::orderBy('created_at', 'asc')->get();

        $query = DB::table('lamaran_kpm_tbl')
            ->join('users as us', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'us.username')
            ->join('tempat_kpm_tbl as t_kpm', 'lamaran_kpm_tbl.id_tempat_kpm', '=', 't_kpm.id')
            ->select(
                DB::raw('ROW_NUMBER() OVER (ORDER BY t_kpm.name) as number'),
                'lamaran_kpm_tbl.username_mahasiswa',
                'us.name as nama_mahasiswa',
                't_kpm.name as nama_tempat_kpm',
                DB::raw('(SELECT name FROM users WHERE users.username = t_kpm.username_supervisor) as nama_supervisor')
            )
            ->where('lamaran_kpm_tbl.status', 'accepted')
            ->where('t_kpm.id_gelombang', $this->idGelombang);

        $students = $query->get();

        // Fetch all task submissions for this gelombang in one query
        $submissions = DB::table('task_submission as ts')
            ->join('tempat_kpm_tbl as t_kpm', 'ts.id_kelas', '=', 't_kpm.id')
            ->where('t_kpm.id_gelombang', $this->idGelombang)
            ->select('ts.username_mahasiswa', 'ts.id_tugas', 'ts.score')
            ->get()
            ->groupBy('username_mahasiswa');

        // Prepare final ordered data
        $finalData = [];

        foreach ($students as $student) {
            $username = $student->username_mahasiswa;
            $studentSubmissions = $submissions->get($username) ?? collect();

            // Initialize student data with general details
            $studentData = [
                'No' => $student->number,
                'Nama' => $student->nama_mahasiswa,
                'NIM' => $student->username_mahasiswa,
                'Tempat KPM' => $student->nama_tempat_kpm,
                'Nama Supervisor' => $student->nama_supervisor,
            ];

            foreach ($tasks as $task) {
                $sub = $studentSubmissions->firstWhere('id_tugas', $task->id);
                $score = $sub ? ($sub->score ?? 0) : 0;
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
