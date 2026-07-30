<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Drop view lama
    DB::statement('DROP VIEW IF EXISTS `nilai_ppkpm_view`');
    echo "View lama berhasil dihapus.\n";

    // Buat ulang view tanpa DEFINER
    DB::statement("
CREATE VIEW `nilai_ppkpm_view` AS
select
	`data_nilai_mhs`.`nim` AS `nim`,
	(
	select
		`mtbls`.`no_hp_wa`
	from
		`mahasiswa_tbl` `mtbls`
	where
		`mtbls`.`nim` = `data_nilai_mhs`.`nim`
	limit 1) AS `no_hp`,
	`data_nilai_mhs`.`nama_mahasiswa` AS `nama_mahasiswa`,
	`data_nilai_mhs`.`nama_prodi` AS `nama_prodi`,
	`data_nilai_mhs`.`id_prodi` AS `id_prodi`,
	`data_nilai_mhs`.`cluster_kegiatan` AS `cluster_kegiatan`,
	`data_nilai_mhs`.`nama_tempat_kpm` AS `nama_tempat_kpm`,
	`data_nilai_mhs`.`nama_tempat_ppl` AS `nama_tempat_ppl`,
	`data_nilai_mhs`.`nilai_supervisor_kpm` AS `nilai_supervisor_kpm`,
	`data_nilai_mhs`.`nilai_keuchik` AS `nilai_keuchik`,
	`data_nilai_mhs`.`nilai_pamong` AS `nilai_pamong`,
	`data_nilai_mhs`.`nilai_supervisor_ppl` AS `nilai_supervisor_ppl`,
	`data_nilai_mhs`.`no_surat` AS `no_surat`,
	`data_nilai_mhs`.`PK_KPM` AS `PK_KPM`,
	`data_nilai_mhs`.`LK_KPM` AS `LK_KPM`,
	`data_nilai_mhs`.`SM_KPM` AS `SM_KPM`,
	`data_nilai_mhs`.`PK_PPL` AS `PK_PPL`,
	`data_nilai_mhs`.`LK_PPL` AS `LK_PPL`,
	`data_nilai_mhs`.`SM_PPL` AS `SM_PPL`,
	`data_nilai_mhs`.`no_surat_full` AS `no_surat_full`,
	(`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 AS `nilai_ppkpm`,
	case
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 90 then 'A'
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 < 90
		and (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 85 then 'A-'
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 < 85
		and (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 78 then 'B+'
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 < 78
		and (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 72 then 'B'
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 < 72
		and (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 68 then 'B-'
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 < 68
		and (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 65 then 'C+'
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 < 65
		and (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 60 then 'C'
		when (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 < 60
		and (`data_nilai_mhs`.`SM_KPM` + `data_nilai_mhs`.`SM_PPL`) / 2 >= 50 then 'D'
		else 'E'
	end AS `index_nilai_ppkpm`,
	`data_nilai_mhs`.`id_gelombang_tertinggi` AS `id_gelombang_tertinggi`,
	(
	select
		`gtbl2`.`name`
	from
		`gelombang_tbl` `gtbl2`
	where
		`gtbl2`.`id` = `data_nilai_mhs`.`id_gelombang_tertinggi`) AS `nama_gelombang`
from
	(
	select
		`data_mhs`.`nim` AS `nim`,
		`data_mhs`.`nama_mahasiswa` AS `nama_mahasiswa`,
		`data_mhs`.`nama_prodi` AS `nama_prodi`,
		`data_mhs`.`id_prodi` AS `id_prodi`,
		`data_mhs`.`cluster_kegiatan` AS `cluster_kegiatan`,
		`data_mhs`.`nama_tempat_kpm` AS `nama_tempat_kpm`,
		`data_mhs`.`nama_tempat_ppl` AS `nama_tempat_ppl`,
		`data_mhs`.`nilai_supervisor_kpm` AS `nilai_supervisor_kpm`,
		`data_mhs`.`nilai_keuchik` AS `nilai_keuchik`,
		`data_mhs`.`nilai_pamong` AS `nilai_pamong`,
		`data_mhs`.`nilai_supervisor_ppl` AS `nilai_supervisor_ppl`,
		`data_mhs`.`no_surat` AS `no_surat`,
		coalesce(`data_mhs`.`nilai_keuchik`, 0) * 0.75 AS `PK_KPM`,
		coalesce(`data_mhs`.`nilai_supervisor_kpm`, 0) * 0.25 AS `LK_KPM`,
		coalesce(`data_mhs`.`nilai_keuchik`, 0) * 0.75 + coalesce(`data_mhs`.`nilai_supervisor_kpm`, 0) * 0.25 AS `SM_KPM`,
		coalesce(`data_mhs`.`nilai_pamong`, 0) * 0.75 AS `PK_PPL`,
		coalesce(`data_mhs`.`nilai_supervisor_ppl`, 0) * 0.25 AS `LK_PPL`,
		coalesce(`data_mhs`.`nilai_pamong`, 0) * 0.75 + coalesce(`data_mhs`.`nilai_supervisor_ppl`, 0) * 0.25 AS `SM_PPL`,
		if(`data_mhs`.`no_surat` is null,
		`data_mhs`.`no_surat`,
		(
		select
			concat(`srt_tbl`.`kode`, `data_mhs`.`no_surat`, `srt_tbl`.`kode_universitas`, `srt_tbl`.`kode_idc`, `srt_tbl`.`kode_jenis_surat`, `srt_tbl`.`bulan_tahun`)
		from
			`sertifikat_tbl` `srt_tbl`
		where
			`srt_tbl`.`id_gelombang` = `data_mhs`.`id_gelombang_tertinggi`
		limit 1)) AS `no_surat_full`,
		`data_mhs`.`id_gelombang_tertinggi` AS `id_gelombang_tertinggi`
	from
		(
		select
			`m_ppkpm`.`username_mahasiswa` AS `nim`,
			(
			select
				`usr`.`name`
			from
				`users` `usr`
			where
				`usr`.`username` = `m_ppkpm`.`username_mahasiswa`
			limit 1) AS `nama_mahasiswa`,
			(
			select
				`pt`.`name`
			from
				(`mahasiswa_tbl` `mt`
			join `prodi_tbl` `pt` on
				(`mt`.`id_prodi` = `pt`.`id`))
			where
				`mt`.`nim` = `m_ppkpm`.`username_mahasiswa`
			limit 1) AS `nama_prodi`,
			(
			select
				`mt`.`id_prodi`
			from
				`mahasiswa_tbl` `mt`
			where
				`mt`.`nim` = `m_ppkpm`.`username_mahasiswa`
			limit 1) AS `id_prodi`,
			(
			select
				`mhs`.`cluster_kegiatan`
			from
				`mahasiswa_tbl` `mhs`
			where
				`m_ppkpm`.`username_mahasiswa` = `mhs`.`nim`
			limit 1) AS `cluster_kegiatan`,
			(
			select
				`tkt`.`name`
			from
				(`lamaran_kpm_tbl` `lkt`
			join `tempat_kpm_tbl` `tkt` on
				(`lkt`.`id_tempat_kpm` = `tkt`.`id`))
			where
				`lkt`.`username_mahasiswa` = `m_ppkpm`.`username_mahasiswa`
				and `lkt`.`status` = 'accepted'
				and `tkt`.`id_gelombang` = `m_ppkpm`.`id_gelombang_tertinggi`
			order by
				`tkt`.`id_gelombang` desc
			limit 1) AS `nama_tempat_kpm`,
			(
			select
				`tkt`.`name`
			from
				((`lamaran_ppl_tbl` `lkt`
			join `lowongan_ppl_tbl` `lpt` on
				(`lkt`.`id_lowongan_ppl` = `lpt`.`id`))
			join `sekolah_tbl` `tkt` on
				(`lpt`.`id_sekolah` = `tkt`.`id`))
			where
				`lkt`.`username_mahasiswa` = `m_ppkpm`.`username_mahasiswa`
				and `lkt`.`status` = 'accepted'
				and `tkt`.`id_gelombang` = `m_ppkpm`.`id_gelombang_tertinggi`
			order by
				`tkt`.`id_gelombang` desc
			limit 1) AS `nama_tempat_ppl`,
			(
			select
				sum(`ts`.`score`) / count(0) - 1 AS `nilai_supervisor`
			from
				(`task_submission` `ts`
			join `tempat_kpm_tbl` `k` on
				(`ts`.`id_kelas` = `k`.`id`))
			where
				`ts`.`username_mahasiswa` = `m_ppkpm`.`username_mahasiswa`
				and `ts`.`id_tugas` <> 8
				and `k`.`id_gelombang` = `m_ppkpm`.`id_gelombang_tertinggi`) AS `nilai_supervisor_kpm`,
			(
			select
				`ts`.`score`
			from
				(`task_submission` `ts`
			join `tempat_kpm_tbl` `k` on
				(`ts`.`id_kelas` = `k`.`id`))
			where
				`ts`.`username_mahasiswa` = `m_ppkpm`.`username_mahasiswa`
				and `ts`.`id_tugas` = 8
				and `k`.`id_gelombang` = `m_ppkpm`.`id_gelombang_tertinggi`
			order by
				`ts`.`created_at` desc
			limit 1) AS `nilai_keuchik`,
			(
			select
				`mt`.`nilai_pamong`
			from
				`mahasiswa_tbl` `mt`
			where
				`mt`.`nim` = `m_ppkpm`.`username_mahasiswa`
			limit 1) AS `nilai_pamong`,
			(
			select
				`mt`.`nilai_supervisor_ppl`
			from
				`mahasiswa_tbl` `mt`
			where
				`mt`.`nim` = `m_ppkpm`.`username_mahasiswa`
			limit 1) AS `nilai_supervisor_ppl`,
			(
			select
				`mt`.`kode`
			from
				`mahasiswa_tbl` `mt`
			where
				`mt`.`nim` = `m_ppkpm`.`username_mahasiswa`
			limit 1) AS `no_surat`,
			`m_ppkpm`.`id_gelombang_tertinggi` AS `id_gelombang_tertinggi`
		from
			(
			select
				`dt`.`username_mahasiswa` AS `username_mahasiswa`,
				greatest(coalesce(max(case when `dt`.`id_gelombang_kpm` is not null then `dt`.`id_gelombang_kpm` else 0 end), 0),
				coalesce(max(case when `dt`.`id_gelombang_ppl` is not null then `dt`.`id_gelombang_ppl` else 0 end), 0)) AS `id_gelombang_tertinggi`
			from
				(
				select
					`lpt`.`username_mahasiswa` AS `username_mahasiswa`,
					NULL AS `id_gelombang_kpm`,
					`s`.`id_gelombang` AS `id_gelombang_ppl`
				from
					((`lamaran_ppl_tbl` `lpt`
				join `lowongan_ppl_tbl` `lo` on
					(`lpt`.`id_lowongan_ppl` = `lo`.`id`))
				join `sekolah_tbl` `s` on
					(`lo`.`id_sekolah` = `s`.`id`))
				where
					`lpt`.`status` = 'accepted'
			union all
				select
					`lkt`.`username_mahasiswa` AS `username_mahasiswa`,
					`t`.`id_gelombang` AS `id_gelombang_kpm`,
					NULL AS `id_gelombang_ppl`
				from
					(`lamaran_kpm_tbl` `lkt`
				join `tempat_kpm_tbl` `t` on
					(`lkt`.`id_tempat_kpm` = `t`.`id`))
				where
					`lkt`.`status` = 'accepted') `dt`
			group by
				`dt`.`username_mahasiswa`) `m_ppkpm`) `data_mhs`) `data_nilai_mhs`
    ");
    echo "View berhasil dibuat ulang tanpa DEFINER!\n";

    // Test query
    $test = DB::table('nilai_ppkpm_view')->limit(3)->get();
    echo "Test query OK. Rows: " . count($test) . "\n";
    $paginate = DB::table('nilai_ppkpm_view')->paginate(50);
    echo "Total data: " . $paginate->total() . "\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
