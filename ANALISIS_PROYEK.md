# Analisis Menyeluruh Proyek IDC v2

> **Tanggal analisis:** 21 Oktober 2026
> **Branch aktif:** `development` — commit terakhir `c13d8b8` ("Update fitur bimbingan mahasiswa & dosen")
> **Sifat audit:** baca-saja (*read-only*). Tidak ada source code yang diubah.
> **Dokumen pendamping:** `RINGKASAN_PROYEK.md` (ringkasan arsitektur sebelumnya, 16 Oktober 2026) dan `CATATAN_SUPERVISOR_OPTION_FIX.md`.

---

## 1. Ringkasan Eksekutif

**IDC (Instructional Development Center)** adalah aplikasi web monolitik berbasis **Laravel 11 + Inertia.js + React 18** untuk mengelola kegiatan akademik **PPKPM** (PPL + KPM) di Fakultas Tarbiyah dan Keguruan (FTK) UIN Ar-Raniry Banda Aceh.

Cakupan sistem:

- Pendaftaran mahasiswa dengan verifikasi otomatis ke **Sevima SIAKAD Cloud** (NIM, tanggal lahir, SKS, nilai Micro Teaching).
- Pengelolaan **lowongan/kuota** penempatan PPL (sekolah) dan KPM (gampong/desa).
- **Lamaran mahasiswa** ke lokasi PPL/KPM.
- **Classroom online** untuk KPM dan PPL (tugas, submission, komentar publik/privat, penilaian).
- Modul **Bimbingan** mahasiswa–dosen (fitur baru, commit terakhir).
- Penilaian multi-pihak: Keuchik, Guru Pamong, Supervisor KPM, Supervisor PPL.
- **Rekap nilai PPKPM** melalui database view + ekspor Excel + cetak sertifikat PDF (DomPDF).
- Dashboard dan data statistik publik (**Data Rekap** mahasiswa aktif per prodi).
- Import/export Excel untuk mahasiswa, supervisor, sekolah, desa, lowongan, dan nilai.

Secara fungsional aplikasi sudah sangat kaya. Audit menemukan **satu masalah keamanan tingkat kritis**: **98 route tidak memiliki middleware autentikasi**, termasuk endpoint yang dapat mengubah data admin, nilai, submission, dan akun pengguna. Masalah tersebut **telah diperbaiki pada 21 Oktober 2026** — lihat bagian 13 untuk detail dan hasil verifikasi.

---

## 2. Statistik Proyek

| Komponen | Jumlah |
| :--- | ---: |
| Controller (`app/Http/Controllers`) | 83 file |
| Model Eloquent (`app/Models`) | 30 file |
| Migration (`database/migrations`) | 46 file |
| Halaman React (`resources/js/Pages`) | 139 file `.jsx` |
| Komponen React (`resources/js/Components`) | 118 file `.jsx` |
| Total route terdaftar (`php artisan route:list`) | 359 entri |
| Route tanpa middleware `auth` | 17 entri (setelah perbaikan 21 Okt 2026; semuanya route publik yang disengaja) |
| Tabel aplikasi (di luar tabel framework) | ±29 tabel |
| File yang belum di-commit | 19 modified, 306 deleted, 316 untracked |

---

## 3. Tech Stack

| Layer | Teknologi | Keterangan |
| :--- | :--- | :--- |
| Backend | **Laravel Framework 11.11.1**, PHP `^8.2` | Routing, Eloquent, middleware role, transaksi DB |
| Auth | Laravel Breeze + **Laravel Sanctum 4** | Session web + token API (`HasApiTokens`) |
| Frontend | **React 18**, **Inertia.js 1**, Ziggy 2 | SPA tanpa API terpisah untuk halaman web |
| Build | **Vite 5**, `laravel-vite-plugin`, React plugin | Entry: `resources/js/app.jsx` |
| Styling | **Tailwind CSS 3**, **MUI 5**, Emotion | Kombinasi utility Tailwind dan komponen MUI |
| Ikon/Chart | Heroicons, Lucide, MUI Icons, **Chart.js**, react-chartjs-2, **Recharts** | Dashboard dan statistik |
| Database | **MySQL 8.0** | Nama DB lokal: `u393604037_idc` |
| API Eksternal | **Sevima SIAKAD Cloud REST API** | `config/services.php` → `SEVIMA_BASE_URL`, `SEVIMA_APP_KEY`, `SEVIMA_APP_SECRET` |
| Excel | **Maatwebsite Excel 3.1** | Import/export `.xlsx` |
| PDF | **Barryvdh DomPDF 3.1** | Sertifikat dan surat nilai |
| Deployment | Docker (`php:8.2-fpm`), Nginx, docker-compose, VPS Linux | `Dockerfile`, `docker-compose.yml`, `docker/` |
| Queue/Cache | Database queue, file cache, cookie session | Lihat `.env` lokal |

---

## 4. Struktur Direktori Penting

```
idc_v2/
├── app/
│   ├── Console/Commands/GenerateDataRekapCommand.php   # rekap:generate (background sync Sevima)
│   ├── Exports/                                        # 13 class export Excel
│   ├── Imports/                                        # import Excel (mahasiswa, PPL, supervisor, prodi)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/                                  # backoffice admin (34 controller)
│   │   │   ├── Auth/                                   # login, verifikasi Sevima, registrasi PPKPM
│   │   │   ├── Mahasiswa/                              # profil, lowongan, nilai, classroom PPL
│   │   │   ├── OperatorKecamatan/                      # dashboard + data camat/keuchik
│   │   │   ├── OperatorSekolah/                        # dashboard + data kepsek/pamong
│   │   │   ├── Student/                                # API classroom KPM (task, submission, comment)
│   │   │   ├── SuperAdmin/                             # gelombang & import data
│   │   │   ├── Supervisor/                             # DPL PPL (penilaian langsung)
│   │   │   └── SupervisorKPM/                          # DPL KPM (classroom & penilaian)
│   │   ├── Middleware/                                 # 15 middleware (role, profil, pendaftaran)
│   │   └── Resources/                                  # API resource untuk classroom
│   ├── Models/                                         # 30 model Eloquent
│   └── Services/
│       ├── SevimaService.php                           # HTTP client Sevima
│       └── Wilayah/                                    # data provinsi/kabupaten/kecamatan/desa
├── database/migrations/                                # 46 migrasi
├── resources/
│   ├── js/
│   │   ├── Components/                                 # 118 komponen (admin, mahasiswa, operator, dll.)
│   │   ├── Layouts/                                    # layout per role
│   │   ├── Pages/                                      # 139 halaman Inertia
│   │   └── app.jsx                                     # entry point React
│   └── views/                                          # app.blade.php + template sertifikat
├── routes/
│   ├── web.php                                         # 321 baris — halaman Inertia
│   ├── api.php                                         # 343 baris — endpoint JSON/ajax
│   ├── auth.php                                        # login/register/verifikasi
│   ├── super_admin.php                                 # route khusus super admin
│   └── console.php
├── nilai_ppkpm_view.sql                                # definisi view nilai (gitignored)
├── u393604037_idc.sql                                  # dump DB (gitignored)
├── RINGKASAN_PROYEK.md                                 # dokumen arsitektur lama (gitignored)
└── ANALISIS_PROYEK.md                                  # dokumen ini
```

---

## 5. Peran Pengguna & Hak Akses

Role disimpan pada kolom `users.role`. Terdapat **7 role**:

