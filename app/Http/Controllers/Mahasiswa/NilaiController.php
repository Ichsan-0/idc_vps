<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Bimbingan;
use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use App\Models\Mahasiswa;
use App\Models\Task;
use App\Models\Task_submission;
use App\Models\TaskPPL;
use App\Models\TaskPPLSubmission;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NilaiController extends Controller
{
    public function index(Request $request)
    {
        $token = $request->session()->get('access_token');

        return Inertia::render('Mahasiswa/Nilai', [
            'access_token' => $token,
        ]);
    }

    public function getNilai(Request $request)
    {
        try {
            $user = Auth::user();
            $nim = $user && $user->role === 'user'
                ? $user->username
                : $request->input('nim');

            if (!$nim) {
                throw new Exception('NIM wajib diisi.', 400);
            }

            $mahasiswa = Mahasiswa::where('nim', $nim)->first();

            if (!$mahasiswa) {
                throw new Exception('Data mahasiswa tidak ditemukan.', 404);
            }

            $cluster = strtoupper(trim((string) $mahasiswa->cluster_kegiatan));
            $needsKpm = str_contains($cluster, 'KPM');
            $needsPpl = str_contains($cluster, 'PPL');

            if (!$needsKpm && !$needsPpl) {
                $needsKpm = LamaranKPM::where('username_mahasiswa', $nim)
                    ->where('status', 'accepted')
                    ->exists();
                $needsPpl = LamaranPPL::where('username_mahasiswa', $nim)
                    ->where('status', 'accepted')
                    ->exists();

                if ($needsKpm && $needsPpl) {
                    $cluster = 'PPKPM';
                } elseif ($needsKpm) {
                    $cluster = 'KPM';
                } elseif ($needsPpl) {
                    $cluster = 'PPL';
                }
            }

            $eligibility = $this->buildEligibility(
                $nim,
                $mahasiswa,
                $needsKpm,
                $needsPpl,
                $cluster
            );

            $data = [
                'message' => $eligibility['eligible']
                    ? 'Berhasil memperoleh data mahasiswa'
                    : 'Syarat nilai belum terpenuhi',
                'mahasiswa' => null,
                'eligibility' => $eligibility,
            ];

            if ($eligibility['eligible']) {
                $nilai = DB::table('nilai_ppkpm_view')
                    ->where('nim', $nim)
                    ->first();

                if ($nilai) {
                    $certificateSetting = DB::table('sertifikat_tbl')
                        ->where('id_gelombang', $nilai->id_gelombang_tertinggi)
                        ->first();

                    if ($certificateSetting === null) {
                        $certificateSetting = (object) [
                            'open_print_certificate' => 0,
                        ];
                    }

                    $data['mahasiswa'] = array_merge(
                        (array) $nilai,
                        (array) $certificateSetting
                    );
                } else {
                    $eligibility['eligible'] = false;
                    $eligibility['missing'][] = 'Nilai akhir belum tersedia. Silakan hubungi admin.';
                    $data['eligibility'] = $eligibility;
                    $data['message'] = 'Nilai akhir belum tersedia';
                }
            }

            return response()->json(['data' => $data], 200);
        } catch (Exception $exception) {
            $status = $exception->getCode();
            if ($status < 400 || $status > 599) {
                $status = 500;
            }

            return response()->json([
                'data' => [
                    'message' => $exception->getMessage(),
                    'mahasiswa' => null,
                ],
            ], $status);
        }
    }

    private function buildEligibility(
        string $nim,
        Mahasiswa $mahasiswa,
        bool $needsKpm,
        bool $needsPpl,
        string $cluster
    ): array {
        $requirements = [];
        $missing = [];

        $kpmClass = $needsKpm ? $this->latestKpmClass($nim) : null;
        $pplClass = $needsPpl ? $this->latestPplClass($nim) : null;

        $kpm = [
            'id_kelas' => $kpmClass?->id_kelas,
            'total_tugas' => 0,
            'tugas_diserahkan' => 0,
            'tugas_dinilai' => 0,
            'bimbingan_diajukan' => 0,
            'bimbingan_disetujui' => 0,
            'bimbingan_wajib' => 4,
            'met' => !$needsKpm,
        ];

        $ppl = [
            'id_kelas' => $pplClass?->id_kelas,
            'total_tugas' => 0,
            'tugas_diserahkan' => 0,
            'nilai_terisi' => 0,
            'nilai_wajib' => 2,
            'bimbingan_diajukan' => 0,
            'bimbingan_disetujui' => 0,
            'bimbingan_wajib' => 4,
            'met' => !$needsPpl,
        ];

        if ($needsKpm) {
            $taskIds = Task::orderBy('id')->pluck('id');
            $totalTasks = $taskIds->count();

            $submissions = $kpmClass
                ? Task_submission::where('username_mahasiswa', $nim)
                    ->where('id_kelas', $kpmClass->id_kelas)
                    ->get()
                    ->keyBy('id_tugas')
                : collect();

            $submitted = $taskIds->filter(function ($taskId) use ($submissions) {
                $submission = $submissions->get($taskId);

                return $submission
                    && in_array($submission->status, ['diserahkan', 'dinilai'], true);
            })->count();

            $scored = $taskIds->filter(function ($taskId) use ($submissions) {
                $submission = $submissions->get($taskId);

                return $submission && $submission->score !== null;
            })->count();

            $bimbingan = $kpmClass
                ? Bimbingan::where('username_mahasiswa', $nim)
                    ->where('tipe', 'kpm')
                    ->where('id_kelas', $kpmClass->id_kelas)
                    ->where('status', 'approved')
                    ->count()
                : 0;

            $bimbinganSubmitted = $kpmClass
                ? Bimbingan::where('username_mahasiswa', $nim)
                    ->where('tipe', 'kpm')
                    ->where('id_kelas', $kpmClass->id_kelas)
                    ->count()
                : 0;

            $tasksCompleted = $kpmClass !== null
                && ($totalTasks === 0 || $submitted >= $totalTasks);
            $scoresCompleted = $kpmClass !== null
                && ($totalTasks === 0 || $scored >= $totalTasks);
            $bimbinganCompleted = $kpmClass !== null && $bimbingan >= 4;

            $kpm = [
                'id_kelas' => $kpmClass?->id_kelas,
                'total_tugas' => $totalTasks,
                'tugas_diserahkan' => $submitted,
                'tugas_dinilai' => $scored,
                'bimbingan_diajukan' => $bimbinganSubmitted,
                'bimbingan_disetujui' => $bimbingan,
                'bimbingan_wajib' => 4,
                'met' => $tasksCompleted && $scoresCompleted && $bimbinganCompleted,
            ];

            if (!$kpmClass) {
                $missing[] = 'Data kelas KPM belum ditemukan.';
            }

            $requirements[] = [
                'key' => 'kpm_tasks',
                'kind' => 'tasks',
                'cluster' => 'KPM',
                'label' => 'Menyelesaikan seluruh tugas KPM',
                'completed' => $submitted,
                'required' => $totalTasks,
                'met' => $tasksCompleted,
                'hint' => 'Buka Classroom KPM dan kumpulkan semua tugas yang tersedia.',
            ];

            $requirements[] = [
                'key' => 'kpm_scores',
                'kind' => 'scores',
                'cluster' => 'KPM',
                'label' => 'Mendapatkan nilai seluruh tugas KPM',
                'completed' => $scored,
                'required' => $totalTasks,
                'met' => $scoresCompleted,
                'hint' => 'Nilai diberikan oleh dosen supervisor KPM setelah tugas dinilai.',
            ];

            $requirements[] = [
                'key' => 'kpm_bimbingan',
                'kind' => 'bimbingan',
                'cluster' => 'KPM',
                'label' => 'Bimbingan KPM disetujui supervisor',
                'completed' => $bimbingan,
                'submitted' => $bimbinganSubmitted,
                'required' => 4,
                'met' => $bimbinganCompleted,
                'hint' => 'Isi bimbingan dan tunggu validasi supervisor minimal 4 kali.',
            ];
        }

        if ($needsPpl) {
            $taskIds = TaskPPL::orderBy('id')->pluck('id');
            $totalTasks = $taskIds->count();

            $submissions = $pplClass
                ? TaskPPLSubmission::where('username_mahasiswa', $nim)
                    ->where('id_kelas', $pplClass->id_kelas)
                    ->get()
                    ->keyBy('id_tugas')
                : collect();

            $submitted = $taskIds->filter(function ($taskId) use ($submissions) {
                $submission = $submissions->get($taskId);

                return $submission
                    && in_array($submission->status, ['diserahkan', 'dinilai'], true);
            })->count();

            $scoreFilled = (int) ($mahasiswa->nilai_pamong !== null)
                + (int) ($mahasiswa->nilai_supervisor_ppl !== null);

            $bimbingan = $pplClass
                ? Bimbingan::where('username_mahasiswa', $nim)
                    ->where('tipe', 'ppl')
                    ->where('id_kelas', $pplClass->id_kelas)
                    ->where('status', 'approved')
                    ->count()
                : 0;

            $bimbinganSubmitted = $pplClass
                ? Bimbingan::where('username_mahasiswa', $nim)
                    ->where('tipe', 'ppl')
                    ->where('id_kelas', $pplClass->id_kelas)
                    ->count()
                : 0;

            $tasksCompleted = $pplClass !== null
                && ($totalTasks === 0 || $submitted >= $totalTasks);
            $scoresCompleted = $pplClass !== null && $scoreFilled >= 2;
            $bimbinganCompleted = $pplClass !== null && $bimbingan >= 4;

            $ppl = [
                'id_kelas' => $pplClass?->id_kelas,
                'total_tugas' => $totalTasks,
                'tugas_diserahkan' => $submitted,
                'nilai_terisi' => $scoreFilled,
                'nilai_wajib' => 2,
                'bimbingan_diajukan' => $bimbinganSubmitted,
                'bimbingan_disetujui' => $bimbingan,
                'bimbingan_wajib' => 4,
                'met' => $tasksCompleted && $scoresCompleted && $bimbinganCompleted,
            ];

            if (!$pplClass) {
                $missing[] = 'Data kelas PPL belum ditemukan.';
            }

            $requirements[] = [
                'key' => 'ppl_tasks',
                'kind' => 'tasks',
                'cluster' => 'PPL',
                'label' => 'Menyelesaikan seluruh tugas PPL',
                'completed' => $submitted,
                'required' => $totalTasks,
                'met' => $tasksCompleted,
                'hint' => 'Buka Classroom PPL dan kumpulkan semua tugas yang tersedia.',
            ];

            $requirements[] = [
                'key' => 'ppl_scores',
                'kind' => 'scores',
                'cluster' => 'PPL',
                'label' => 'Nilai Pamong dan Supervisor PPL tersedia',
                'completed' => $scoreFilled,
                'required' => 2,
                'met' => $scoresCompleted,
                'hint' => 'Nilai diisi oleh dosen supervisor berdasarkan penilaian pamong.',
            ];

            $requirements[] = [
                'key' => 'ppl_bimbingan',
                'kind' => 'bimbingan',
                'cluster' => 'PPL',
                'label' => 'Bimbingan PPL disetujui supervisor',
                'completed' => $bimbingan,
                'submitted' => $bimbinganSubmitted,
                'required' => 4,
                'met' => $bimbinganCompleted,
                'hint' => 'Isi bimbingan dan tunggu validasi supervisor minimal 4 kali.',
            ];
        }

        foreach ($requirements as $requirement) {
            if (!$requirement['met']) {
                $completed = $requirement['completed'];
                $required = $requirement['required'];

                $missing[] = $required > 0
                    ? "{$requirement['label']} ({$completed}/{$required})"
                    : $requirement['label'];
            }
        }

        if (!$needsKpm && !$needsPpl) {
            $missing[] = 'Cluster kegiatan belum ditentukan pada profil Anda.';
        }

        $eligible = ($needsKpm || $needsPpl)
            && (!$needsKpm || $kpm['met'])
            && (!$needsPpl || $ppl['met']);

        return [
            'eligible' => $eligible,
            'cluster' => $cluster ?: '-',
            'needs_kpm' => $needsKpm,
            'needs_ppl' => $needsPpl,
            'requirements' => $requirements,
            'missing' => $missing,
            'tasks' => ['kpm' => $kpm, 'ppl' => $ppl],
            'classes' => [
                'kpm' => $kpmClass?->id_kelas,
                'ppl' => $pplClass?->id_kelas,
            ],
        ];
    }

    private function latestKpmClass(string $nim)
    {
        return LamaranKPM::where('username_mahasiswa', $nim)
            ->where('lamaran_kpm_tbl.status', 'accepted')
            ->join('tempat_kpm_tbl as t', 'lamaran_kpm_tbl.id_tempat_kpm', '=', 't.id')
            ->select(
                'lamaran_kpm_tbl.id_tempat_kpm as id_kelas',
                't.id_gelombang'
            )
            ->orderByDesc('t.id_gelombang')
            ->orderByDesc('lamaran_kpm_tbl.id')
            ->first();
    }

    private function latestPplClass(string $nim)
    {
        return LamaranPPL::where('username_mahasiswa', $nim)
            ->where('lamaran_ppl_tbl.status', 'accepted')
            ->join('lowongan_ppl_tbl as l', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'l.id')
            ->join('sekolah_tbl as s', 'l.id_sekolah', '=', 's.id')
            ->select(
                's.id as id_kelas',
                's.id_gelombang'
            )
            ->orderByDesc('s.id_gelombang')
            ->orderByDesc('lamaran_ppl_tbl.id')
            ->first();
    }
}
