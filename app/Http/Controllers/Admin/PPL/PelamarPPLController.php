<?php

namespace App\Http\Controllers\Admin\PPL;

use App\Exports\PelamarPPLTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\PelamarPPLImport;
use App\Models\LamaranPPL;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class PelamarPPLController extends Controller
{
    public function listWithPaginate(Request $request)
    {
        $query = LamaranPPL::query();
        try {
            $idSekolah = $request->query('id_sekolah');
            $search = $request->query('search');
            $sortBy = $request->query('sortBy', 'created_at'); // default column
            $sortOrder = strtoupper($request->query('sortOrder', 'desc'));
            $perPage = $request->query('perPage', 10);


            $query
                ->select(
                    'lamaran_ppl_tbl.id',
                    'lamaran_ppl_tbl.username_mahasiswa',
                    'ptbl.name as nama_prodi',
                    'lppl.name as nama_lowongan',
                    'mtbl.jk',
                    'lppl.id as id_lowongan',
                    'usr.name as name',
                    'lamaran_ppl_tbl.status'
                )
                ->join('users as usr', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'usr.username')
                ->join('lowongan_ppl_tbl as lppl', 'lamaran_ppl_tbl.id_lowongan_ppl', '=', 'lppl.id')
                ->join('mahasiswa_tbl as mtbl', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'mtbl.nim')
                ->join('prodi_tbl as ptbl', 'mtbl.id_prodi', '=', 'ptbl.id')
                ->where('lppl.id_sekolah', $idSekolah);
              
                

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('lppl.name', 'like', "%{$search}%")
                        ->orWhere('ptbl.name', 'like', "%{$search}%")
                        ->orWhere('mtbl.nim', 'like', "%{$search}%")
                        ->orWhere('usr.name', 'like', "%{$search}%")
                        ->orWhere('mtbl.jk', 'like', "%{$search}%")
                        ->orWhere('lamaran_ppl_tbl.status', 'like', "%{$search}%");
                });
            }

            $allowedSortColumns = [
                'name',
                'nim',
                'prodi',
                'jenis_kelamin',
                'lowongan',
                'status'
            ];

            $mappedSort = [
                'name' => 'usr.name',
                'nim' => 'lamaran_ppl_tbl.username_mahasiswa',
                'prodi' => 'ptbl.name',
                'jenis_kelamin' => 'mtbl.jk',
                'lowongan' => 'lppl.name',
                'status' => 'lamaran_ppl_tbl.status'
            ];

            if (in_array($sortBy, $allowedSortColumns)) {
                if (in_array($sortBy, ['total_quota', 'total_terisi'])) {
                    $query->orderByRaw("$mappedSort[$sortBy] $sortOrder");
                } else {
                    $query->orderBy($mappedSort[$sortBy], $sortOrder);
                }
            } else {
                $query->orderBy('lamaran_ppl_tbl.created_at', 'desc');
            }

            $data = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data lowongan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function addPelamar(Request $request) {

        $validator = Validator::make($request->all(), [
            'keterangan' => 'required|string',
            'id_lowongan_ppl' => 'required|string',
            'status' => 'required',
            'keterangan' => 'required|string',
            'username_mahasiswa' => 'required|string'
        ]);
        try {
            
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = [
                'keterangan' => $request->keterangan,
                'id_lowongan_ppl' => $request->id_lowongan_ppl,
                'status' => $request->status,
                'keterangan' => $request->keterangan,
                'username_mahasiswa' => $request->username_mahasiswa
            ];

            $lamaran = LamaranPPL::create($data);

            return response()->json([
                'status' => 201,
                'message' => "Successfully add new student",
                'data' => $lamaran
            ]);
        } catch (Exception $e) {
            return response([
                'status' => $e->getCode(),
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function deletePelamarById($id) {
        try {
            $lamaran = LamaranPPL::find($id);
            if (!$lamaran) {
                return response()->json([
                    'message' => 'Lamaran tidak ditemukan',
                    'errors' => "Lamaran tidak ditemukan"
                ], 404);
            }
            $lamaran->delete();
            return response()->json([
                'message' => "Sucessfully delete data",
            ], 200);
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

    public function updatePelamarById(Request $request, $id) {

        $validator = Validator::make($request->all(), [
            'keterangan' => 'required|string',
            'id_lowongan_ppl' => 'required|string',
            'status' => 'required',
            'keterangan' => 'required|string',
            'username_mahasiswa' => 'required|string'
        ]);
        try {
            $lamaran = LamaranPPL::find($id);
            if (!$lamaran) {
                return response()->json([
                    'message' => 'Lamaran tidak ditemukan',
                    'errors' => "Lamaran tidak ditemukan"
                ], 404);
            }
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = [
                'id_lowongan_ppl' => $request->id_lowongan_ppl,
                'status' => $request->status,
                'keterangan' => $request->keterangan,
            ];

            $lamaran = $lamaran->update($data);

            return response()->json([
                'status' => 200,
                'message' => "Successfully add new student",
                'data' => $lamaran
            ]);
        } catch (Exception $e) {
            return response([
                'status' => $e->getCode(),
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getPelamarPPLById(Request $request) {
        $idLamaran = $request->query('x');

        $query = LamaranPPL::query();

        try {
            $query
                ->select(
                    'lamaran_ppl_tbl.username_mahasiswa',
                    'lamaran_ppl_tbl.keterangan',
                    'usr.name as nama_mahasiswa',
                    'lamaran_ppl_tbl.status',
                    'lamaran_ppl_tbl.id_lowongan_ppl',
                    'lamaran_ppl_tbl.id'
                
                )
                ->join('users as usr', 'lamaran_ppl_tbl.username_mahasiswa', '=','usr.username')
                ->where('lamaran_ppl_tbl.id', $idLamaran);


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

    public function importMahasiswa(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
                'id_sekolah' => 'required|exists:sekolah_tbl,id',
            ], [
                'file.required' => 'File Excel wajib diunggah.',
                'file.file' => 'Format file tidak valid.',
                'file.mimes' => 'File harus berupa Excel (.xlsx, .xls) atau .csv.',
                'file.max' => 'Ukuran file maksimal 10MB.',
                'id_sekolah.required' => 'ID Sekolah / Tempat PPL wajib disertakan.',
                'id_sekolah.exists' => 'Data Tempat PPL tidak valid.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $idSekolah = $request->input('id_sekolah');
            $defaultIdLowongan = $request->input('id_lowongan_ppl');

            $import = new PelamarPPLImport($idSekolah, $defaultIdLowongan);
            Excel::import($import, $request->file('file'));

            $imported = $import->getImportedCount();
            $skipped = $import->getSkippedCount();

            return response()->json([
                'message' => "Berhasil mengimpor {$imported} mahasiswa ke lokasi PPL" . ($skipped > 0 ? " ({$skipped} data dilewati / sudah terdaftar)" : "") . ".",
                'data' => [
                    'imported' => $imported,
                    'skipped' => $skipped,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengimpor data: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        return Excel::download(new PelamarPPLTemplateExport, 'template_import_mahasiswa_ppl.xlsx');
    }
}