| Role | Landing page setelah login | Middleware | Tanggung jawab utama |
| :--- | :--- | :--- | :--- |
| `super_admin` | `/superadmin/data/setting` | `super_admin`, `super_admin_api` | Gelombang, import data massal |
| `admin` | `/admin/dashboard` | `admin`, `admin_api` | Seluruh backoffice: master data, alokasi, verifikasi, nilai, sertifikat |
| `user` (mahasiswa) | `/profil` | `user`, `user_api`, `profil` | Registrasi, profil, lamaran KPM/PPL, classroom, nilai |
| `supervisor` (DPL PPL) | `/supervisor/dashboard` | `supervisor` | Daftar mahasiswa PPL, input nilai PPL |
| `supervisor_kpm` (DPL KPM) | `/supervisor/classroom/home` | `supervisor-kpm` | Classroom KPM, penilaian tugas/submission |
| `opt-sekolah` | `/operator-sekolah/dashboard` | `opt-sekolah` | Data Kepala Sekolah & Guru Pamong, classroom sekolah |
| `opt-kecamatan` | `/operator-kecamatan/dashboard` | `opt-kecamatan` | Data Camat/Keuchik, classroom desa/kecamatan |

Middleware role bekerja dengan dua pola:

1. **Pola `match`** (`Admin`, `SuperAdmin`, `Supervisor`): mengembalikan redirect berdasarkan role lain.
2. **Pola `if/else`** (`User`, `OptSekolah`, `OptKecamatan`, `SupervisorKPM`): redirect ke dashboard role masing-masing.

Alias middleware didaftarkan di `bootstrap/app.php:39-58`.

> **Catatan penting:** Perubahan belum di-commit mengubah landing page operator dari halaman data (`/operator-sekolah/data/kepsek-pamong`, `/operator-kecamatan/data/camat-keuchik`) menjadi **dashboard** (`/operator-sekolah/dashboard`, `/operator-kecamatan/dashboard`). Perubahan ini konsisten di `AuthenticatedSessionController` dan 7 middleware role.

---

## 6. Modul & Alur Bisnis

### 6.1 Autentikasi & Registrasi Mahasiswa

**Alur:**

1. Mahasiswa membuka `/verifikasi-mahasiswa`.
2. `VerifikasiMahasiswaController@check` memanggil:
   - `GET /mahasiswa/{nim}` → biodata + tanggal lahir.
   - `GET /mahasiswa/{nim}/perwalian` → semester & IPK.
   - `GET /mahasiswa/{nim}/transkrip` → total SKS + nilai Micro Teaching.
3. Validasi:
   - Tanggal lahir harus cocok.
   - NIM belum terdaftar di `users`/`mahasiswa_tbl`.
   - Nilai Micro Teaching minimal **B-** (`A`, `A-`, `B+`, `B`, `B-`).
   - Total SKS minimal **132**.
   - Khusus prodi MPI, nama mata kuliah Micro Teaching berbeda ("Micro Profesi / PLP I").
4. Bila syarat gagal → mahasiswa dapat mengajukan **Dispensasi Syarat** (`dispensasi_syarat`), yang harus disetujui admin.
5. Jika lolos → data disimpan di session `verified_mahasiswa`, lalu diarahkan ke `/registrasi-ppkpm`.
6. `RegistrasiPPKPMController@store` membuat `users` + `mahasiswa_tbl` dalam satu transaksi, mengunggah 3 dokumen PDF (transkrip, surat pernyataan, surat kesiapan), lalu login otomatis dan membuat token Sanctum.

**File kunci:**
- `app/Http/Controllers/Auth/VerifikasiMahasiswaController.php:29` (`check`)
- `app/Http/Controllers/Auth/RegistrasiPPKPMController.php:43` (`store`)
- `app/Http/Controllers/Admin/DispensasiSyaratController.php`
- `routes/auth.php:24-36`

### 6.2 Profil Mahasiswa

- Halaman `/profil` menampilkan data mahasiswa + prodi + link grup.
- `Mahasiswa\ProfilController@save` menangani:
  - Ganti password (min. 8 karakter).
  - Update alamat asal & alamat sekarang (kode wilayah).
  - Update IPK, semester, prodi, nilai micro teaching, cluster kegiatan, jenis kelamin, no. HP.
  - Upload dokumen PDF maks. 500 KB.
- Status profil: `null` → belum lengkap, `submitted` → menunggu review, `revisi` → diperbaiki, `rejected`, `accepted`.
- Middleware `Profil` memblokir akses lowongan/classroom jika profil belum `accepted`.
- Middleware `LengkapiProfil` memblokir penyimpanan profil bila admin menutup `data_tbl.buka_lengkapi_profil`.

**File kunci:** `app/Http/Controllers/Mahasiswa/ProfilController.php:29,44`; `app/Http/Middleware/Profil.php`.

### 6.3 KPM (Kuliah Pengabdian Masyarakat)

- Admin membuat **tempat KPM** (`tempat_kpm_tbl`) yang terhubung ke `master_desa_tbl` dan `gelombang_tbl`.
- Kuota: `qouta` (total), `quota_lk`, `quota_pr`.
- Mahasiswa melihat lowongan KPM di `/kpm-vacancies` dan detail `/kpm-vacancies/detail/{id}`.
- `LamaranKPM` dibuat dengan status langsung **`accepted`** bila kuota masih tersedia; sistem menolak jika:
  - Sudah pernah melamar ke tempat yang sama.
  - Sudah diterima di tempat KPM lain.
  - Kuota total/pria/wanita penuh.
- Riwayat lamaran di `/my-proposal`.

**File kunci:**
- `app/Http/Controllers/Mahasiswa/LowonganKPM.php:15,48`
- `app/Http/Controllers/Mahasiswa/RiwayatLamaran.php`
- `app/Http/Controllers/Admin/TempatKPM.php`
- `app/Http/Controllers/Admin/KPMAlocation.php`

### 6.4 PPL (Praktik Pengalaman Lapangan)

- Admin mengelola **master sekolah** (`sekolah_master`) dan **kelas PPL** (`sekolah_tbl` + `kelas_ppl`).
- Lowongan PPL (`lowongan_ppl_tbl`) berisi kuota per sekolah per prodi.
- Mahasiswa hanya melihat lowongan sesuai `id_prodi`-nya (`Mahasiswa\LowonganPPL@all`).
- Detail lowongan menampilkan statistik pelamar, jumlah pria/wanita, dan daftar pelamar yang diterima.
- `Mahasiswa\LowonganPPL@lamar` membuat `lamaran_ppl_tbl` dengan status **`accepted`** bila kuota tersedia.
- Riwayat lamaran sama dengan KPM (`/my-proposal`).

**File kunci:**
- `app/Http/Controllers/Mahasiswa/LowonganPPL.php:19,85,94`
- `app/Http/Controllers/Admin/PPL/LowonganPPLController.php`
- `app/Http/Controllers/Admin/PPL/TempatPPLController.php`
- `app/Http/Controllers/Admin/PplAlocationController.php`

### 6.5 Alokasi & Kuota (Admin)

