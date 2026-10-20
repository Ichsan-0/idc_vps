<?php

namespace App\Http\Controllers\OperatorKecamatan;

use App\Http\Controllers\Controller;
use App\Models\AdminKecamatan;
use App\Models\AmprahamKPM;
use App\Models\Gelombang;
use App\Models\TempatKPM;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OperatorKecamatanController extends Controller
{
    public function index()
    {
        $data_opt = AdminKecamatan::where('email', Auth::user()->email)->first();
        $idKecamatan = $data_opt ? $data_opt->id_kecamatan : null;

        $kelas = [];
        $kecamatanName = null;
        $totalCamatKeuchik = 0;

        if ($idKecamatan) {
            $kelas = TempatKPM::where(function ($q) use ($idKecamatan) {
                    $q->where('tempat_kpm_tbl.sub_district', $idKecamatan)
                      ->orWhereIn('tempat_kpm_tbl.id_desa', function ($sub) use ($idKecamatan) {
                          $sub->select('id')->from('master_desa_tbl')->where('sub_district', $idKecamatan);
                      });
                })
                ->leftJoin('master_desa_tbl as md', 'tempat_kpm_tbl.id_desa', '=', 'md.id')
                ->leftJoin('users as u', 'tempat_kpm_tbl.username_supervisor', '=', 'u.username')
                ->with(['gelombang'])
                ->select(
                    'tempat_kpm_tbl.*',
                    'md.name as nama_desa_master',
                    'u.name as nama_supervisor'
                )
                ->orderBy('tempat_kpm_tbl.id_gelombang', 'DESC')
                ->get();

            foreach ($kelas as $k) {
                $k->total_mahasiswa = DB::table('lamaran_kpm_tbl')
                    ->where('id_tempat_kpm', $k->id)
                    ->whereIn('status', ['accepted', 'lulus'])
                    ->count();
                $keuchik = DB::table('ampraham_kpm_tbl')
                    ->where('id_kecamatan', $idKecamatan)
                    ->where(function($q) use ($k) {
                        $q->where('id_desa', $k->id_desa)
                          ->orWhere('desa', 'like', '%' . ($k->name ?? '') . '%');
                    })
                    ->first();
                $k->nama_keuchik = $keuchik ? $keuchik->name : null;
            }

            $sampleAmp = DB::table('ampraham_kpm_tbl')->where('id_kecamatan', $idKecamatan)->first();
            if ($sampleAmp) {
                $kecamatanName = $sampleAmp->kecamatan;
            }
            $totalCamatKeuchik = DB::table('ampraham_kpm_tbl')->where('id_kecamatan', $idKecamatan)->count();
        }

        $latestGelombang = Gelombang::where('active', 1)->first() ?? Gelombang::latest()->first();

        return Inertia::render('OperatorKecamatan/Dashboard', [
            'kelas' => $kelas,
            'latestGelombang' => $latestGelombang,
            'data_opt' => $data_opt,
            'kecamatanName' => $kecamatanName ?? Auth::user()->name,
            'totalCamatKeuchik' => $totalCamatKeuchik,
            'base_url' => url('/')
        ]);
    }

    public function viewKelas($id)
    {
        $data_opt = AdminKecamatan::where('email', Auth::user()->email)->first();

        return Inertia::render('OperatorKecamatan/Classroom/ViewKelas', [
            'base_url' => url('/'),
            'data' => [
                'id_kelas' => $id
            ],
            'data_opt' => $data_opt
        ]);
    }

    public function getClassroomData($id)
    {
        try {
            $kelas = TempatKPM::where('tempat_kpm_tbl.id', $id)
                ->leftJoin('master_desa_tbl as md', 'tempat_kpm_tbl.id_desa', '=', 'md.id')
                ->leftJoin('users as u', 'tempat_kpm_tbl.username_supervisor', '=', 'u.username')
                ->with(['gelombang'])
                ->select(
                    'tempat_kpm_tbl.*',
                    'md.name as nama_desa_master',
                    'u.name as nama_supervisor'
                )
                ->first();

            if (!$kelas) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kelas tidak ditemukan'
                ], 404);
            }

            $mahasiswa = DB::table('lamaran_kpm_tbl as l')
                ->join('users as u', 'l.username_mahasiswa', '=', 'u.username')
                ->leftJoin('mahasiswa_tbl as m', 'u.username', '=', 'm.nim')
                ->leftJoin('prodi_tbl as p', 'm.id_prodi', '=', 'p.id')
                ->where('l.id_tempat_kpm', $id)
                ->whereIn('l.status', ['accepted', 'lulus'])
                ->select(
                    'u.name',
                    'u.username as nim',
                    'l.status',
                    'p.name as prodi',
                    'm.no_hp_wa as no_hp'
                )
                ->get();

            foreach ($mahasiswa as $m) {
                $m->bimbingan_count = DB::table('bimbingan_tbl')
                    ->where('id_kelas', $id)
                    ->where('username_mahasiswa', $m->nim)
                    ->where('tipe', 'kpm')
                    ->where('status', 'approved')
                    ->count();
                $m->total_bimbingan = DB::table('bimbingan_tbl')
                    ->where('id_kelas', $id)
                    ->where('username_mahasiswa', $m->nim)
                    ->where('tipe', 'kpm')
                    ->count();
            }

            $tasks = DB::table('task')->orderBy('created_at', 'desc')->get();
            foreach ($tasks as $task) {
                $submissions = DB::table('task_submission as ts')
                    ->join('users as u', 'ts.username_mahasiswa', '=', 'u.username')
                    ->leftJoin('mahasiswa_tbl as m', 'u.username', '=', 'm.nim')
                    ->leftJoin('prodi_tbl as p', 'm.id_prodi', '=', 'p.id')
                    ->where('ts.id_kelas', $id)
                    ->where('ts.id_tugas', $task->id)
                    ->select(
                        'ts.*',
                        'u.name as nama_mahasiswa',
                        'p.name as prodi'
                    )
                    ->get();
                $task->submissions = $submissions;
                $task->submitted_count = $submissions->count();
            }

            $subDistrict = $kelas->sub_district ?? ($kelas->id_desa ? DB::table('master_desa_tbl')->where('id', $kelas->id_desa)->value('sub_district') : null);
            $keuchik = DB::table('ampraham_kpm_tbl')
                ->where('id_kecamatan', $subDistrict)
                ->where(function($q) use ($kelas) {
                    $q->where('id_desa', $kelas->id_desa)
                      ->orWhere('desa', 'like', '%' . ($kelas->name ?? '') . '%');
                })
                ->first();

            $camat = DB::table('ampraham_kpm_tbl')
                ->where('id_kecamatan', $subDistrict)
                ->where('jabatan', 'like', '%Camat%')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'kelas' => $kelas,
                    'mahasiswa' => $mahasiswa,
                    'tasks' => $tasks,
                    'keuchik' => $keuchik,
                    'camat' => $camat
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function camat_keuchik_save(Request $request)
    {

        DB::beginTransaction();
        try {
            if ($request->hasFile('dokumen')) {
                $file = $request->file('dokumen');
                $path = $file->store('public/pdf');
                $data = [
                    'name' => $request->name,
                    'nip' => $request->nip,
                    'jabatan' => $request->jabatan,
                    'desa' => $request->desa,
                    'id_desa' => $request->id_desa,
                    'kecamatan' => $request->kecamatan,
                    'id_kecamatan' => $request->id_kecamatan,
                    'no_rekening' => $request->no_rekening,
                    'no_npwp' => $request->no_npwp,
                    'pangkat_dan_golongan' => $request->pangkat_dan_golongan,
                    'nama_bank' => $request->nama_bank,
                    'link_document' => $path,
                    'nama_di_buku_rekening' => $request->nama_di_buku_rekening
                ];

                AmprahamKPM::create($data);
                DB::commit();

                return response()->json([
                    'status' => 'ok',
                    'code' => '200',
                    'message' => 'success'
                ]);
            } else {
                throw new \InvalidArgumentException('File "dokumen" is required.');
            }
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'code' => $e->getCode(),
                'message' => $e->getMessage()
            ]);
        }
    }

    public function camat_keuchik()
    {
        $data_opt = AdminKecamatan::where('email', Auth::user()->email)->first();

        return Inertia::render('OperatorKecamatan/CamatKeuchik', [
            'base_url' => url('/'),
            'data_opt' => $data_opt
        ]);
    }

    public function camat_keuchik_detail($id)
    {
        $data = AmprahamKPM::where('ampraham_kpm_tbl.id', $id)
            ->first();
        return Inertia::render('OperatorKecamatan/DetailCamatKeuchik', ['data' => $data, 'base_url' => url('/')]);
    }


    public function camat_keuchik_add()
    {
        $data_opt = AdminKecamatan::where('email', Auth::user()->email)->first();
        return Inertia::render('OperatorKecamatan/AddCamatKeuchik', [
            'base_url' => url('/'),
            'data_opt' => $data_opt
        ]);
    }
    public function query(Request $request)
    {
        $query = AmprahamKPM::where('id_kecamatan', $request->id_kecamatan);

        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('nama_di_buku_rekening', 'like', '%' . $request->search_key . '%')
                    ->orWhere('nip', 'like', '%' . $request->search_key . '%')
                    ->orWhere('kecamatan', 'like', '%' . $request->search_key . '%')
                    ->orWhere('desa', 'like', '%' . $request->search_key . '%');
            });
        }

        $query->selectRaw('
        ROW_NUMBER() OVER (ORDER BY id) AS row_index,
        id,
        name,
        nama_di_buku_rekening,
        nip,
        pangkat_dan_golongan,
        jabatan,
        kecamatan,
        desa,
        nama_bank,
        no_rekening,
        no_npwp,
        link_document,
        status,
        keterangan,
        created_at,
        updated_at,
        id_kecamatan
    ');
        $data = $query->paginate(10);

        return response()->json($data);
    }

    public function delete($id)
    {

        DB::beginTransaction();
        try {
            $ampraham = AmprahamKPM::find($id);

            $link_doc = $ampraham->link_document;
            if (Storage::exists($link_doc)) {
                Storage::delete($link_doc);
            }

            $ampraham->delete();

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => 'Record successfully deleted'
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
