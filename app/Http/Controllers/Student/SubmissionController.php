<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task_submission;
use App\Http\Resources\SubmissionResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class SubmissionController extends Controller
{

    public function createTaskSubmissions(Request $request)
    {
        try {
            DB::beginTransaction();

            $data = [
                'username_mahasiswa' => $request->username_mahasiswa,
                'id_kelas' => $request->id_kelas,
                'id_tugas' => $request->id_tugas,
                'status' => $request->status,

            ];

            if ($request->hasFile('link')) {
                $file = $request->file('link');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('public/submissions', $filename);
                $data['link'] = $path;
            } else {
                $data['link'] = $request->link;
            }

            // Debugging sebelum menyimpan ke database
            Log::info('Data akan disimpan:', $data);

            $submission = Task_submission::create($data);
            DB::commit();

            return new SubmissionResource(true, 'Tugas berhasil dikumpulkan', $submission);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Terjadi error saat menyimpan submission: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function editTaskSubmissions(Request $request)
    {
        try {
            DB::beginTransaction();

            // Cari submission berdasarkan id_kelas, id_tugas, dan username_mahasiswa
            $submission = Task_submission::where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('username_mahasiswa', $request->username_mahasiswa)
                ->first();

            if (!$submission) {
                return new SubmissionResource(false, 'Submission tidak ditemukan', 404);
            }

            // Update data submission
            $submission->status = $request->status ?? $submission->status;

            // Jika ada file baru, ganti file lama
            if ($request->hasFile('link')) {
                $file = $request->file('link');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('public/submissions', $filename);

                // Hapus file lama jika ada
                if ($submission->link) {
                    Storage::delete($submission->link);
                }

                $submission->link = $path;
            } else {
                $submission->link = $request->link;
            }

            // Simpan perubahan
            $submission->save();

            DB::commit();

            return new SubmissionResource(true, 'Tugas berhasil diperbarui', $submission);
        } catch (\Exception $e) {
            DB::rollBack();
            return new SubmissionResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function deleteTaskSubmissions(Request $request)
    {
        try {
            DB::beginTransaction();

            // Cari submission berdasarkan id_kelas, id_tugas, dan username_mahasiswa
            $submission = Task_submission::where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('username_mahasiswa', $request->username_mahasiswa)
                ->first();

            if (!$submission) {
                return new SubmissionResource(false, 'Submission tidak ditemukan', 404);
            }

            // Hapus file terkait jika ada
            if ($submission->link) {
                Storage::delete($submission->link);
            }

            // Hapus submission dari database
            $submission->delete();

            DB::commit();

            return new SubmissionResource(true, 'Tugas berhasil dihapus', null);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Terjadi error saat menghapus submission: ' . $e->getMessage());
            return new SubmissionResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function getTaskSubmissions(Request $request)
    {
        try {
            // Query untuk mendapatkan data submissions
            $submissions = Task_submission::where('id_kelas', $request->id_kelas)
                ->where('id_tugas', $request->id_tugas)
                ->where('username_mahasiswa', $request->username_mahasiswa)
                ->first();



            if ($submissions) {
                return new SubmissionResource(true, 'Data submissions berhasil diambil', $submissions);
            } else {
                $submissions['status'] = 'ditugaskan';
                return new SubmissionResource(true, 'Data submissions berhasil diambil', $submissions);
            }
        } catch (\Exception $e) {
            Log::error('Terjadi error saat mengambil submissions: ' . $e->getMessage());
            return new SubmissionResource(false, $e->getMessage(), $e->getCode());
        }
    }

    public function update_nilai(Request $request)
    {
        return response()->json('update nilai');
    }
}