- **Alokasi PPL** (`Admin/PplAlocationController`): grid sekolah × prodi, generate lowongan massal, update kuota massal, hapus massal. Endpoint: `api/admin/ppl/alocation`, `bulk`, `bulkSave`, `bulkDeleteLowongan`.
- **Alokasi KPM** (`Admin/KPMAlocation`): grid tempat KPM × kuota total/L/P, simpan massal menggunakan `CASE WHEN` SQL, generate/hapus lowongan massal.
- Halaman React: `Admin/pages/PPL/AlokasiPPL/AlokasiPPL.jsx`, `Admin/pages/KPM/ALokasiKPM/AlokasiKPM.jsx`.

### 6.6 Classroom KPM

- Dosen `supervisor_kpm` membuka `/supervisor/classroom/home` dan melihat kelas KPM yang diampu (`tempat_kpm_tbl.username_supervisor`).
- Tugas (`task`) memiliki nama, tenggat, tipe.
- Mahasiswa mengumpulkan link submission (`task_submission`) dengan status & skor.
- Komentar:
  - Publik: `comment.tipe = 'public'`.
  - Privat: `comment.tipe = 'private'`, dengan `receiver` username mahasiswa.
- Supervisor dapat memberi/mengubah nilai submission (`SupervisorKPM\SupervisorSubmissionController@scoreTaskSubmissions`).
- Admin dapat melihat rekap nilai seluruh kelas dan mengekspor Excel (`Admin\ClassroomController@queryNilai`, `exportNilaiKPM`).

**File kunci:**
- `app/Http/Controllers/Student/TaskController.php`
- `app/Http/Controllers/Student/SubmissionController.php`
- `app/Http/Controllers/Student/CommentController.php`
- `app/Http/Controllers/SupervisorKPM/ClassroomController.php`
- `app/Http/Controllers/SupervisorKPM/SupervisorSubmissionController.php`

### 6.7 Classroom PPL

- Pola serupa KPM tetapi menggunakan tabel `task_ppl`, `task_ppl_submission`, dan `conversation_classroom_ppl`.
- Kelas PPL adalah `sekolah_tbl` (satu sekolah + gelombang), dengan `username_supervisor`.
- Mahasiswa mengakses `/student/classroom-ppl/tasks` dan detail tugas.
- Supervisor PPL mengakses `/supervisor-ppl/classroom/{id_sekolah}`.
- Penilaian akhir PPL dapat dilakukan lewat dua jalur:
  1. **Classroom PPL** — `Admin\ClassroomPPLController@updateNilai` (nilai pamong & supervisor PPL).
  2. **Halaman Supervisor PPL** — `Supervisor\SupervisorController@updatenilai` (nilai + upload instrumen PDF).

**File kunci:**
- `app/Http/Controllers/Mahasiswa/ClassroomPPLController.php`
- `app/Http/Controllers/Admin/ClassroomPPLController.php`
- `app/Http/Controllers/Supervisor/SupervisorController.php`

### 6.8 Bimbingan Mahasiswa–Dosen (fitur terbaru)

Commit `c13d8b8` menambahkan modul bimbingan:

- Tabel `bimbingan_tbl` (migrasi `2026_10_19_000001_create_bimbingan_table.php`).
- Mahasiswa membuat catatan bimbingan (`tipe` = `kpm`/`ppl`, `id_kelas`, `bimbingan_ke`, tanggal, judul, deskripsi).
- Status: `pending` → `approved` / `rejected`.
- Dosen dapat memvalidasi dengan catatan.
- Target minimal **4 bimbingan approved** (`minRequired = 4`).
- Endpoint (web + auth):
  - `GET/POST /bimbingan`
  - `POST /bimbingan/{id}/update`
  - `DELETE /bimbingan/{id}`
  - `GET /supervisor/bimbingan/{tipe}/{id_kelas}`
  - `POST /supervisor/bimbingan/{id}/validate`

**File kunci:** `app/Http/Controllers/BimbinganController.php`, `app/Models/Bimbingan.php`, `resources/js/Components/Bimbingan/`.

> **Temuan:** model dan controller mereferensikan `file_lampiran`, tetapi kolom tersebut **tidak ada** di migrasi `bimbingan_tbl`. Lihat bagian 13.

### 6.9 Operator Sekolah (`opt-sekolah`)

- Akun operator dibuat admin melalui `POST /api/admin/admin-sekolah/generate` (dari `sekolah_master`).
- Operator terhubung ke satu sekolah (`operator_sekolah_tbl.id_sekolah`).
- Dashboard baru menampilkan:
  - Profil sekolah.
  - Daftar kelas PPL per gelombang.
  - Jumlah mahasiswa, guru pamong, nama kepala sekolah.
- Mengelola data **Kepala Sekolah & Guru Pamong** (`ampraham_ppl_tbl`), termasuk dokumen PDF, rekening, NPWP, dsb.
- Melihat classroom sekolah (`getClassroomData`).

**File kunci:** `app/Http/Controllers/OperatorSekolah/OpratorSekolahController.php:24`, `app/Http/Controllers/Admin/AdminSekolahController.php:83`.

### 6.10 Operator Kecamatan (`opt-kecamatan`)

- Akun dibuat admin melalui `POST /api/admin/admin-kecamatan/generate`.
- Terhubung ke satu kecamatan (`operator_kecamatan_tbl.id_kecamatan`).
- Dashboard baru menampilkan daftar tempat KPM di kecamatan, jumlah mahasiswa, dan nama keuchik.
- Mengelola data **Camat/Keuchik** (`ampraham_kpm_tbl`).
- Melihat classroom desa.

**File kunci:** `app/Http/Controllers/OperatorKecamatan/OperatorKecamatanController.php:19`, `app/Http/Controllers/Admin/AdminKecamatanController.php:34`.

### 6.11 Supervisor PPL (`supervisor`)

- Melihat daftar mahasiswa PPL yang dibimbing di `/supervisor/daftarmahasiswappl`.
- Daftar diambil dari `mahasiswa_tbl` → `ppl_tbl` → `sekolah_tbl` → `users`, difilter `sekolah_tbl.username_supervisor = Auth::user()->username`.
- Input `nilai_supervisor_ppl`, `nilai_pamong`, dan upload instrumen penilaian PDF.
- Status `done` bila ketiga field terisi.

**File kunci:** `app/Http/Controllers/Supervisor/SupervisorController.php:18,37,70,93`.

### 6.12 Sertifikat & Rekap Nilai

- **Rekap Nilai PPKPM** (`CertificateController`):
  - Sumber data: view `nilai_ppkpm_view`.
  - Filter pencarian NIM/nama/prodi dan gelombang.
  - Ekspor Excel: seluruh prodi (`RekapNilaiExport`) atau per prodi (`NilaiPPKPMPerProdi`).
- **Cetak sertifikat mahasiswa** (`CertificateController@downloadCertificate`):
  - Mengambil data dari `nilai_ppkpm_view`.
  - Nomor surat di-generate dari `sertifikat_tbl` + `mahasiswa_tbl.kode`.
  - Rendering PDF dengan DomPDF (`resources/views/certificate.blade.php`).
- **Sertifikat sekolah/guru** (`Admin/SertifikatSekolahController`, `SchoolCertificateController`):
  - Pengaturan nomor surat, tanggal, periode PPL, status cetak.
  - Template `teacher_certificate.blade.php`, `teacher_kepsek.blade.php`.
- **Sertifikat mahasiswa (baru)** (`Admin/SertifikatMahasiswaController`): CRUD setting sertifikat per gelombang, statistik, toggle status cetak, bulk delete.

**File kunci:** `app/Http/Controllers/CertificateController.php`, `app/Http/Controllers/SchoolCertificateController.php`, `resources/views/*.blade.php`.

