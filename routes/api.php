<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminKecamatanController;
use App\Http\Controllers\DataRekapController;
use App\Http\Controllers\Admin\AdminSekolahController;
use App\Http\Controllers\Admin\CamatKeuchikController;
use App\Http\Controllers\Admin\ClassroomController as AdminClassroomController;
use App\Http\Controllers\Admin\ClassroomPPLController;
use App\Http\Controllers\Admin\DesaMasterController;
use App\Http\Controllers\Admin\KepsekkPamongController;
use App\Http\Controllers\Admin\KPMAlocation;
use App\Http\Controllers\Admin\LowonganPPLController;
use App\Http\Controllers\Admin\MahsiswaController;
use App\Http\Controllers\Admin\PPL\LowonganPPLController as PPLLowonganPPLController;
use App\Http\Controllers\Admin\PPL\PelamarPPLController;
use App\Http\Controllers\Admin\PPL\TempatPPLController as PPLTempatPPLController;
use App\Http\Controllers\Admin\PplAlocationController;
use App\Http\Controllers\Admin\ProdiController;
use App\Http\Controllers\Admin\SekolahController;
use App\Http\Controllers\Admin\SertifikatMahasiswaController;
use App\Http\Controllers\Admin\SertifikatSekolahController;
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
use App\Http\Controllers\Admin\TempatKPM;
use App\Http\Controllers\Admin\TempatPPLController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LamaranKPMController;
use App\Http\Controllers\Mahasiswa\ClassroomPPLController as MahasiswaClassroomPPLController;
use App\Http\Controllers\Mahasiswa\MahasiswaController;
use App\Http\Controllers\Mahasiswa\NilaiController;
use App\Http\Controllers\MahasiswaKPM;
use App\Http\Controllers\BimbinganController;
use App\Http\Controllers\SchoolCertificateController;
use App\Http\Controllers\SuperAdmin\GelombangController;
use App\Http\Controllers\SuperAdmin\ImportDataController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use App\Http\Controllers\SupervisorKPM\ClassroomController;
use App\Http\Controllers\SupervisorKPM\SupervisorSubmissionController;
use App\Http\Middleware\PendaftaranPPL;
use App\Models\LamaranKPM;
use Maatwebsite\Excel\Row;

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

            Route::post('import/mahasiswa', [ImportDataController::class, 'importMahasiswa']);
            Route::post('import/supervisor', [ImportDataController::class, 'importSupervisor']);
        });
    });


Route::middleware(['auth:sanctum', 'user_api'])
    ->prefix('user')
    ->group(function () {
        Route::prefix('ppl')->group(function () {
            Route::get('vacancies', [LowonganPPLApiController::class, 'index']);
            Route::get('vacancies', [LowonganPPLApiController::class, 'getVacancies']);
        });
    });

Route::middleware(['auth:sanctum', 'admin_api'])
    ->prefix('admin')
    ->group(function () {
        Route::prefix('ppl')->group(function () {
            Route::get('alocation', [PplAlocationController::class, 'getDataAlocation']);
            Route::post('lowongan/bulk', [PplAlocationController::class, 'bulkGenerateLowongan']);
            Route::delete('lowongan/bulk', [PplAlocationController::class, 'bulkDeleteLowongan']);
            Route::patch('lowongan/bulk', [PplAlocationController::class, 'bulkSave']);
        });
        Route::prefix('dashboard')->group(function () {
            Route::get('data', [DashboardController::class, 'getData']);
        });
        Route::prefix('data')->group(function () {
            Route::get('master-sekolah', [SekolahController::class, 'getSekolahData']);
            Route::post('master-sekolah', [SekolahController::class, 'createSekolah']);
            Route::delete('master-sekolah/{id}', [SekolahController::class, 'deleteSekolah']);
            Route::get('master-sekolah/{id}', [SekolahController::class, 'getData']);
            Route::patch('master-sekolah/{id}', [SekolahController::class, 'updateData']);


            Route::get('master-desa', [DesaMasterController::class, 'getDataDesa']);
            Route::post('master-desa', [DesaMasterController::class, 'createDesa']);
            Route::delete('master-desa/{id}', [DesaMasterController::class, 'deleteDesa']);
            Route::get('master-desa/{id}', [DesaMasterController::class, 'getDataById']);
            Route::patch('master-desa/{id}', [DesaMasterController::class, 'updateDataById']);
        });

        Route::prefix('kpm')->group(function () {
            Route::get('tempatkpm', [TempatKPM::class, 'getData']);
            Route::get('alocations', [KPMAlocation::class, 'getDataAlocation']);
            Route::patch('/lowongan/bulk', [KPMAlocation::class, 'saveBulk']);
            Route::post('lowongan/bulk', [KPMAlocation::class, 'bulkGenerateLowongan']);
            Route::delete('lowongan/bulk', [KPMAlocation::class, 'bulkDeleteLowongan']);
            Route::delete('lowongan/{id}', [KPMAlocation::class, 'deleteLowongan']);
            Route::get('desa', [TempatKPM::class, 'getDataDesa']);
            Route::get('supervisor', [TempatKPM::class, 'getSupervisor']);
            Route::post('/lowongan', [KPMAlocation::class, 'createLowongan']);
            Route::patch('/lowongan', [KPMAlocation::class, 'updateLowongan']);
        });
    });
