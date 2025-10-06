<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminKecamatanController;
use App\Http\Controllers\Admin\AdminSekolahController;
use App\Http\Controllers\Admin\AlokasiPPL;
use App\Http\Controllers\Admin\CamatKeuchikController;
use App\Http\Controllers\Admin\ClassroomController as AdminClassroomController;
use App\Http\Controllers\Admin\ClassroomPPLController;
use App\Http\Controllers\Admin\DesaMasterController;
use App\Http\Controllers\Admin\KepsekkPamongController;
use App\Http\Controllers\Admin\KPMAlocation;
use App\Http\Controllers\Admin\LowonganPPLController;
use App\Http\Controllers\Admin\MahasiswaKPMController;
use App\Http\Controllers\Admin\MahasiswaPPKPMController;
use App\Http\Controllers\Admin\MahasiswaPPLContoller;
use App\Http\Controllers\Admin\MahsiswaController;
use App\Http\Controllers\Admin\ProdiController;
use App\Http\Controllers\Admin\SekolahController;
use App\Http\Controllers\Admin\SupervisorController as AdminSupervisorController;
use App\Http\Controllers\Admin\SupervisorKPMController;
use App\Http\Controllers\Admin\TempatKPM;
use App\Http\Controllers\Admin\TempatPPLController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EasyController;
use App\Http\Controllers\HomeControler;
use App\Http\Controllers\Mahasiswa\Classroom\HomeController;
use App\Http\Controllers\Mahasiswa\ClassroomPPLController as MahasiswaClassroomPPLController;
use App\Http\Controllers\Mahasiswa\LowonganKPM;
use App\Http\Controllers\Mahasiswa\LowonganPPL;
use App\Http\Controllers\Mahasiswa\MahasiswaController;
use App\Http\Controllers\Mahasiswa\NilaiController;
use App\Http\Controllers\Mahasiswa\ProfilController as MahasiswaProfilController;
use App\Http\Controllers\Mahasiswa\RiwayatLamaran;
use App\Http\Controllers\OperatorKecamatan\OperatorKecamatanController;
use App\Http\Controllers\OperatorSekolah\OpratorSekolahController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\Student\ClassroomController as StudentClassroomController;
use App\Http\Controllers\Student\TaskController;
use App\Http\Controllers\Supervisor\SupervisorController;
use App\Http\Controllers\SupervisorKPM\ClassroomController;
use App\Http\Controllers\testcontroller;
use App\Models\LowonganPPL as ModelsLowonganPPL;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Maatwebsite\Excel\Row;

Route::middleware(['auth', 'opt-sekolah'])->group(function () {
    Route::get('/operator-sekolah/dashboard', [OpratorSekolahController::class, 'index']);
    Route::get('/operator-sekolah/data/kepsek-pamong', [OpratorSekolahController::class, 'kepsek_pamong']);
    Route::get('/operator-sekolah/data/kepsek_pamong/add', [OpratorSekolahController::class, 'kepsek_pamong_add']);
    Route::get('/operator-sekolah/data/kepsek_pamong/detail/{id}', [OpratorSekolahController::class, 'kepsek_pamong_detail']);
    // Route::get('/operator-sekolah/data/kepsek-pamong', [OpratorSekolahController::class, 'kepsek_pamong']);
});

Route::middleware(['auth', 'opt-kecamatan'])->group(function () {
    Route::get('/operator-kecamatan/dashboard', [OperatorKecamatanController::class, 'index']);
    Route::get('/operator-kecamatan/data/camat-keuchik', [OperatorKecamatanController::class, 'camat_keuchik']);
    Route::get('/operator-kecamatan/data/camat-keuchik/add', [OperatorKecamatanController::class, 'camat_keuchik_add']);
    Route::get('/operator-kecamatan/data/camat-keuchik/detail/{id}', [OperatorKecamatanController::class, 'camat_keuchik_detail']);
});