### 6.13 Data Rekap Publik

- Halaman publik: `/data-rekap` dan `/data_rekap` (`DataRekapController@index`).
- API publik dengan rate limit `30/menit`:
  - `GET /api/data-rekap`
  - `GET /api/data-rekap/status`
  - `GET|POST /api/data-rekap/refresh`
- Data diambil dari Sevima `GET /mahasiswa?f-status_mahasiswa=Aktif` dan diagregasi **on-the-fly per halaman** (< 1 MB RAM).
- Hasil disimpan di:
  - Laravel Cache (`server_rekap_mahasiswa_v3_{start}_{current}`, 6 bulan).
  - File persistent `storage/app/rekap_mahasiswa_persistent.json`.
- Background sync melalui `php artisan rekap:generate` (`GenerateDataRekapCommand`), dipanggil dengan `popen`/`exec` agar browser tidak timeout.
- Exclude prodi PPG.
- Rentang tahun: 6 tahun terakhir (2020–2026 pada 2026).

**File kunci:** `app/Http/Controllers/DataRekapController.php`, `app/Console/Commands/GenerateDataRekapCommand.php`, `resources/js/Pages/DataRekap/Index.jsx`.

### 6.14 Master Data & Manajemen Pengguna (Admin)

| Modul | Controller | Halaman |
| :--- | :--- | :--- |
| Master sekolah | `Admin\SekolahController` | `Admin/pages/Data/MasterSekolah` |
| Master desa | `Admin\DesaMasterController` | `Admin/pages/Data/MasterDesa` |
| Prodi | `Admin\ProdiController` | `Admin/pages/Data/Prodi` |
| Program studi / user | `Admin\MahsiswaController` | `Admin/pages/Pengguna/Mahasiswa` |
| Admin | `Admin\AdminController` | `Admin/pages/Pengguna/Admin` |
| Supervisor PPL | `Admin\SupervisorController` | `Admin/pages/Pengguna/Supervisor` |
| Supervisor KPM | `Admin\SupervisorKPMController` | `Admin/pages/Pengguna/SupervisorKPM` |
| Operator sekolah | `Admin\AdminSekolahController` | `Admin/pages/Pengguna/AdminSekolah` |
| Operator kecamatan | `Admin\AdminKecamatanController` | `Admin/pages/Pengguna/AdminKecamatan` |
| Kepala sekolah/pamong | `Admin\KepsekkPamongController` | `Admin/pages/Data/KepsekPamong` |
| Camat/keuchik | `Admin\CamatKeuchikController` | `Admin/pages/Data/CamatKeuchik` |
| Dispensasi syarat | `Admin\DispensasiSyaratController` | `Admin/pages/Pengguna/Mahasiswa/DispensasiSyarat` |
| Pengaturan global | `SettingController` | `Admin/pages/Data/setting/Setting` |
| Gelombang | `SuperAdmin\GelombangController` | `SuperAdmin/settings/Setting` |
| Import massal | `SuperAdmin\ImportDataController` | `SuperAdmin/Import/ImportData` |

### 6.15 Import & Export Excel

**Import (`app/Imports/`):**
- `MahasiswaImport`
- `SupervisorImport`
- `ProdiImport`
- `TempatPPLImport` (multi-sheet: data lokasi + referensi prodi)
- `PesertaPPLImport` (multi-sheet)
- `PelamarPPLImport`
- `LowonganPPLImport`
- `SuperAdmin\MahasiswaImport`, `SuperAdmin\SupervisorImport`

**Export (`app/Exports/`):**
- `StudentExport`, `SupervisorExport`
- `CamatKeuchikExport`, `KepsekPamongExport`
- `NilaiKPMExport`, `ExportNilaiPPL`, `NilaiPPKPMPerProdi`, `RekapNilaiExport`
- `OperatorKecamatanExport`, `OperatorProdiExport`
- Template: `PelamarPPLTemplateExport`, `PesertaPPLTemplateExport`, `TempatPPLTemplateExport`

---

## 7. Basis Data

### 7.1 Daftar Tabel Aplikasi

| Kelompok | Tabel | Fungsi |
| :--- | :--- | :--- |
| Akun & akses | `users` | Akun semua role; `username` unik (NIM untuk mahasiswa) |
| | `operator_sekolah_tbl` | Mapping email operator → sekolah |
| | `operator_kecamatan_tbl` | Mapping email operator → kecamatan |
| | `personal_access_tokens`, `sessions`, `cache`, `jobs` | Framework Sanctum/session/queue |
| Akademik | `gelombang_tbl` | Periode/gelombang pendaftaran, `active` |
| | `prodi_tbl` | Program studi |
| | `mahasiswa_tbl` | Data mahasiswa, dokumen, nilai, status, gelombang |
| | `dispensasi_syarat` | Pengecualian syarat micro teaching/SKS |
| PPL | `sekolah_master` | Master sekolah (nama, wilayah) |
| | `sekolah_tbl` | Kelas PPL per gelombang + supervisor |
| | `kelas_ppl` | Relasi sekolah ↔ gelombang ↔ supervisor |
| | `ppl_tbl` | Data PPL legacy (prodi/sekolah) |
| | `lowongan_ppl_tbl` | Kuota lowongan PPL per sekolah/prodi |
| | `lamaran_ppl_tbl` | Lamaran PPL mahasiswa |
| | `ampraham_ppl_tbl` | Data kepsek/pamong + dokumen + rekening |
| KPM | `master_desa_tbl` | Master desa/gampong |
| | `tempat_kpm_tbl` | Tempat KPM + kuota total/L/P + gelombang |
| | `lamaran_kpm_tbl` | Lamaran KPM mahasiswa |
| | `ampraham_kpm_tbl` | Data camat/keuchik + rekening |
| Classroom KPM | `task` | Tugas KPM |
| | `task_submission` | Submission + skor tugas KPM |
| | `comment` | Komentar publik/privat classroom KPM |
| Classroom PPL | `task_ppl` | Tugas PPL |
| | `task_ppl_submission` | Submission + skor tugas PPL |
| | `conversation_classroom_ppl` | Komentar classroom PPL |
| Bimbingan | `bimbingan_tbl` | Catatan bimbingan + validasi dosen |
| Sertifikat | `sertifikat_tbl` | Pengaturan nomor surat PPKPM per gelombang |
| | `sertifikat_sekolah_tbl` | Pengaturan sertifikat sekolah/guru |
| Pengaturan | `data_tbl` | Switch global: pendaftaran, profil, lamaran, cetak sertifikat, link grup |
| View | `nilai_ppkpm_view` | View MySQL rekap nilai PPKPM |

### 7.2 Relasi Inti (ringkas)

```
users (username)
 ├── mahasiswa_tbl (nim)           1:1
 │    ├── prodi_tbl (id_prodi)     N:1
 │    ├── lamaran_kpm_tbl         1:N  → tempat_kpm_tbl
 │    ├── lamaran_ppl_tbl         1:N  → lowongan_ppl_tbl → sekolah_tbl
 │    ├── task_submission         1:N  → task
 │    ├── task_ppl_submission     1:N  → task_ppl
 │    ├── bimbingan_tbl           1:N
 │    └── dispensasi_syarat       1:1 (berdasarkan nim)
 ├── operator_sekolah_tbl         1:1  → sekolah_master
 ├── operator_kecamatan_tbl       1:1  (kode kecamatan)
 └── comment / conversation       pembuat & penerima

sekolah_master
 ├── sekolah_tbl (id_sekolah)     1:N  → gelombang_tbl
 │    ├── lowongan_ppl_tbl        1:N  → prodi_tbl
 │    └── ampraham_ppl_tbl        1:N
 └── operator_sekolah_tbl         1:N

master_desa_tbl
 └── tempat_kpm_tbl (id_desa)     1:N  → gelombang_tbl
      ├── lamaran_kpm_tbl         1:N
      └── ampraham_kpm_tbl (id_desa/id_kecamatan)
```