Route::middleware(['auth:sanctum', 'role:admin'])
    ->group(function () {
        Route::get('/tempatkpm/mahasiswa', [MahasiswaKPM::class, 'getMahasiswa']);
        Route::get('/tempatkpm/{id}', [TempatKPM::class, 'getDataById']);
        Route::get('/admin/student', [TempatKPM::class, 'getAllStudents']);
        Route::get('/tempatkpm', [TempatKPM::class, 'getAllTempatKPM']);
        Route::post('/kpm/lamaran', [LamaranKPMController::class, 'create']);
        Route::get('/kpm/lamaran', [LamaranKPMController::class, 'getById']);
        Route::delete('/kpm/lamaran', [LamaranKPMController::class, 'delete']);
        Route::patch('/kpm/lamaran', [LamaranKPMController::class, 'update']);

        Route::prefix('ppl')->group(function () {
            Route::get('/sekolah', [PPLTempatPPLController::class, 'getTempatPPL']);
        });



        Route::prefix('admin')->group(function () {
            Route::get('/master-sekolah', [SekolahController::class, 'getAllDataWithoutPagination']);
            Route::prefix('ppl')->group(function () {
                Route::post('/sekolah', [PPLTempatPPLController::class, 'addTempatPPL']);
                Route::post('/sekolah/import', [PPLTempatPPLController::class, 'importTempatPPL']);
                Route::get('/sekolah/template-import', [PPLTempatPPLController::class, 'downloadTemplate']);
                Route::post('/sekolah/peserta/import', [PPLTempatPPLController::class, 'importPesertaPPL']);
                Route::get('/sekolah/peserta/template-import', [PPLTempatPPLController::class, 'downloadPesertaTemplate']);
                Route::get('/sekolah/detail', [PPLTempatPPLController::class, 'getDataTempatPPLByID']);
                Route::patch('/sekolah/{id}', [PPLTempatPPLController::class, 'updateDataTempatPPLByID']);
                Route::delete('/sekolah/delete/{id}', [PPLTempatPPLController::class, 'deleteTempatPPLById']);

                Route::prefix('lowongan')->group(function () {
                    Route::get('/list', [PPLLowonganPPLController::class, 'listWithPaginate']);
                    Route::post('/add', [PPLLowonganPPLController::class, 'addLowongan']);
                    Route::get('/listsbyschool', [PPLLowonganPPLController::class, 'listLowonganBySekolah']);
                    Route::patch('/update/{id}', [PPLLowonganPPLController::class, 'updateLowongan']);
                    Route::delete('/delete/{id}', [PPLLowonganPPLController::class, 'deleteLowonganById']);
                    Route::get('/detail', [PPLLowonganPPLController::class, 'getLowonganPPLById']);

                    Route::prefix('mahasiswa')->group(function () {
                        Route::get('/list', [PelamarPPLController::class, 'listWithPaginate']);
                        Route::post('/add', [PelamarPPLController::class, 'addPelamar']);
                        Route::post('/import', [PelamarPPLController::class, 'importMahasiswa']);
                        Route::get('/template-import', [PelamarPPLController::class, 'downloadTemplate']);
                        Route::patch('/update/{id}', [PelamarPPLController::class, 'updatePelamarById']);
                        Route::delete('/delete/{id}', [PelamarPPLController::class, 'deletePelamarById']);
                        Route::get('/detail', [PelamarPPLController::class, 'getPelamarPPLById']);
                    });
                });
            });
            Route::prefix('school-certificate')->group(function(){
                Route::get('/setting', [SertifikatSekolahController::class, 'index']);
                Route::post('/togleactive/{id}', [SertifikatSekolahController::class, 'togglePrintStatus']);
                Route::delete('/setting/{id}', [SertifikatSekolahController::class, 'destroy']);
                Route::post('/setting', [SertifikatSekolahController::class, 'store']);
                Route::post('/setting/update/{id}', [SertifikatSekolahController::class, 'update']);


            });

            Route::prefix('student-certificate')->group(function(){
                Route::get('/setting', [SertifikatMahasiswaController::class, 'index']);
                Route::post('/togleactive/{id}', [SertifikatMahasiswaController::class, 'togglePrintStatus']);
                Route::delete('/setting/{id}', [SertifikatMahasiswaController::class, 'destroy']);
                Route::post('/setting', [SertifikatMahasiswaController::class, 'store']);
                Route::post('/setting/update/{id}', [SertifikatMahasiswaController::class, 'update']);


            });

            Route::prefix('users')->group(function(){
                Route::prefix('student')->group(function(){
                    Route::get('/list', [MahsiswaController::class, 'listMahasiswa']);
                    Route::get('/detail', [MahsiswaController::class, 'getMahasiswaByUsername']);
                    Route::post('/status/{id}', [MahsiswaController::class, 'updateStatus']);
                    Route::post('/reset-password/{id}', [MahsiswaController::class, 'resetPassword']);
                    Route::post('/export', [MahsiswaController::class, 'exportData']);
                    Route::get('/transkrip', [MahsiswaController::class, 'getTranskrip']);



                });

            });
        });
    });