Route::middleware(['auth', 'supervisor-kpm'])->group(function () {
    Route::get('/supervisor/classroom/home', [ClassroomController::class, 'index']);

    Route::get('/supervisor-kpm/classroom/{id}/task', [ClassroomController::class, 'viewTask']);
    Route::get('/supervisor-kpm/classroom/{id_kelas}/task/{id_tugas}/detail', [ClassroomController::class, 'detail']);
    Route::get('/supervisor-kpm/classroom/{id_kelas}/task/{id_tugas}/tugas-mahasiswa', [ClassroomController::class, 'tugasMahasiswa']);
    Route::get('/supervisor-kpm/classroom/{id_kelas}/task/{id_tugas}/tugas-mahasiswa/{username_mahasiswa}', [ClassroomController::class, 'tugasMahasiswa']);

    Route::get('/supervisor-ppl/classroom/{id_sekolah}', [ClassroomPPLController::class, 'index']);
    Route::get('/supervisor-ppl/classroom/mahasiswa/{id_sekolah}/{nim}', [ClassroomPPLController::class, 'detailTugasMahasiswa']);
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::prefix('data')->group(function () {
            Route::get('master-sekolah', [SekolahController::class, 'listSekolah']);
            Route::get('master-sekolah/{id}', [SekolahController::class, 'viewSekolah']);

            Route::get('master-desa', [DesaMasterController::class, 'index']);
            Route::get('master-desa/{id}', [DesaMasterController::class, 'detail']);



        });

        Route::prefix('kpm')->group(function(){
            Route::get('tempatkpm', [TempatKPM::class, 'home']);
            Route::get('tempatkpm/detail', [TempatKPM::class, 'viewTempatKPM']);
            Route::get('kpm-alocations', [KPMAlocation::class, 'index']);

        });
    });
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name("admin.dashboard");
    Route::get('/admin/data/camat-keuchik', [CamatKeuchikController::class, 'list']);
    Route::get('/admin/data/kepsek-pamong', [KepsekkPamongController::class, 'list']);
    Route::get('/admin/data/kepsek-pamong/edit', [KepsekkPamongController::class, 'edit']);
    Route::get('/admin/data/kepsek-pamong/detail/{id}', [KepsekkPamongController::class, 'detail']);
    Route::get('/admin/camat-keuchik/detail/{id}', [CamatKeuchikController::class, 'detail']);

    // Classroom KPM
    Route::get('/admin/classroom-kpm/tugas', [AdminClassroomController::class, 'tugas']);
    Route::get('/admin/classroom-kpm/tugas/add', [AdminClassroomController::class, 'tugas_add']);
    Route::get('/admin/classroom-kpm/tugas/detail/{id}', [AdminClassroomController::class, 'tugas_edit']);
    Route::get('/admin/classroom-ppl/student-score', [AdminClassroomController::class, 'nilaiPPL']);

    // Data
    Route::get('/admin/daftarprodi', [ProdiController::class, 'show'])->name("admin.daftarprodi");
    Route::get('/admin/prodi/add', [ProdiController::class, 'add'])->name('admin.prodi.add');
    Route::get('/admin/prodi/import', [ProdiController::class, 'import'])->name("admin.prodi.import");
    Route::get('/admin/prodi/edit/{id}', [ProdiController::class, 'edit'])->name("admin.prodi.edit");
    Route::patch('/admin/prodi/{id}', [ProdiController::class, 'update'])->name("admin.prodi.update");
    Route::post('/admin/prodi/save', [ProdiController::class, 'save'])->name('admin.prodi.save');

    Route::post('/admin/importdataprodi', [ProdiController::class, 'importprodi'])->name("admin.importdataprodi");
    Route::delete('/admin/prodi/{id}', [ProdiController::class, 'delete'])->name("admin.prodi.delete");


    Route::get('/admin/daftaradmin', [AdminController::class, 'index'])->name('admin.daftaradmin');
    Route::get('/admin/add', [AdminController::class, 'add'])->name('admin.add');
    Route::post('/admin/save', [AdminController::class, 'save'])->name('admin.save');
    Route::delete('/admin/delete/{email}', [AdminController::class, 'delete'])->name('admin.delete');

    Route::get('/admin/mahasiswappkpm', [MahasiswaPPKPMController::class, 'all'])->name('admin.mahasiswappkpm.list');

    Route::get('/admin/daftarsupervisor', [AdminSupervisorController::class, 'index'])->name("admin.daftarsupervisor");
    Route::get('/admin/supervisor/import', [AdminSupervisorController::class, 'import'])->name("admin.supervisor.import");
    Route::post('/admin/importsupervisor', [AdminSupervisorController::class, 'importsupervisor'])->name("admin.importsupervisor");
    Route::delete('/admin/supervisor/{id}', [AdminSupervisorController::class, 'delete'])->name("admin.supervisor.delete");
    Route::get('/admin/supervisor/{id}', [AdminSupervisorController::class, 'edit'])->name("admin.supervisor.edit");
    Route::patch('/admin/supervisor/{id}', [AdminSupervisorController::class, 'update'])->name("admin.supervisor.update");
    Route::get('/admin/tambah/supervisor', [AdminSupervisorController::class, 'tambah'])->name("admin.supervisor.tambah");
    Route::post('/admin/save/supervisor', [AdminSupervisorController::class, 'save'])->name("admin.supervisor.save");

    // PPL
    Route::get('/admin/daftartempatppl', [TempatPPLController::class, 'index'])->name("admin.daftartempatppl");
    Route::get('/admin/tempatppl/import', [TempatPPLController::class, 'import'])->name("admin.tempatppl.import");
    Route::get('/admin/tempatppl/add', [TempatPPLController::class, 'add'])->name("admin.addtempatppl");
    Route::post('/admin/tempatppl/save', [TempatPPLController::class, 'save'])->name('admin.tempatppl.save');
    Route::get('/admin/tempatppl/detail/{id}', [TempatPPLController::class, 'detail'])->name('admin.tempatppl.detail');
    // Route::post('/admin/tempatppl/update/{id}', [TempatPPLController::class, 'update'])->name('admin.tempatppl.update');
    Route::post('/admin/importtempatppl', [TempatPPLController::class, 'importtempatppl'])->name("admin.importtempatppl");
    Route::get('/admin/tempatppl/edit/{id}', [TempatPPLController::class, 'edit'])->name('admin.tempatppl.edit');
    Route::patch('/admin/tempatppl/update/{id}', [TempatPPLController::class, 'update'])->name('admin.tempatppl.update');
    Route::delete('/admin/tempatppl/delete/{id}', [TempatPPLController::class, 'delete'])->name('admin.tempatppl.delete');

    Route::get('/admin/ppl/ppl-alocation', [AlokasiPPL::class, 'list']);




    Route::get('/admin/lowonganppl/add', [LowonganPPLController::class, 'add'])->name('admin.lowonganppl.add');
    Route::post('/admin/lowonganppl/save', [LowonganPPLController::class, 'save'])->name('admin.lowonganppl.save');
    Route::get('/admin/lowonganppl/detail/{id}', [LowonganPPLController::class, 'detail'])->name('admin.lowonganppl.detail');
    Route::delete('admin/lowonganppl/delete/{id}', [LowonganPPLController::class, 'delete'])->name("admin.lowonganppl.delete");
    Route::get('/admin/daftarlowonganppl', [LowonganPPLController::class, 'index'])->name("admin.daftarlowonganppl");
    Route::get('/admin/addlowonganppl', [LowonganPPLController::class, 'add'])->name("admin.addlowonganppl");
    Route::post('/admin/lowonganppl/update/{id}', [LowonganPPLController::class, 'update'])->name('admin.lowonganppl.update');
    Route::post('/admin/importlowonganppl', [LowonganPPLController::class, 'importlowonganppl'])->name("admin.importlowonganppl");
    Route::get('/admin/lowonganppl/edit/{id}', [LowonganPPLController::class, 'edit'])->name('admin.lowonganppl.edit');
    Route::get('/admin/pelamarppl/detail/{id}', [LowonganPPLController::class, 'detail_pelamar'])->name('admin.pelamarppl.detail');
    Route::post('/admin/pelamarppl/followup/{id}', [LowonganPPLController::class, 'followup'])->name('admin.lamaranppl.followup');
    Route::get('/admin/lowongan/ppl/pelamar/list', [LowonganPPLController::class, 'list_pelamar'])->name('admin.lowongan.pelamar.list');
    Route::get('/admin/daftarmahasiswappl', [MahasiswaPPLContoller::class, 'index'])->name("admin.daftarmahasiswappl");
    Route::get('/admin/mahasiswappl/edit/{id}', [MahasiswaPPLContoller::class, 'edit'])->name("admin.mahasiswappl.edit");
    Route::patch('/admin/updatenilai/{id}', [MahasiswaPPLContoller::class, 'updatenilai']);
    Route::get('admin/mahasiswa/edit/{nim}', [MahsiswaController::class, 'edit'])->name('admin.mahasiswa.edit');
    Route::get('/admin/users/student', [MahsiswaController::class, 'index'])->name("admin.daftarmahasiswa");
    Route::post('/admin/importmahasiswa', [MahsiswaController::class, 'importmahasiswa'])->name("admin.importmahasiswa");

    Route::get('/admin/addmahasiswa', [MahsiswaController::class, 'add'])->name("admin.addmahasiswa");
    Route::patch('/admin/mahasiswa/update/{nim}', [MahsiswaController::class, 'update'])->name("admin.mahasiswa.update");
    Route::get('/admin/mahasiswa/detail/{id}', [MahsiswaController::class, 'detail'])->name('admin.mahasiswa.detail');
    Route::post('/admin/mahasiswa/followup/{id}', [MahsiswaController::class, 'followup'])->name('admin.mahasiswa.followup');

    Route::get('/admin/tempatkpm', [TempatKPM::class, 'list'])->name("admin.tempatkpm.list");
    Route::get('/admin/tempatkpm/add', [TempatKPM::class, 'add'])->name("admin.tempatkpm.add");
    Route::get('/admin/tempatkpm/detail/{id}', [TempatKPM::class, 'detail'])->name('admin.tempatkpm.detail');
    Route::post('/admin/tempatkpm/save', [TempatKPM::class, 'save'])->name('admin.tempatkpm.save');
    Route::post('/admin/tempatkpm/update/{id}', [TempatKPM::class, 'update'])->name('admin.tempatkpm.update');
    Route::get('/admin/tempatkpm/edit/{id}', [TempatKPM::class, 'edit'])->name("admin.tempatkpm.edit");
    Route::delete('/admin/tempatkpm/delete/{id}', [TempatKPM::class, 'delete'])->name("admin.tempatkpm.delete");
    Route::get('/admin/pelamarkpm/detail/{id}', [TempatKPM::class, 'detail_pelamar'])->name("admin.pelamarkpm.detail");
    Route::post('/admin/pelamarkpm/followup/{id}', [TempatKPM::class, 'followup'])->name('admin.pelamarkpm.followup');
    Route::get('/admin/mahasiswakpm/list', [MahasiswaKPMController::class, 'all'])->name("admin.mahasiswakpm.list");
    Route::get('/admin/tempatkpm/pelamar/list', [TempatKPM::class, 'list_pelamar'])->name('admin.tempatkpm.pelamar.list');


    // Route::post('/admin/importdataprodi', [ProdiController::class, 'importprodi'])->name("admin.importdataprodi");
    Route::get('/admin/settings', [SettingController::class, 'index'])->name('admin.settings');
    Route::post('/admin/settings/update', [SettingController::class, 'update'])->name('admin.settings.update');


    Route::get('/admin/admin-sekolah/list', [AdminSekolahController::class, 'index']);
    Route::get('/admin/admin-kecamatan/list', [AdminKecamatanController::class, 'index']);


    // Pengguna
    Route::get('/admin/users/supervisor-kpm', [SupervisorKPMController::class, 'list']);
    Route::get('/admin/users/supervisor-kpm/add', [SupervisorKPMController::class, 'add']);
    Route::get('/admin/users/supervisor-kpm/edit/{id}', [SupervisorKPMController::class, 'edit']);
    Route::get('/admin/users/supervisor-kpm/import', [SupervisorKPMController::class, 'import']);

    Route::get('/admin/classroom-kpm/student-score', [AdminClassroomController::class, 'studentScore']);

    Route::get('/admin/certificate/nilai-ppkpm', [CertificateController::class, 'nilaiPPKPM']);
    Route::get('/admin/certificate/settings', [CertificateController::class, 'settings']);
});



