<?php

namespace App\Http\Controllers\Admin\PPL;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use Error;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

use function PHPUnit\Framework\isEmpty;

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
                'sm.regency',
                'sm.sub_district',
                'sm.village',
                'sm.username_supervisor',
                'usr.name as nama_supervisor',
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
                ->leftJoin('users as usr', 'sekolah_tbl.username_supervisor', '=', 'usr.username')
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
        $sortOrder = $request->query('sortOrder', 'desc');
        $perPage = $request->query('perPage', 10);
        $idGelombang = $request->query('idGelombang');

        try {
            $query->select(
                'sekolah_tbl.id as id',
                'sm.name',
                'sm.regency',
                'sm.sub_district',
                'sm.village',
                'sm.username_supervisor',
                'usr.name as nama_supervisor',
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
                ->leftJoin('users as usr', 'sekolah_tbl.username_supervisor', '=', 'usr.username')
                ->where('sekolah_tbl.id_gelombang', $idGelombang)
                ->when($search, function ($q) use ($search) {
                    $q->where('sm.name', 'LIKE', "%$search%");
                })
                ->groupBy(
                    'sekolah_tbl.id',

                )
                ->orderBy($sortBy, $sortOrder);


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
}