// ---------------------------------------------------------------------------
// Route publik (read-only) — tetap dapat diakses tanpa login.
// Hanya data referensi yang tidak sensitif.
// ---------------------------------------------------------------------------
Route::get('/gelombang', [GelombangController::class, 'getGelombangData']);
Route::get('/lowonganppl', [LowonganPPLApiController::class, 'index']);
Route::get('/lowongankpm', [LowonganKPMApiController::class, 'index']);
Route::get('/prodi', [ProdiController::class, 'getProdi']);

// ---------------------------------------------------------------------------
// Admin — manajemen pengguna, data, classroom, dan sertifikat.
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Operator sekolah
    Route::post('/admin/admin-sekolah/generate', [AdminSekolahController::class, 'generate']);
    Route::get('/admin/admin-sekolah/query', [AdminSekolahController::class, 'query']);
    Route::post('/admin/admin-sekolah', [AdminSekolahController::class, 'store']);
    Route::post('/admin/admin-sekolah/update/{id}', [AdminSekolahController::class, 'update']);
    Route::delete('/admin/admin-sekolah/{id}', [AdminSekolahController::class, 'destroy']);
    Route::post('/admin/oprator-sekolah/delete/{email}', [AdminSekolahController::class, 'delete']);
    Route::post('/admin/oprator-sekolah/bulk-delete', [AdminSekolahController::class, 'bulk_delete']);
    Route::post('/admin/oprator-sekolah/export', [AdminSekolahController::class, 'export']);

    // Operator kecamatan
    Route::post('/admin/admin-kecamatan/generate', [AdminKecamatanController::class, 'generate']);
    Route::get('/admin/data/admin-kecamatan/query', [AdminKecamatanController::class, 'query']);
    Route::post('/admin/admin-kecamatan', [AdminKecamatanController::class, 'store']);
    Route::post('/admin/admin-kecamatan/update/{id}', [AdminKecamatanController::class, 'update']);
    Route::delete('/admin/admin-kecamatan/{id}', [AdminKecamatanController::class, 'destroy']);
    Route::post('/admin/oprator-kecamatan/bulk-delete', [AdminKecamatanController::class, 'bulk_delete']);
    Route::post('/admin/oprator-kecamatan/export', [AdminKecamatanController::class, 'export']);
    Route::post('/admin/oprator-kecamatan/delete/{email}', [AdminKecamatanController::class, 'delete']);

    // Kepala sekolah / guru pamong
    Route::get('/admin/data/kepsek-pamong/query', [KepsekkPamongController::class, 'query']);
    Route::post('/admin/data/kepsek-pamong/delete/{id}', [KepsekkPamongController::class, 'delete']);
    Route::post('/admin/data/kepsek-pamong/export', [KepsekkPamongController::class, 'export']);
    Route::post('/admin/data/kepsek-pamong/update-status/{id}', [KepsekkPamongController::class, 'update_status']);
    Route::post('/admin/data/kepsek-pamong/edit', [KepsekkPamongController::class, 'update']);

    // Camat / keuchik
    Route::post('/admin/data/camat-keuchik/export', [CamatKeuchikController::class, 'export']);
    Route::get('/admin/data/camat-keuchik/query', [CamatKeuchikController::class, 'query']);
    Route::post('/admin/data/camat-keuchik/delete/{id}', [CamatKeuchikController::class, 'delete']);
    Route::post('/admin/data/camat-keuchik/update-status/{id}', [CamatKeuchikController::class, 'update_status']);

    // Supervisor
    Route::get('/admin/daftarsupervisor', [SupervisorController::class, 'index']);
    Route::post('/admin/daftarsupervisor', [SupervisorController::class, 'save']);
    Route::get('/admin/users/supervisor-kpm/{id}', [SupervisorController::class, 'show']);
    Route::post('/admin/users/supervisor-kpm/update/{id}', [SupervisorController::class, 'update']);
    Route::delete('/admin/users/supervisor-kpm/{id}', [SupervisorController::class, 'delete']);
    Route::post('/admin/importsupervisor', [SupervisorController::class, 'importsupervisor']);
    Route::get('/admin/users/supervisor-kpm', [SupervisorKPMController::class, 'all']);
    Route::post('/admin/users/supervisor-kpm/export', [SupervisorController::class, 'exportsupervisor']);

    // Akun admin
    Route::get('/admin/users/admin', [AdminController::class, 'apiList']);
    Route::post('/admin/users/admin', [AdminController::class, 'apiSave']);
    Route::post('/admin/users/admin/update/{id}', [AdminController::class, 'apiUpdate']);
    Route::delete('/admin/users/admin/{id}', [AdminController::class, 'apiDelete']);

    // Classroom KPM (admin)
    Route::post('/student/classroom/task', [TaskController::class, 'createTasksByClass']);
    Route::post('/student/classroom/task/{id}', [TaskController::class, 'editTasksByClass']);
    Route::delete('/admin/classroom-kpm/task/{id}', [TaskController::class, 'deleteTasksByClass']);
    Route::get('/admin/classroom-kpm/task/{id}', [TaskController::class, 'getTask']);
    Route::get('/admin/classroom-kpm/query', [TaskController::class, 'queryTasks']);
    Route::get('/admin/classroom-kpm/nilai/query', [AdminClassroomController::class, 'queryNilai']);
    Route::post("/admin/classroom-kpm/nilai/export", [AdminClassroomController::class, 'exportNilaiKPM']);

    // Classroom PPL (admin)
    Route::get('/admin/classroom-ppl/student-score', [AdminClassroomController::class, 'getStudentsScore']);
    Route::post('/admin/classroom-ppl/student-score/export', [AdminClassroomController::class, 'exportStudentsScorePPL']);

    // Sertifikat & rekap nilai
    Route::get('/admin/certificate/nilai-ppkpm', [CertificateController::class, 'getAllNilai']);
    Route::post('/admin/certificate/nilai-ppkpm/export', [CertificateController::class, 'exportRekapNilai']);
    Route::post('/admin/certificate/setting', [CertificateController::class, 'saveCertificateSettings']);
    Route::get('/admin/certificate/setting', [CertificateController::class, 'getCertificateSettings']);
});

