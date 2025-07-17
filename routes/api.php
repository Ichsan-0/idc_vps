<?php

use App\Http\Controllers\Admin\AdminKecamatanController;
use App\Http\Controllers\Admin\AdminSekolahController;
use App\Http\Controllers\Admin\CamatKeuchikController;
use App\Http\Controllers\Admin\ClassroomController as AdminClassroomController;
use App\Http\Controllers\Admin\ClassroomPPLController;
use App\Http\Controllers\Admin\KepsekkPamongController;
use App\Http\Controllers\Admin\LowonganPPLController;
use App\Http\Controllers\Admin\ProdiController;
use App\Http\Controllers\LowonganKPMApiController;
use App\Http\Controllers\LowonganKPMController;
use App\Http\Controllers\LowonganPPLApiController;
use App\Http\Controllers\OperatorKecamatan\OperatorKecamatanController;
use App\Http\Controllers\OperatorSekolah\OpratorSekolahController;
use App\Http\Controllers\Student\TaskController;
use App\Http\Controllers\Student\CommentController;
use App\Http\Controllers\Student\SubmissionController;
use App\Models\AdminSekolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\SupervisorController;
use App\Http\Controllers\Admin\SupervisorKPMController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\Mahasiswa\ClassroomPPLController as MahasiswaClassroomPPLController;
use App\Http\Controllers\Mahasiswa\NilaiController;
use App\Http\Controllers\SchoolCertificateController;
use App\Http\Controllers\SuperAdmin\GelombangController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use App\Http\Controllers\SupervisorKPM\ClassroomController;
use App\Http\Controllers\SupervisorKPM\SupervisorSubmissionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::middleware(['auth:sanctum', 'super_admin_api'])
    ->prefix('superadmin')
    ->group(function () {
        Route::prefix('data')->group(function () {
            Route::get('settings', [SuperAdminController::class, 'getSetting']);
            Route::get('gelombang', [GelombangController::class, 'all']);
            Route::post('gelombang', [GelombangController::class, 'create']);
            Route::delete('gelombang/{id}', [GelombangController::class, 'delete']);
        });
    });



Route::get('/lowonganppl', [LowonganPPLApiController::class, 'index']);
Route::get('/lowongankpm', [LowonganKPMApiController::class, 'index']);
Route::post('/admin/admin-sekolah/generate', [AdminSekolahController::class, 'generate']);
Route::get('/admin/admin-sekolah/query', [AdminSekolahController::class, 'query']);
Route::post('/admin/oprator-sekolah/delete/{email}', [AdminSekolahController::class, 'delete']);
Route::post('/admin/oprator-sekolah/bulk-delete', [AdminSekolahController::class, 'bulk_delete']);
Route::post('/admin/oprator-sekolah/export', [AdminSekolahController::class, 'export']);

Route::post('/operator-sekolah/data/kepsek_pamong/save', [AdminSekolahController::class, 'kepsek_pamong_save']);
Route::get('/operator-sekolah/data/kepsek-pamong/query', [OpratorSekolahController::class, 'query']);
Route::post('/operator-sekolah/data/kepsek-pamong/delete/{id}', [OpratorSekolahController::class, 'delete']);
Route::post('/admin/admin-kecamatan/generate', [AdminKecamatanController::class, 'generate']);
Route::get('/admin/data/admin-kecamatan/query', [AdminKecamatanController::class, 'query']);
Route::post('/admin/oprator-kecamatan/bulk-delete', [AdminKecamatanController::class, 'bulk_delete']);
Route::post('/admin/oprator-kecamatan/export', [AdminKecamatanController::class, 'export']);
Route::post('/admin/oprator-kecamatan/delete/{email}', [AdminKecamatanController::class, 'delete']);

Route::get('/operator-kecamatan/data/camat-keuchik/query', [OperatorKecamatanController::class, 'query']);
Route::post('/operator-kecamatan/data/camat-keuchik/save', [OperatorKecamatanController::class, 'camat_keuchik_save']);
Route::post('/operator-kecamatan/data/camat-keuchik/delete/{id}', [OperatorKecamatanController::class, 'delete']);
Route::get('/admin/data/kepsek-pamong/query', [KepsekkPamongController::class, 'query']);
Route::post('/admin/data/kepsek-pamong/delete/{id}', [KepsekkPamongController::class, 'delete']);
Route::post('/admin/data/kepsek-pamong/export', [KepsekkPamongController::class, 'export']);
Route::post('/admin/data/camat-keuchik/export', [CamatKeuchikController::class, 'export']);
Route::get('/admin/data/camat-keuchik/query', [CamatKeuchikController::class, 'query']);
Route::post('/admin/data/camat-keuchik/delete/{id}', [CamatKeuchikController::class, 'delete']);
Route::get('/operator-sekolah/data/mahasiswa', [KepsekkPamongController::class, 'mahasiswa']);
Route::post('/admin/data/kepsek-pamong/update-status/{id}', [KepsekkPamongController::class, 'update_status']);
Route::post('/admin/data/camat-keuchik/update-status/{id}', [CamatKeuchikController::class, 'update_status']);