Route::middleware(['auth', 'supervisor'])->group(function () {
    Route::get('/supervisor/dashboard', [SupervisorController::class, 'index'])->name("supervisor.dashboard");
    Route::get('/supervisor/daftarmahasiswappl', [SupervisorController::class, 'daftarmahasiswappl']);
    Route::get('/supervisor/editnilai/{id}', [SupervisorController::class, 'editnilai']);
    Route::patch('/supervisor/updatenilai/{id}', [SupervisorController::class, 'updatenilai']);
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/supervisor/dashboard', [SupervisorController::class, 'index'])->name("supervisor.dashboard");
});

Route::middleware(['auth', 'user'])->group(function () {
    // Route::get('/', [HomeControler::class, 'index'])->name("frontpage")->middleware(['profil', 'open_kpm']);
    Route::get('/kpm-vacancies', [HomeControler::class, 'index'])->name("frontpage")->middleware(['profil', 'open_kpm']);
    Route::get('/ppl-vacancies', [LowonganPPL::class, 'all'])->name('lownganppl')->middleware(['profil', 'open_ppl']);

    Route::get('/classroom', [StudentClassroomController::class, 'home']);

    Route::get('/kpm-vacancies/detail/{id}', [LowonganKPM::class, 'index'])->name("lowongankpm.detail")->middleware(['profil']);
    Route::post('/lowongankpm/lamar', [LowonganKPM::class, 'lamar'])->name('lowongankpm.lamar')->middleware(['profil']);
    Route::get('/my-proposal', [RiwayatLamaran::class, 'index'])->name('riwayat')->middleware(['profil']);
    Route::get('/lowonganppl', [LowonganPPL::class, 'all'])->name('lownganppl')->middleware(['profil', 'open_ppl']);
    Route::get('/ppl-vacancies/detail/{id}', [LowonganPPL::class, 'detail'])->name('lownganppl.detail')->middleware(['profil']);
    Route::post('/lowonganppl/lamar', [LowonganPPL::class, 'lamar'])->name('lownganppl.lamar')->middleware(['profil']);
    Route::get('/profil', [MahasiswaProfilController::class, 'index'])->name("profil");
    Route::get('/grade', [NilaiController::class, 'index'])->name("nilai")->middleware(['profil']);
    Route::post('/profil/save', [MahasiswaProfilController::class, 'save'])->name('profil.save')->middleware(['save_profil']);

    Route::get('/student/classroom/{id}/task', [StudentClassroomController::class, 'tasks']);
    Route::get('/student/classroom/{id_kelas}/task/detail/{id_tugas}', [StudentClassroomController::class, 'detail_tugas']);


    Route::get('/student/classroom-ppl/tasks', [MahasiswaClassroomPPLController::class, 'tasks']);
    Route::get('/student/classroom-ppl/tasks/{id_task}', [MahasiswaClassroomPPLController::class, 'detailTask']);
});


// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/', [MahasiswaProfilController::class, 'default']);


Route::get('/pw', [testcontroller::class, 'index'])->name('index');
Route::get('/certificate', function () {
    return view('certificate');
});



Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
require __DIR__ . '/super_admin.php';