// ---------------------------------------------------------------------------
// Admin + Operator Sekolah
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,opt-sekolah'])->group(function () {
    Route::post('/operator-sekolah/data/kepsek_pamong/save', [AdminSekolahController::class, 'kepsek_pamong_save']);
    Route::get('/operator-sekolah/data/kepsek-pamong/query', [OpratorSekolahController::class, 'query']);
    Route::get('/operator-sekolah/data/mahasiswa', [KepsekkPamongController::class, 'mahasiswa']);
    Route::get('/operator-sekolah/classroom/{id}/data', [OpratorSekolahController::class, 'getClassroomData']);
});

// Endpoint ini juga dipakai halaman penilaian PPL (role supervisor_kpm).
Route::middleware(['auth:sanctum', 'role:admin,opt-sekolah,supervisor_kpm'])->group(function () {
    Route::post('/operator-sekolah/data/kepsek-pamong/delete/{id}', [OpratorSekolahController::class, 'delete']);
});

// ---------------------------------------------------------------------------
// Admin + Operator Kecamatan
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,opt-kecamatan'])->group(function () {
    Route::get('/operator-kecamatan/data/camat-keuchik/query', [OperatorKecamatanController::class, 'query']);
    Route::post('/operator-kecamatan/data/camat-keuchik/save', [OperatorKecamatanController::class, 'camat_keuchik_save']);
    Route::post('/operator-kecamatan/data/camat-keuchik/delete/{id}', [OperatorKecamatanController::class, 'delete']);
    Route::get('/operator-kecamatan/classroom/{id}/data', [OperatorKecamatanController::class, 'getClassroomData']);
});

// ---------------------------------------------------------------------------
// Classroom KPM — mahasiswa, DPL KPM, dan admin.
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,user,supervisor_kpm'])->group(function () {
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
});