Route::get('/admin/daftarsupervisor', [SupervisorController::class, 'index']);
Route::post('/admin/daftarsupervisor', [SupervisorController::class, 'save']);
Route::get('/admin/users/supervisor-kpm/{id}', [SupervisorController::class, 'show']);
Route::post('/admin/users/supervisor-kpm/update/{id}', [SupervisorController::class, 'update']);
Route::delete('/admin/users/supervisor-kpm/{id}', [SupervisorController::class, 'delete']);
Route::post('/admin/importsupervisor', [SupervisorController::class, 'importsupervisor']);


Route::post('/student/classroom/task', [TaskController::class, 'createTasksByClass']);
Route::post('/student/classroom/task/{id}', [TaskController::class, 'editTasksByClass']);
Route::delete('/admin/classroom-kpm/task/{id}', [TaskController::class, 'deleteTasksByClass']);
Route::get('/admin/classroom-kpm/task/{id}', [TaskController::class, 'getTask']);

Route::get('/admin/classroom-kpm/query', [TaskController::class, 'queryTasks']);

Route::get('/student/classroom/{id}/task', [TaskController::class, 'getTasksByClass']);
Route::get('/student/classroom/{id_kelas}/task/{id_task}', [TaskController::class, 'getTaskDetails']);

Route::get('/student/classroom/submission', [SubmissionController::class, 'getTaskSubmissions']);
Route::post('/student/classroom/submission', [SubmissionController::class, 'createTaskSubmissions']);
Route::post('/student/classroom/submission/update', [SubmissionController::class, 'editTaskSubmissions']);
Route::delete('/student/classroom/submission', [SubmissionController::class, 'deleteTaskSubmissions']);

Route::get('/student/classroom/publiccomment', [CommentController::class, 'getPublicComments']);
Route::post('/student/classroom/publiccomment', [CommentController::class, 'createPublicComment']);

Route::get('/student/classroom/privatecomment', [CommentController::class, 'getPrivateComments']);
Route::post('/student/classroom/privatecomment', [CommentController::class, 'createPrivateComment']);

Route::get('/admin/users/supervisor-kpm', [SupervisorKPMController::class, 'all']);
Route::get('/supervisor-kpm/classroom/{id_kelas}/{id_tugas}/tugas-mahasiswa', [SupervisorSubmissionController::class, 'getTaskSubmissions']);
Route::get('/supervisor-kpm/classroom/{id_kelas}/{id_tugas}/tugas-mahasiswa/{username}', [SupervisorSubmissionController::class, 'showTaskSubmission']);
Route::post('/supervisor-kpm/classroom/tugas-mahasiswa/nilai/update', [SupervisorSubmissionController::class, 'scoreTaskSubmissions']);

Route::get('/supervisor-kpm/classroom/private-comment', [ClassroomController::class, 'getPrivateComment']);
Route::post('/admin/users/supervisor-kpm/export', [SupervisorController::class, 'exportsupervisor']);

Route::get('/admin/classroom-kpm/nilai/query', [AdminClassroomController::class, 'queryNilai']);
Route::post("/admin/classroom-kpm/nilai/export", [AdminClassroomController::class, 'exportNilaiKPM']);
Route::get('/classroom/supervisor-ppl/mahasiswa', [ClassroomPPLController::class, 'list_mahasiswa']);

Route::post('/supervisor-ppl/classroom/mahasiswa/update/{nim}', [ClassroomPPLController::class, 'updateNilai']);
Route::post('/supervisor-ppl/classroom/private-comment/add', [ClassroomPPLController::class, 'supervisorMakePrivateComment']);
Route::get('/supervisor-ppl/classroom/private-comment', [ClassroomPPLController::class, 'supervisorGetPrivateComment']);
Route::get('/classroom-ppl/task', [MahasiswaClassroomPPLController::class, 'getTask']);
Route::get('/student/classroom-ppl/task/submission', [MahasiswaClassroomPPLController::class, 'getSubmission']);
Route::post('/student/classroom-ppl/task/submission/create', [MahasiswaClassroomPPLController::class, 'createSubmission']);


Route::post('/student/classroom-ppl/task/comment', [MahasiswaClassroomPPLController::class, 'createComment']);
Route::get('/student/classroom-ppl/task/comment', [MahasiswaClassroomPPLController::class, 'getPrivateComment']);
Route::get('/admin/classroom-ppl/student-score', [AdminClassroomController::class, 'getStudentsScore']);
Route::post('/admin/classroom-ppl/student-score/export', [AdminClassroomController::class, 'exportStudentsScorePPL']);
Route::get('/admin/certificate/nilai-ppkpm', [CertificateController::class, 'getAllNilai']);
Route::post('/admin/certificate/nilai-ppkpm/export', [CertificateController::class, 'exportRekapNilai']);

Route::get('/prodi', [ProdiController::class, 'getProdi']);
Route::post('/admin/certificate/setting', [CertificateController::class, 'saveCertificateSettings']);
Route::get('/admin/certificate/setting', [CertificateController::class, 'getCertificateSettings']);
Route::get('/student/nilai', [NilaiController::class, 'getNilai'])->middleware('auth:sanctum');
Route::post('/certificate/download', [CertificateController::class, 'downloadCertificate']);
Route::get('/certificate/download', [CertificateController::class, 'downloadCertificate']);

Route::get('/certificate/teacher/download', [SchoolCertificateController::class, 'viewCertificate']);
Route::post('/certificate/teacher/download', [SchoolCertificateController::class, 'viewCertificate']);

Route::post('/admin/data/kepsek-pamong/edit', [KepsekkPamongController::class, 'update']);
