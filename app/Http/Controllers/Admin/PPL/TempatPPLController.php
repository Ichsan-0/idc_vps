<?php

namespace App\Http\Controllers\Admin\PPL;

use App\Exports\PesertaPPLTemplateExport;
use App\Exports\TempatPPLTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\PesertaPPLImport;
use App\Imports\TempatPPLImport;
use App\Models\Sekolah;
use Error;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class TempatPPLController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/pages/PPL/tempatppl/ListTempatPPL');
    }

    public function deleteTempatPPLById($id){
        try {
            $sekolah = Sekolah::find($id);
            if (empty($id) || !$id) throw new Error('Bad Request', 400);
            if (!$sekolah) throw new Error('Tempat PPL tidak ditemukan', 404);

           
            $sekolah = $sekolah->delete();

            return response()->json([
                'message' => "Successfully delete data",
                'data' => $sekolah
            ]);
        } catch (Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
                'status' => $code
            ], 500);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }

    }

    public function view(Request $request)
    {
        $idTempatPPL = $request->query('x');
        return Inertia::render('Admin/pages/PPL/tempatppl/ViewTempatPPL', [
            'data' => [
                'id' => $idTempatPPL
            ]
        ]);
    }

    public function updateDataTempatPPLByID(Request $request, $id)
    {
        try {
            $sekolah = Sekolah::find($id);
            if (empty($id) || !$id) throw new Error('Bad Request', 400);
            if (!$sekolah) throw new Error('Tempat PPL tidak ditemukan', 404);

            $validator  = Validator::make($request->all(), [
                'username_supervisor' => 'string',
                'id_gelombang' => 'required|string',
                'id_sekolah' => 'required|string'

            ]);
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation Error',
                    'errors' => $validator->errors(),
                ], 422);
            }
            $data = [
                'username_supervisor' => $request->username_supervisor,
                'id_sekolah' => $request->id_sekolah,
                'id_gelombang' => $request->id_gelombang
            ];
            $sekolah = $sekolah->update($data);

            return response()->json([
                'message' => "Successfully update school data",
                'data' => $sekolah
            ]);
        } catch (Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
            ], $code);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getDataTempatPPLByID(Request $request)
    {
        $idTempatPPL = $request->query('x');
        $query = Sekolah::query();

        try {
            $query->select(
                'sekolah_tbl.id as id',
                'sm.name as nama_sekolah',
                'sm.id as id_sekolah',
                DB::raw('COALESCE(sekolah_tbl.regency, sm.regency) as regency'),
                DB::raw('COALESCE(sekolah_tbl.sub_district, sm.sub_district) as sub_district'),
                DB::raw('COALESCE(sekolah_tbl.village, sm.village) as village'),
                DB::raw('COALESCE(sekolah_tbl.username_supervisor, sm.username_supervisor) as username_supervisor'),
                DB::raw('(SELECT u.name FROM users u WHERE u.username = COALESCE(NULLIF(sekolah_tbl.username_supervisor, ""), sm.username_supervisor) LIMIT 1) as nama_supervisor'),
                'sekolah_tbl.id_gelombang',
                // 'lppl.username_mahasiswa',
                DB::raw('COUNT(DISTINCT lppl.username_mahasiswa) as total'),
                DB::raw('COUNT(DISTINCT lpt.id) as total_lowongan'),
                DB::raw('(SELECT COALESCE(SUM(q.quota), 0) FROM lowongan_ppl_tbl q WHERE q.id_sekolah = sekolah_tbl.id) as total_kuota'),
                DB::raw("SUM(CASE WHEN mtb.jk = 'Pria' THEN 1 ELSE 0 END) as total_male"),
                DB::raw("SUM(CASE WHEN mtb.jk = 'Wanita' THEN 1 ELSE 0 END) as total_female"),


            )
                ->join('sekolah_master as sm', 'sekolah_tbl.id_sekolah', '=', 'sm.id')
                ->leftJoin('lowongan_ppl_tbl as lpt', 'sekolah_tbl.id', '=', 'lpt.id_sekolah')
                ->leftJoin('lamaran_ppl_tbl as lppl', function ($join) {
                    $join->on('lpt.id', '=', 'lppl.id_lowongan_ppl')
                        ->where('lppl.status', '=', 'accepted');
                })
                ->leftJoin('mahasiswa_tbl as mtb', 'lppl.username_mahasiswa', '=', 'mtb.nim')
                ->where('sekolah_tbl.id', $idTempatPPL)

                ->groupBy(
                    'sekolah_tbl.id',

                );


            $data = $query->first();

            return response()->json([
                'message' => "Successfully get data",
                'data' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
            ], 500);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getTempatPPL(Request $request)
    {
        $query = Sekolah::query();
        $search = $request->query('search');
        $sortBy = $request->query('sortBy', 'created_at');
        $sortOrder = strtolower($request->query('sortOrder', 'desc')) === 'asc' ? 'asc' : 'desc';
        $perPage = $request->query('perPage', 10);
        $idGelombang = $request->query('idGelombang');

        $sortColumnMap = [
            'id' => 'sekolah_tbl.id',
            'created_at' => 'sekolah_tbl.created_at',
            'name' => 'sm.name',
            'nama_sekolah' => 'sm.name',
            'regency' => 'regency',
            'sub_district' => 'sub_district',
            'village' => 'village',
            'username_supervisor' => 'username_supervisor',
            'nama_supervisor' => 'nama_supervisor',
            'total' => 'total',
            'total_lowongan' => 'total_lowongan',
            'total_kuota' => 'total_kuota',
            'total_male' => 'total_male',
            'total_female' => 'total_female',
        ];
        $actualSortBy = $sortColumnMap[$sortBy] ?? 'sekolah_tbl.created_at';

        try {
            $query->select(
                'sekolah_tbl.id as id',
                'sm.name',
                DB::raw('COALESCE(sekolah_tbl.regency, sm.regency) as regency'),
                DB::raw('COALESCE(sekolah_tbl.sub_district, sm.sub_district) as sub_district'),
                DB::raw('COALESCE(sekolah_tbl.village, sm.village) as village'),
                DB::raw('COALESCE(sekolah_tbl.username_supervisor, sm.username_supervisor) as username_supervisor'),
                DB::raw('(SELECT u.name FROM users u WHERE u.username = COALESCE(NULLIF(sekolah_tbl.username_supervisor, ""), sm.username_supervisor) LIMIT 1) as nama_supervisor'),
                // 'lppl.username_mahasiswa',
                DB::raw('COUNT(DISTINCT lppl.username_mahasiswa) as total'),
                DB::raw('COUNT(DISTINCT lpt.id) as total_lowongan'),
                DB::raw('(SELECT COALESCE(SUM(q.quota), 0) FROM lowongan_ppl_tbl q WHERE q.id_sekolah = sekolah_tbl.id) as total_kuota'),
                DB::raw("SUM(CASE WHEN mtb.jk = 'Pria' THEN 1 ELSE 0 END) as total_male"),
                DB::raw("SUM(CASE WHEN mtb.jk = 'Wanita' THEN 1 ELSE 0 END) as total_female"),


            )
                ->join('sekolah_master as sm', 'sekolah_tbl.id_sekolah', '=', 'sm.id')
                ->leftJoin('lowongan_ppl_tbl as lpt', 'sekolah_tbl.id', '=', 'lpt.id_sekolah')
                ->leftJoin('lamaran_ppl_tbl as lppl', function ($join) {
                    $join->on('lpt.id', '=', 'lppl.id_lowongan_ppl')
                        ->where('lppl.status', '=', 'accepted');
                })
                ->leftJoin('mahasiswa_tbl as mtb', 'lppl.username_mahasiswa', '=', 'mtb.nim')
                ->where('sekolah_tbl.id_gelombang', $idGelombang)
                ->when($search, function ($q) use ($search) {
                    $q->where('sm.name', 'LIKE', "%$search%");
                })
                ->groupBy(
                    'sekolah_tbl.id',

                )
                ->orderBy($actualSortBy, $sortOrder);


            $data = $query->paginate($perPage);

            return response()->json([
                'message' => "Successfully get data",
                'data' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
            ], 500);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function addTempatPPL(Request $request) {
        // return response()->json(['test']);
        try {
            $validator  = Validator::make($request->all(), [
                'username_supervisor' => 'string',
                'id_gelombang' => 'required|string',
                'id_sekolah' => 'required|string'
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation Error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Cek apakah lokasi sekolah sudah ada pada tahun ajaran / gelombang yang dipilih
            $alreadyExists = Sekolah::where('id_gelombang', $request->id_gelombang)
                ->where(function ($q) use ($request) {
                    $q->where('id_sekolah', $request->id_sekolah);
                    if ($request->name) {
                        $q->orWhere('name', 'LIKE', trim($request->name));
                    }
                })
                ->exists();

            if ($alreadyExists) {
                return response()->json([
                    'message' => 'Data tempat / lokasi PPL sudah ada pada tahun ajaran yang dipilih.',
                    'errors' => [
                        'id_sekolah' => ['Data tempat / lokasi PPL sudah ada pada tahun ajaran yang dipilih.']
                    ]
                ], 422);
            }

            $data = [
                'username_supervisor' => $request->username_supervisor,
                'id_sekolah' => $request->id_sekolah,
                'id_gelombang' => $request->id_gelombang,
                'name' => $request->name
            ];
            $sekolah = Sekolah::create($data);

            return response()->json([
                'message' => "Successfully add school data",
                'data' => $sekolah
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() ?: 500;
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
                'status' => $code
            ], 500);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function importTempatPPL(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
                'id_gelombang' => 'required',
            ], [
                'file.required' => 'File Excel wajib diunggah.',
                'file.file' => 'Format file tidak valid.',
                'file.mimes' => 'File harus berupa Excel (.xlsx, .xls) atau .csv.',
                'file.max' => 'Ukuran file maksimal 10MB.',
                'id_gelombang.required' => 'Gelombang / Tahun Ajaran wajib dipilih.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $idGelombang = $request->input('id_gelombang');
            $import = new TempatPPLImport($idGelombang);
            Excel::import($import, $request->file('file'));

            // 1. Cek jika terdapat duplikasi di dalam file yang diunggah
            $duplicateInFile = $import->getDuplicateInFile();
            if (!empty($duplicateInFile)) {
                $dupStr = implode(', ', $duplicateInFile);
                $errorMsg = "Terdapat duplikasi nama sekolah di dalam file Excel yang diunggah: {$dupStr}.";

                return response()->json([
                    'message' => $errorMsg,
                    'error' => $errorMsg,
                    'duplicate_schools' => $duplicateInFile,
                ], 422);
            }

            $imported = $import->getImportedCount();
            $updated = $import->getUpdatedCount();
            $lowonganCount = $import->getLowonganCreatedCount();

            if ($imported === 0 && $updated === 0 && $lowonganCount === 0) {
                return response()->json([
                    'message' => 'Tidak ada data tempat PPL yang valid untuk diimpor dari file Excel.',
                    'error' => 'Data Excel kosong atau nama sekolah tidak ditemukan.',
                ], 422);
            }

            $parts = [];
            if ($imported > 0) {
                $parts[] = "{$imported} data sekolah baru ditambahkan";
            }
            if ($updated > 0) {
                $parts[] = "{$updated} data sekolah diperbarui";
            }
            if ($lowonganCount > 0) {
                $parts[] = "{$lowonganCount} kuota jurusan disinkronkan";
            }
            $msg = "Berhasil mengimpor: " . implode(', ', $parts) . ".";

            return response()->json([
                'message' => $msg,
                'data' => [
                    'imported' => $imported,
                    'updated' => $updated,
                    'lowongan_count' => $lowonganCount,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengimpor data: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function downloadTemplate(Request $request)
    {
        $idGelombang = $request->query('id_gelombang');
        return Excel::download(new TempatPPLTemplateExport($idGelombang), 'template_import_tempat_ppl.xlsx');
    }

    public function downloadPesertaTemplate(Request $request)
    {
        $idGelombang = $request->query('id_gelombang');
        return Excel::download(new PesertaPPLTemplateExport($idGelombang), 'template_import_peserta_ppl.xlsx');
    }

    public function importPesertaPPL(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls,csv|max:15360',
                'id_gelombang' => 'nullable',
            ], [
                'file.required' => 'File Excel wajib diunggah.',
                'file.file' => 'Format file tidak valid.',
                'file.mimes' => 'File harus berupa Excel (.xlsx, .xls) atau .csv.',
                'file.max' => 'Ukuran file maksimal 15MB.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $idGelombang = $request->input('id_gelombang');
            $import = new PesertaPPLImport($idGelombang);
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $updated = $import->getUpdatedCount();
            $skipped = $import->getSkippedCount();
            $errors = $import->getErrors();

            $message = "Berhasil mengimpor {$imported} data peserta PPL baru";
            if ($updated > 0) {
                $message .= ", memperbarui {$updated} data peserta";
            }
            if ($skipped > 0) {
                $message .= ", {$skipped} data dilewati (sekolah tidak cocok/tidak valid)";
            }
            $message .= ".";

            return response()->json([
                'message' => $message,
                'data' => [
                    'imported' => $imported,
                    'updated' => $updated,
                    'skipped' => $skipped,
                    'errors' => $errors,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengimpor data peserta: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