### 7.3 View `nilai_ppkpm_view` & Formula Penilaian

Didefinisikan di `database/migrations/2026_07_28_062117_create_nilai_ppkpm_view.php` dan `nilai_ppkpm_view.sql`.

**Komponen nilai:**

| Komponen | Formula |
| :--- | :--- |
| `PK_KPM` | `COALESCE(nilai_keuchik, 0) × 0.75` |
| `LK_KPM` | `COALESCE(nilai_supervisor_kpm, 0) × 0.25` |
| `SM_KPM` | `PK_KPM + LK_KPM` |
| `PK_PPL` | `COALESCE(nilai_pamong, 0) × 0.75` |
| `LK_PPL` | `COALESCE(nilai_supervisor_ppl, 0) × 0.25` |
| `SM_PPL` | `PK_PPL + LK_PPL` |
| **`nilai_ppkpm`** | **`(SM_KPM + SM_PPL) / 2`** |

**Konversi huruf mutu:**

| Huruf | Rentang |
| :--- | :--- |
| A | ≥ 90 |
| A- | 85 – < 90 |
| B+ | 78 – < 85 |
| B | 72 – < 78 |
| B- | 68 – < 72 |
| C+ | 65 – < 68 |
| C | 60 – < 65 |
| D | 50 – < 60 |
| E | < 50 |

**Sumber nilai di view:**

- `nilai_supervisor_kpm` = rata-rata `task_submission.score` **kecuali `id_tugas = 8`**.
- `nilai_keuchik` = `task_submission.score` terbaru untuk **`id_tugas = 8`**.
- `nilai_pamong` dan `nilai_supervisor_ppl` = kolom di `mahasiswa_tbl`.
- `id_gelombang_tertinggi` = `GREATEST` gelombang KPM/PPL yang diterima.
- Nomor surat digabung dari `sertifikat_tbl`: `kode + no_surat + kode_universitas + kode_idc + kode_jenis_surat + bulan_tahun`.

> **Catatan teknis:** View ini bergantung pada **ID tugas hardcoded** (`id_tugas = 8` untuk nilai keuchik) dan formula `sum(score) / count(0) - 1` untuk rata-rata supervisor KPM. Keduanya rapuh jika data tugas berubah.

---

## 8. Integrasi Sevima SIAKAD Cloud

**Service:** `app/Services/SevimaService.php`

| Method | Endpoint | Kegunaan |
| :--- | :--- | :--- |
| `getMahasiswa()` | `GET /mahasiswa` | Data mahasiswa (dipakai rekap) |
| `getMahasiswaByNim($nim)` | `GET /mahasiswa/{nim}` | Biodata & tanggal lahir |
| `getPerwalianMahasiswa($nim)` | `GET /mahasiswa/{nim}/perwalian` | Semester & IPK |
| `getTranskripMahasiswa($nim)` | `GET /mahasiswa/{nim}/transkrip` | SKS & nilai Micro Teaching |

**Konfigurasi:** `config/services.php:38-42`

```php
'sevima' => [
    'base_url' => env('SEVIMA_BASE_URL', 'https://api.sevimaplatform.com/siakadcloud/v1'),
    'app_key' => env('SEVIMA_APP_KEY'),
    'app_secret' => env('SEVIMA_APP_SECRET'),
],
```

Header: `X-App-Key`, `X-Secret-Key`, `Accept: application/json`.

**Catatan:** Service menggunakan `Http::withoutVerifying()` sehingga verifikasi TLS dinonaktifkan. Ini mempermudah koneksi di server tertentu, tetapi menurunkan keamanan koneksi.

---

## 9. Arsitektur Frontend

- Entry: `resources/js/app.jsx` → `createInertiaApp`, `resolvePageComponent` untuk semua `Pages/**/*.jsx`.
- Root view: `resources/views/app.blade.php` (`@routes`, `@viteReactRefresh`, `@vite`, `@inertia`).
- Axios global `withCredentials = true`.
- Layout terpisah per role:
  - `Admin/AdminLayout.jsx`
  - `Mahasiswa/Classroom/ClassroomLayout.jsx`
  - `OperatorSekolahLayout.jsx`, `OperatorKecamatanLayout.jsx`
  - `SuperAdmin/SuperAdminLayout.jsx`
  - `SupervisorKPM/Classroom/ClassroomLayout.jsx`, `HomeClassroomLayout.jsx`
  - `SupervisorKPM/ClassroomPPL/SupervisorPPLLayout.jsx`
- Data global dibagikan oleh `HandleInertiaRequests`:
  - `auth.user`
  - `auth.data_kelas`
  - `auth.has_lokasi`, `has_lokasi_kpm`, `has_lokasi_ppl`
  - `flash.message`, `flash.status`, `flash.micro_warning`

Pola komunikasi:

1. **Inertia page load** untuk halaman utama (controller → `Inertia::render`).
2. **Axios ke `/api/*`** untuk tabel, modal, autocomplete, submit form, export, dan polling (banyak endpoint API tidak memakai auth — lihat temuan).

---

## 10. Pola Routing & Middleware

- **Web (`routes/web.php`)**: halaman Inertia, dikelompokkan berdasarkan middleware role.
- **API (`routes/api.php`)**: endpoint JSON.
  - Grup ber-auth: `auth:sanctum` + `super_admin_api` / `user_api` / `admin_api` / `role:admin`.
  - **Sebagian besar endpoint lain berada di luar grup auth** (lihat temuan kritis).
- **Auth (`routes/auth.php`)**: guest routes + auth routes (Breeze).
- **Super admin (`routes/super_admin.php`)**: `/superadmin/data/setting`, `/superadmin/data/import`.
- CSRF: grup `api` Laravel tidak memakai `VerifyCsrfToken`; perlindungan CSRF hanya berlaku pada sesi web.
- Rate limit hanya diterapkan pada endpoint Data Rekap (`throttle:30,1`).

---

## 11. Deployment & Operasional

- **Docker:** `docker-compose.yml` menjalankan `app` (PHP-FPM), `nginx` (port 8000), `mysql:8.0` (port 33061).
- **Dockerfile:** `php:8.2-fpm` + Node/npm, `composer install --no-dev --optimize-autoloader`, `npm install && npm run build`.
- **Lokal:** Laragon, MySQL `u393604037_idc`, `APP_URL=http://127.0.0.1:8000`.
- **Build frontend:** `npm run build` (Vite production), hasil ke `public/build`.
- **Cache/config:** perlu `php artisan optimize:clear` setelah deploy; data rekap tetap aman karena ada fallback JSON.
- **Storage:** dokumen mahasiswa di `storage/app/public` (perlu `php artisan storage:link`).

---

## 12. Status Working Tree (belum di-commit)

Saat analisis, branch `development` memiliki perubahan berikut:

**Modified (19 file):**
- `.gitignore` — menambahkan `.claude/settings.local.json`.
- `AuthenticatedSessionController` — landing operator diarahkan ke dashboard.
- `Admin`, `OptKecamatan`, `OptSekolah`, `SuperAdmin`, `Supervisor`, `SupervisorKPM`, `User` middleware — redirect operator diarahkan ke dashboard; perbaikan typo `=` → `===` pada `OptSekolah`/`OptKecamatan`.
- `OperatorKecamatanController` — implementasi dashboard baru (+179 baris).
- `OpratorSekolahController` — implementasi dashboard baru (+199 baris).
- `resources/js/Pages/OperatorKecamatan/Dashboard.jsx` — redesain (+719 baris).
- `resources/js/Pages/OperatorSekolah/Dashboard.jsx` — redesain (+721 baris).
- `resources/js/Layouts/OperatorKecamatanLayout.jsx`, `OperatorSekolahLayout.jsx` — penyesuaian layout.
- `resources/js/Components/frontpage/Header.jsx` — penyesuaian header.
- `routes/web.php`, `routes/api.php` — penambahan route dashboard operator.

**Deleted / untracked:** seluruh aset `public/build/assets/*` lama dihapus dan diganti aset baru hasil rebuild (621 perubahan). `public/build/manifest.json` ikut berubah. Ini normal setelah `npm run build`, tetapi sebaiknya tidak dikomit jika build artefak tidak ingin dilacak.

**Perbaikan keamanan 21 Okt 2026:** perubahan tambahan pada `routes/api.php`, `routes/web.php`, dan `app/Http/Middleware/RoleMiddleware.php` (lihat bagian 13).

---

## 13. Temuan & Risiko

### Ringkasan Severity

| # | Severity | Temuan | Lokasi |
| :---: | :--- | :--- | :--- |
| 1 | **Kritis → ✅ Diperbaiki** | 98 route tanpa middleware autentikasi; banyak endpoint dapat mengubah data. Kini tersisa 17 route publik yang disengaja | `routes/api.php` |
| 2 | **Tinggi** | ID tempat KPM hardcoded `71` pada statistik detail | `Admin/TempatKPM.php:337-339` |
| 3 | **Tinggi** | Password default akun operator `ppkpm2025` | `AdminSekolahController.php:117`, `AdminKecamatanController.php:52` |
| 4 | **Tinggi** | Sertifikat & nilai dapat diunduh publik berdasarkan NIM | `routes/api.php:312-317`, `CertificateController.php:37` |
| 5 | **Sedang** | `User` middleware memanggil `$request->user()->role()` (method tidak ada) | `app/Http/Middleware/User.php:27` |
| 6 | **Sedang** | Kolom `file_lampiran` dipakai model/controller tetapi tidak ada di migrasi | `app/Models/Bimbingan.php:19`, `BimbinganController.php:48` |
| 7 | **Sedang** | Redirect `super_admin` ke `/admin/data/setting` berpotensi loop | `Admin.php:24`, `Supervisor.php:30` |
| 8 | **Sedang** | Cek duplikasi lamaran PPL memakai kolom `id` yang salah | `Mahasiswa/LowonganPPL.php:99` |
| 9 | **Sedang** | Lamaran KPM/PPL langsung `accepted` tanpa review admin | `LowonganKPM.php:66`, `LowonganPPL.php:107` |
| 10 | **Sedang** | `CertificateController` mengembalikan JSON sebelum PDF & berpotensi null dereference | `app/Http/Controllers/CertificateController.php:131,47` |
| 11 | **Sedang** | View nilai bergantung pada `id_tugas = 8` dan formula rata-rata janggal | `nilai_ppkpm_view.sql` |
| 12 | **Sedang** | Test bawaan Breeze tidak sesuai route aktual | `tests/Feature/Auth/*` |
| 13 | **Rendah** | `Http::withoutVerifying()` menonaktifkan verifikasi TLS ke Sevima | `SevimaService.php:20`, `DataRekapController.php` |
| 14 | **Rendah** | Import class tidak ada: `EasyController`, `LowonganKPMController` | `routes/web.php:30`, `routes/api.php:24` |
| 15 | **Rendah** | Model `TempatPPL` memetakan tabel `tempat_ppl_tbl` yang tidak dibuat migrasi | `app/Models/TempatPPL.php` |
| 16 | **Rendah** | Typo variabel `$tglLiarNormal` (tetap fallback ke `$tglLahirNormal`) | `VerifikasiMahasiswaController.php:213` |
| 17 | **Rendah** | Duplikasi controller/modul legacy dan kode mati | `Admin/temp/`, `Admin/LowonganPPLController`, `FrontpageController`, dll. |
| 18 | **Rendah** | N+1 query pada dashboard operator (query per kelas) | `OpratorSekolahController`, `OperatorKecamatanController` |
| 19 | **Rendah** | `User::factory()` dipakai untuk membuat akun operator (bergantung factory) | `AdminSekolahController.php:112` |
| 20 | **Rendah** | Tidak ada rate limit pada endpoint API selain Data Rekap | `routes/api.php` |

---

### Status Perbaikan Temuan Kritis (21 Oktober 2026)

Perbaikan yang diterapkan:

1. **Autentikasi & otorisasi API**
   - Seluruh endpoint sensitif di `routes/api.php` sekarang dibungkus `auth:sanctum` + middleware `role:` sesuai pemakaian frontend.
   - Grup yang dibentuk: admin (`role:admin`), operator sekolah (`role:admin,opt-sekolah`), operator kecamatan (`role:admin,opt-kecamatan`), classroom KPM (`role:admin,user,supervisor_kpm`), classroom PPL (`role:admin,user,supervisor,supervisor_kpm`), supervisor (`role:admin,supervisor,supervisor_kpm`), sertifikat mahasiswa (`role:admin,user`), dan sertifikat guru (`role:admin,opt-sekolah`).
   - Endpoint publik read-only tetap terbuka: `GET /api/gelombang`, `GET /api/prodi`, `GET /api/lowonganppl`, `GET /api/lowongankpm`, dan seluruh endpoint `/api/data-rekap*` (rate limit 30/menit).
2. **`RoleMiddleware`**
   - Diubah memakai `$request->user()` sehingga kompatibel dengan autentikasi sesi (`auth:sanctum` stateful) maupun token.
3. **Route debug `/pw`**
   - Dilindungi `auth` + `admin` agar tidak dapat diakses publik.

Hasil verifikasi:

- `php artisan route:list`: **359 route** (tidak ada route yang hilang).
- Route tanpa middleware `auth`: **98 → 17**, dan 17 sisanya adalah route publik yang memang disengaja (beranda redirect, Data Rekap, referensi read-only, halaman demo sertifikat, `sanctum/csrf-cookie`, `up`).
- Smoke test sementara (7 test): anonymous → 401; admin → 200; mahasiswa → 403 pada endpoint admin/supervisor/operator; supervisor_kpm dan operator sekolah → dapat mengakses endpoint sesuai role.
- Uji HTTP anonim: endpoint admin/nilai mengembalikan **401 Unauthenticated**; endpoint publik (`/api/prodi`, `/api/data-rekap/status`) tetap **200**.

> **Catatan deployment:** pastikan `SANCTUM_STATEFUL_DOMAINS` di `.env` produksi berisi domain aplikasi (mis. `domainanda.com`) agar autentikasi sesi untuk request API tetap bekerja. Nilai ini sudah diatur di `.env` lokal.