// ---------------------------------------------------------------------------
// Classroom PPL — mahasiswa, DPL PPL/KPM, dan admin.
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,user,supervisor,supervisor_kpm'])->group(function () {
    Route::get('/classroom-ppl/task', [MahasiswaClassroomPPLController::class, 'getTask']);
    Route::get('/student/classroom-ppl/task/submission', [MahasiswaClassroomPPLController::class, 'getSubmission']);
    Route::post('/student/classroom-ppl/task/submission/create', [MahasiswaClassroomPPLController::class, 'createSubmission']);
    Route::post('/student/classroom-ppl/task/comment', [MahasiswaClassroomPPLController::class, 'createComment']);
    Route::get('/student/classroom-ppl/task/comment', [MahasiswaClassroomPPLController::class, 'getPrivateComment']);
});

// ---------------------------------------------------------------------------
// Classroom supervisor (KPM & PPL)
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,supervisor,supervisor_kpm'])->group(function () {
    Route::get('/supervisor-kpm/classroom/{id_kelas}/{id_tugas}/tugas-mahasiswa', [SupervisorSubmissionController::class, 'getTaskSubmissions']);
    Route::get('/supervisor-kpm/classroom/{id_kelas}/{id_tugas}/tugas-mahasiswa/{username}', [SupervisorSubmissionController::class, 'showTaskSubmission']);
    Route::post('/supervisor-kpm/classroom/tugas-mahasiswa/nilai/update', [SupervisorSubmissionController::class, 'scoreTaskSubmissions']);
    Route::get('/supervisor-kpm/classroom/private-comment', [ClassroomController::class, 'getPrivateComment']);

    Route::get('/classroom/supervisor-ppl/mahasiswa', [ClassroomPPLController::class, 'list_mahasiswa']);
    Route::post('/supervisor-ppl/classroom/mahasiswa/update/{nim}', [ClassroomPPLController::class, 'updateNilai']);
    Route::post('/supervisor-ppl/classroom/private-comment/add', [ClassroomPPLController::class, 'supervisorMakePrivateComment']);
    Route::get('/supervisor-ppl/classroom/private-comment', [ClassroomPPLController::class, 'supervisorGetPrivateComment']);
});

// ---------------------------------------------------------------------------
// Nilai & sertifikat mahasiswa — pemilik akun dan admin.
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,user'])->group(function () {
    Route::get('/student/nilai', [NilaiController::class, 'getNilai']);
    Route::post('/certificate/download', [CertificateController::class, 'downloadCertificate']);
    Route::get('/certificate/download', [CertificateController::class, 'downloadCertificate']);
});

// ---------------------------------------------------------------------------
// Sertifikat guru/kepala sekolah — admin dan operator sekolah.
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,opt-sekolah'])->group(function () {
    Route::get('/certificate/teacher/download', [SchoolCertificateController::class, 'viewCertificate']);
    Route::post('/certificate/teacher/download', [SchoolCertificateController::class, 'viewCertificate']);
});

Route::middleware(['auth:sanctum', 'admin_api'])->group(function() {
    Route::get('/admin/users/student/list', [MahsiswaController::class, 'listMahasiswa']);
    Route::post('/admin/users/student/export', [MahsiswaController::class, 'exportData']);
});

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/bimbingan', [BimbinganController::class, 'getMahasiswaBimbingan']);
    Route::post('/bimbingan', [BimbinganController::class, 'storeMahasiswaBimbingan']);
    Route::post('/bimbingan/{id}/update', [BimbinganController::class, 'updateMahasiswaBimbingan']);
    Route::delete('/bimbingan/{id}', [BimbinganController::class, 'deleteMahasiswaBimbingan']);

    Route::get('/supervisor/bimbingan/{tipe}/{id_kelas}', [BimbinganController::class, 'getSupervisorBimbingan']);
    Route::post('/supervisor/bimbingan/{id}/validate', [BimbinganController::class, 'validateSupervisorBimbingan']);
});

// Public API route — tanpa login, dengan Rate Limiting untuk keamanan
Route::middleware(['throttle:30,1'])->group(function () {
    Route::get('/data-rekap', [DataRekapController::class, 'getData']);
    Route::get('/data_rekap', [DataRekapController::class, 'getData']);
    Route::get('/data-rekap/status', [DataRekapController::class, 'getSyncStatus']);
    Route::post('/data-rekap/refresh', [DataRekapController::class, 'triggerBackgroundSync']);
    Route::get('/data-rekap/refresh', [DataRekapController::class, 'triggerBackgroundSync']);
});
