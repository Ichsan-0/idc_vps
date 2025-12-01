<?php

namespace App\Http\Controllers\Admin\PPL;

use App\Http\Controllers\Controller;
use App\Models\LowonganPPL;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class LowonganPPLController extends Controller
{
    public function listWithPaginate(Request $request)
    {
        try {
            $idSekolah = $request->query('id_sekolah');
            $search = $request->query('search');
            $sortBy = $request->query('sortBy', 'created_at'); // default column
            $sortOrder = strtoupper($request->query('sortOrder', 'desc'));
            $perPage = $request->query('perPage', 10);

            $query = LowonganPPL::query();

            $query
                ->select(
                    'lowongan_ppl_tbl.id',
                    'lowongan_ppl_tbl.name',
                    'ptbl.name as nama_prodi',
                    'ptbl.id as id_prodi',
                    DB::raw('SUM(lowongan_ppl_tbl.quota) as total_quota'),
                    DB::raw('COUNT(lppl.username_mahasiswa) as total_terisi')
                )
                ->leftJoin('lamaran_ppl_tbl as lppl', 'lowongan_ppl_tbl.id', '=', 'lppl.id_lowongan_ppl')
                ->join('prodi_tbl as ptbl', 'lowongan_ppl_tbl.id_prodi', '=', 'ptbl.id')
                ->where('lowongan_ppl_tbl.id_sekolah', $idSekolah)
                ->where(function ($q) {
                    $q->whereNull('lppl.status')
                        ->orWhere('lppl.status', 'accepted');
                })
                ->groupBy(
                    'lowongan_ppl_tbl.id',
                    'lowongan_ppl_tbl.name',
                    'ptbl.name',
                    'ptbl.id',
                    'lowongan_ppl_tbl.id_sekolah'
                );

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('lowongan_ppl_tbl.name', 'like', "%{$search}%")
                        ->orWhere('ptbl.name', 'like', "%{$search}%");
                });
            }

            $allowedSortColumns = [
                'name',
                'nama_prodi',
                'total_quota',
                'total_terisi',
            ];

            $mappedSort = [
                'name' => 'lowongan_ppl_tbl.name',
                'nama_prodi' => 'ptbl.name',
                'total_quota' => 'total_quota',
                'total_terisi' => 'total_terisi',
            ];

            if (in_array($sortBy, $allowedSortColumns)) {
                if (in_array($sortBy, ['total_quota', 'total_terisi'])) {
                    $query->orderByRaw("$mappedSort[$sortBy] $sortOrder");
                } else {
                    $query->orderBy($mappedSort[$sortBy], $sortOrder);
                }
            } else {
                $query->orderBy('lowongan_ppl_tbl.created_at', 'desc');
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

    public function addLowongan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'keterangan' => 'required|string',
            'id_sekolah' => 'required|string',
            'id_prodi' => 'required',
            'name' => 'required|string',
            'quota' => 'required',
        ]);
        try {
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = [
                'description' => $request->keterangan,
                'id_sekolah' => $request->id_sekolah,
                'id_prodi' => $request->id_prodi,
                'name' => $request->name,
                'quota' => $request->quota
            ];

            $lowongan = LowonganPPL::create($data);

            return response()->json([
                'status' => 201,
                'message' => "Successfully add new vacancy",
                'data' => $lowongan
            ]);
        } catch (Exception $e) {
            return response([
                'status' => $e->getCode(),
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updateLowongan(Request $request, $id)
    {
        $idLowongan = $id;
        $validator = Validator::make($request->all(), [
            'keterangan' => 'required|string',
            'id_prodi' => 'required',
            'name' => 'required|string',
            'quota' => 'required',
        ]);
        try {
            $lowongan = LowonganPPL::find($idLowongan);
            if (!$lowongan) {
                return response()->json([
                    'message' => 'Lowongan tidak ditemukan',
                    'errors' => "Lowongan tidak ditemukan"
                ], 404);
            }
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = [
                'keterangan' => $request->keterangan,
                'id_prodi' => $request->id_prodi,
                'name' => $request->name,
                'quota' => $request->quota
            ];

            $lowongan = $lowongan->update($data);

            return response()->json([
                'status' => 200,
                'message' => "Successfully update vacancy",
                'data' => $lowongan
            ]);
        } catch (Exception $e) {
            return response([
                'status' => $e->getCode(),
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getLowonganPPLById(Request $request)
    {
        $idLowongan = $request->query('x');
        $query = LowonganPPL::query();

        try {
            $query->where('id', $idLowongan);


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

    public function deleteLowonganById($id)
    {
        $idLowongan = $id;

        try {
            $lowongan = LowonganPPL::find($idLowongan);
            if (!$lowongan) {
                return response()->json([
                    'message' => 'Lowongan tidak ditemukan',
                    'errors' => "Lowongan tidak ditemukan"
                ], 404);
            }
            $lowongan = $lowongan->delete();

            return response()->json([
                'status' => 200,
                'message' => "Successfully delete vacancy",
                'data' => $lowongan
            ]);
        } catch (Exception $e) {
            return response([
                'status' => $e->getCode(),
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function listLowonganBySekolah(Request $request)
    {
        $idSekolah = $request->query('id_sekolah');

        $data = [];

        try {
            $data = LowonganPPL::where('id_sekolah', $idSekolah)
            ->get();
            return response()->json([
                'status' => 200,
                'message' => "Successfully get lowngan ppl",
                'data' => $data
            ]);
        } catch (Exception $e) {
            return response([
                'status' => $e->getCode(),
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ]);
        }
        
    }
}