---

### Detail Temuan Penting

#### 1. Route tanpa autentikasi (Kritis)

Sebanyak **98 route** tidak memiliki middleware `auth`. Contoh yang paling berbahaya:

| Method | Endpoint | Dampak |
| :--- | :--- | :--- |
| `POST` | `/api/admin/admin-sekolah/generate` | Membuat akun operator sekolah massal |
| `POST` | `/api/admin/admin-kecamatan/generate` | Membuat akun operator kecamatan massal |
| `POST` | `/api/admin/oprator-kecamatan/bulk-delete` | Menghapus **semua** akun operator kecamatan |
| `DELETE` | `/api/admin/users/admin/{id}` | Menghapus akun admin |
| `POST` | `/api/admin/data/camat-keuchik/delete/{id}` | Menghapus data camat/keuchik |
| `POST` | `/api/admin/data/kepsek-pamong/delete/{id}` | Menghapus data kepsek/pamong |
| `POST` | `/api/student/classroom/submission` | Membuat submission mahasiswa mana pun |
| `POST` | `/api/student/classroom/task` | Membuat tugas classroom |
| `DELETE` | `/api/admin/classroom-kpm/task/{id}` | Menghapus tugas |
| `POST` | `/api/supervisor-kpm/classroom/tugas-mahasiswa/nilai/update` | Mengubah nilai mahasiswa |
| `POST` | `/api/supervisor-ppl/classroom/mahasiswa/update/{nim}` | Mengubah nilai PPL |
| `POST` | `/api/admin/certificate/nilai-ppkpm/export` | Mengekspor rekap nilai |
| `GET` | `/api/admin/users/admin` | Melihat daftar admin |
| `GET|POST` | `/api/certificate/download` | Mengunduh sertifikat berdasarkan NIM |
| `POST` | `/api/operator-sekolah/data/kepsek_pamong/save` | Menulis data pamong |
| `POST` | `/api/operator-kecamatan/data/camat-keuchik/save` | Menulis data keuchik |

Route tersebut hanya mengandalkan UI untuk menyembunyikan tombol; secara HTTP tetap dapat dipanggil langsung. Karena grup `api` tidak memakai CSRF, permintaan `POST` dari luar juga tidak terhalang.

**Rekomendasi:** bungkus seluruh endpoint yang bersifat menulis/membaca data sensitif dengan `auth:sanctum` + middleware role (`admin_api`, `super_admin_api`, `role:...`), lalu tambahkan otorisasi kepemilikan data (mis. mahasiswa hanya boleh mengakses NIM-nya sendiri).

#### 2. Hardcoded ID 71 (Tinggi)

`Admin\TempatKPM@getDataById($id)` memakai `$id` untuk filter utama, tetapi tiga subquery statistik masih menulis `lkt.id_tempat_kpm = 71`. Akibatnya semua tempat KPM selain ID 71 menampilkan statistik yang salah.

**Lokasi:** `app/Http/Controllers/Admin/TempatKPM.php:337-339`.

#### 3. Password default operator (Tinggi)

Akun operator yang di-generate memakai password statis `ppkpm2025` (`AdminSekolahController.php:117`, `AdminKecamatanController.php:52`). Jika akun tidak segera diganti, siapa pun yang mengetahui pola email (`namasekolah@gmail.com`) dapat masuk.

**Rekomendasi:** generate password acak, kirim via email/WA, dan paksa reset saat login pertama.

#### 4. IDOR pada nilai & sertifikat (Tinggi)

- `GET /api/student/nilai?nim=...` hanya membutuhkan login (`auth:sanctum`), tanpa memverifikasi bahwa NIM tersebut milik pengguna.
- `GET|POST /api/certificate/download?nim=...` tidak memerlukan login sama sekali.
- `GET /api/certificate/teacher/download` juga publik.

**Rekomendasi:** validasi `Auth::user()->username === $nim` untuk mahasiswa, dan gunakan signed URL/otorisasi admin untuk sertifikat.

#### 5. Bug `role()` (Sedang)

```php
// app/Http/Middleware/User.php:27
} else if($request->user()->role() === 'supervisor'){
```

`role` adalah kolom/properti, bukan method. Ketika user dengan role `supervisor` mengakses route ber-middleware `user`, cabang ini akan memicu `Call to undefined method`. Seharusnya `->role === 'supervisor'`.

#### 6. Kolom `file_lampiran` hilang (Sedang)

`Bimbingan` model mencantumkan `file_lampiran` di `$fillable`, dan controller memakai `$item->file_lampiran`, tetapi migrasi `bimbingan_tbl` tidak memiliki kolom tersebut. Nilai akan selalu `null`; jika suatu saat file diunggah, penyimpanan akan error SQL.

**Rekomendasi:** tambahkan migrasi kolom (`string('file_lampiran')->nullable()`) atau hapus referensinya bila fitur upload belum dipakai.

#### 7. Potensi redirect loop super admin (Sedang)

Middleware `Admin` dan `Supervisor` mengarahkan `super_admin` ke `/admin/data/setting`. Route tersebut berada di grup `admin` (bukan `super_admin`), sehingga middleware `Admin` akan mengarahkan lagi ke URL yang sama → loop. Route yang benar untuk super admin adalah `/superadmin/data/setting` (`routes/super_admin.php`).

#### 8. Cek duplikasi lamaran PPL salah kolom (Sedang)

```php
// app/Http/Controllers/Mahasiswa/LowonganPPL.php:99
$eksisting_lamaran = LamaranPPL::where('id', $request->id)
    ->where('username_mahasiswa', Auth::user()->username)->first();
```

`$request->id` adalah ID lowongan, bukan ID lamaran. Seharusnya `where('id_lowongan_ppl', $request->id)`. Saat ini mahasiswa dapat melamar lowongan yang sama berulang kali selama kuota masih ada.

#### 9. Lamaran langsung diterima (Sedang)

Baik `LowonganKPM@lamar` maupun `LowonganPPL@lamar` menyimpan status `accepted` secara langsung. Status `submitted`/`rejected` tidak pernah dipakai pada alur ini, sehingga review admin tidak berjalan. Jika ini memang desain (kuota-first), sebaiknya didokumentasikan; jika tidak, ubah menjadi `submitted` dan sediakan aksi admin untuk menerima/menolak.

#### 10. Sertifikat & PDF (Sedang)

- `CertificateController@downloadCertificate` pada cabang `kode == null` melakukan `return response()->json($data);` sebelum blok pembuatan PDF, sehingga PDF tidak pernah dibuat.
- `$kode->kode` diakses tanpa null check; jika data mahasiswa tidak ditemukan, terjadi error.
- `$data_certificate_setting` juga bisa `null` bila tidak ada setting untuk gelombang.

#### 11. View nilai & hardcode tugas (Sedang)

- Nilai keuchik diambil hanya dari `task_submission.id_tugas = 8`.
- Nilai supervisor KPM dihitung `sum(score)/count(0) - 1` (mengurangi 1 dari rata-rata), yang tampak seperti workaround, bukan formula bisnis yang jelas.
- Jika ID tugas berubah atau ada tugas baru, nilai PPKPM dapat salah.

**Rekomendasi:** simpan komponen nilai pada kolom eksplisit atau tabel nilai tersendiri; hindari ketergantungan pada ID tugas.

#### 12. Test suite tidak relevan (Sedang)

