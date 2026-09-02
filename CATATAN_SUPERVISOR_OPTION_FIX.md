# Catatan Perbaikan: Pilihan Option Supervisor Tidak Muncul di Server

## Deskripsi Masalah
Opsi supervisor pada komponen dropdown/select (seperti pada Tempat KPM & Tempat PPL) dapat muncul di lingkungan lokal (Laragon/Windows), namun kosong / tidak muncul di lingkungan server (Linux Production).

---

## Akar Penyebab & Analisis

1. **Sensitivitas Huruf (Case-Sensitivity) Role di Database Linux vs Windows**:
   - Di Windows (local), query `where('role', 'supervisor_kpm')` bersifat case-insensitive.
   - Di Linux (server), tergantung pada collation dan enkoding, perbedaan penulisan seperti `supervisor_kpm`, `Supervisor_KPM`, atau `supervisor` menyebabkan query mengembalikan data kosong `[]`.

2. **Method `all()` Hilang di `SupervisorKPMController`**:
   - Route `/api/admin/users/supervisor-kpm` terdaftar di `routes/api.php` memanggil `[SupervisorKPMController::class, 'all']`.
   - Sebelumnya method `all()` tidak ada dalam `SupervisorKPMController`, menyebabkan **500 Internal Server Error** saat route tersebut dipanggil.

3. **Konfigurasi Sanctum / CORS / Middleware (`auth:sanctum` & `admin_api`)**:
   - Route `/api/admin/kpm/supervisor` memerlukan sesi/token terautentikasi. Di server produksi, jika `.env` belum dikonfigurasi (`SANCTUM_STATEFUL_DOMAINS` & `SESSION_DOMAIN`), Axios akan menerima HTTP 401/403.

---

## Perubahan Kode yang Dilakukan

1. **`app/Http/Controllers/Admin/TempatKPM.php`**:
   - Diperbarui method `getSupervisor()` menggunakan `whereIn('role', ['supervisor_kpm', 'supervisor', 'Supervisor_KPM'])` agar fleksibel menangkap semua variasi role supervisor baik di Linux maupun Windows.

2. **`app/Http/Controllers/Admin/SupervisorKPMController.php`**:
   - Menambahkan method `all()` yang mengembalikan JSON list data supervisor secara aman.

3. **`app/Http/Controllers/Admin/SupervisorController.php`**:
   - Diperbarui `index()` menggunakan `whereIn('role', ['supervisor_kpm', 'supervisor', 'Supervisor_KPM'])`.

---

## Langkah Tindakan di Server Production Setelah `git pull`

1. Jalankan git pull:
   ```bash
   git pull origin development
   ```

2. Clear route & config cache:
   ```bash
   php artisan route:clear
   php artisan config:clear
   php artisan cache:clear
   ```

3. Pastikan file `.env` di server sudah mencantumkan domain server:
   ```env
   SANCTUM_STATEFUL_DOMAINS=domainanda.com
   SESSION_DOMAIN=.domainanda.com
   ```