- `tests/Feature/Auth/AuthenticationTest.php` dan `RegistrationTest.php` mengharapkan `route('dashboard')`, padahal route `dashboard` sudah dihapus.
- `phpunit.xml` mengomentari konfigurasi SQLite, sehingga test akan memakai koneksi MySQL dari `.env` jika dijalankan.
- Tidak ada test untuk alur inti: verifikasi Sevima, lamaran, alokasi, classroom, penilaian, sertifikat.

#### 13–20. Temuan lainnya

- **TLS:** `Http::withoutVerifying()` dipakai di `SevimaService` dan `DataRekapController`; sebaiknya hanya diaktifkan bila benar-benar diperlukan.
- **Import class hilang:** `routes/web.php` mengimpor `EasyController`, `routes/api.php` mengimpor `LowonganKPMController`; keduanya tidak ada. Import tidak terpakai sehingga tidak langsung error, tetapi menyesatkan.
- **Tabel legacy:** `App\Models\TempatPPL` memetakan `tempat_ppl_tbl` yang tidak ada di migrasi; kemungkinan sisa modul lama.
- **Typo:** `$tglLiarNormal` di `VerifikasiMahasiswaController.php:213` (tidak berdampak karena `??`).
- **Duplikasi controller:** `Admin/LowonganPPLController`, `Admin/PPL/LowonganPPLController`, `Admin/temp/LowonganPPLController`; `ProfilController`, `ProfileController`, `Mahasiswa/ProfilController`; `HomeControler`, `FrontpageController`. Perlu konsolidasi.
- **Query N+1:** dashboard operator menjalankan query per kelas di dalam loop; pertimbangkan eager loading/agregasi SQL.
- **Factory:** `AdminSekolahController` memakai `User::factory()->create([...])` dengan override; pastikan factory tidak mengisi field yang bertentangan.
- **Rate limit:** hanya Data Rekap yang memakai `throttle`; endpoint lain rentan brute force/abuse.

---

## 14. Rekomendasi Prioritas

### Prioritas 1 — Keamanan (segera)

1. ✅ **Sudah diterapkan (21 Okt 2026):** tambahkan `auth:sanctum` + role middleware ke seluruh endpoint API yang sensitif.
2. Tambahkan otorisasi kepemilikan pada endpoint nilai/sertifikat (NIM harus milik user yang login).
3. Ganti password default operator dengan password acak + paksa reset.
4. Hapus/nonaktifkan endpoint destruktif tanpa auth (`bulk-delete`, delete user, delete data).
5. Aktifkan kembali verifikasi TLS Sevima bila memungkinkan.

### Prioritas 2 — Perbaikan fungsional

6. Perbaiki hardcoded `id_tempat_kpm = 71`.
7. Perbaiki cek duplikasi lamaran PPL (`id_lowongan_ppl`).
8. Perbaiki `User` middleware `role()`.
9. Tambahkan kolom `file_lampiran` atau hapus referensinya.
10. Perbaiki redirect super admin ke `/superadmin/data/setting`.
11. Perbaiki alur nomor sertifikat dan pastikan PDF selalu dibuat.

### Prioritas 3 — Kualitas & maintainability

12. Konsolidasikan controller duplikat dan hapus import/kode mati.
13. Pisahkan logika penilaian dari view SQL; hilangkan hardcode `id_tugas`.
14. Tambahkan test fitur untuk alur kritis.
15. Optimalkan query dashboard (hilangkan N+1).
16. Dokumentasikan status lamaran (`submitted` vs `accepted`) sesuai kebijakan bisnis.
17. Pertimbangkan pemisahan endpoint publik vs privat secara eksplisit (route file terpisah).

---

## 15. Peta File Penting

### Backend

| File | Peran |
| :--- | :--- |
| `bootstrap/app.php` | Registrasi middleware alias & grup |
| `routes/web.php` | Halaman Inertia per role |
| `routes/api.php` | Endpoint JSON (termasuk yang belum ber-auth) |
| `routes/auth.php` | Login, registrasi, verifikasi |
| `app/Http/Controllers/Auth/VerifikasiMahasiswaController.php` | Verifikasi Sevima |
| `app/Http/Controllers/Auth/RegistrasiPPKPMController.php` | Registrasi akun + mahasiswa |
| `app/Http/Controllers/Mahasiswa/ProfilController.php` | Profil & dokumen |
| `app/Http/Controllers/Mahasiswa/LowonganKPM.php` | Lamaran KPM |
| `app/Http/Controllers/Mahasiswa/LowonganPPL.php` | Lamaran PPL |
| `app/Http/Controllers/BimbinganController.php` | Modul bimbingan |
| `app/Http/Controllers/CertificateController.php` | Rekap nilai & sertifikat PPKPM |
| `app/Http/Controllers/DataRekapController.php` | Statistik publik & sync Sevima |
| `app/Console/Commands/GenerateDataRekapCommand.php` | `rekap:generate` |
| `app/Services/SevimaService.php` | Client Sevima |
| `app/Http/Middleware/HandleInertiaRequests.php` | Shared props Inertia |

### Database

| File | Peran |
| :--- | :--- |
| `database/migrations/2024_11_16_100345_mahasiswa_tbl.php` | Skema mahasiswa |
| `database/migrations/2025_08_10_024330_tempat_kpm_tbl_v2.php` | Kuota KPM |
| `database/migrations/2025_07_20_074056_kelas_ppl.php` | Kelas PPL |
| `database/migrations/2026_07_28_062117_create_nilai_ppkpm_view.php` | View nilai PPKPM |
| `database/migrations/2026_08_07_071743_create_dispensasi_syarat_table.php` | Dispensasi |
| `database/migrations/2026_10_19_000001_create_bimbingan_table.php` | Bimbingan |
| `nilai_ppkpm_view.sql` | Definisi view (gitignored) |

### Frontend

| File | Peran |
| :--- | :--- |
| `resources/js/app.jsx` | Entry React/Inertia |
| `resources/views/app.blade.php` | Root template |
| `resources/js/Layouts/` | Layout per role |
| `resources/js/Pages/Admin/` | Backoffice admin |
| `resources/js/Pages/Mahasiswa/` | Halaman mahasiswa |
| `resources/js/Pages/OperatorSekolah/`, `OperatorKecamatan/` | Dashboard operator |
| `resources/js/Pages/SupervisorKPM/`, `Supervisor/` | Halaman DPL |
| `resources/js/Pages/DataRekap/` | Statistik publik |
| `resources/js/Components/Bimbingan/` | Komponen bimbingan |

---

## 16. Metodologi

- Membaca struktur direktori, `composer.json`, `package.json`, `vite.config.js`, `Dockerfile`, `docker-compose.yml`.
- Membaca seluruh route (`routes/*.php`) dan menjalankan `php artisan route:list --json` untuk menghitung route serta memeriksa middleware.
- Membaca model, migrasi, controller utama, middleware, service, command, dan komponen frontend kunci.
- Memeriksa `git status`, `git diff --stat`, dan riwayat commit terakhir.
- Tidak menjalankan migrasi, seeder, test, build, atau perintah yang mengubah data.
- Tidak mengubah file source code. Satu-satunya file yang dibuat adalah dokumen ini.

---

*Dokumen ini dihasilkan dari audit statis. Beberapa temuan (mis. perilaku runtime, hasil test) perlu diverifikasi lebih lanjut di environment staging sebelum diperbaiki.*
