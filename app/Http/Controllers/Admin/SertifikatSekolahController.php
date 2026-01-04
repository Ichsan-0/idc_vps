<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SertifikatSekolahModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SertifikatSekolahController extends Controller
{
     public function index(Request $request)
    {
        try {
            $query = SertifikatSekolahModel::query();

            $query->select(
                'sertifikat_sekolah_tbl.id',
                'sertifikat_sekolah_tbl.periode_ppl',
                'sertifikat_sekolah_tbl.nomor_surat',
                'sertifikat_sekolah_tbl.tanggal_surat',
                'g_tbl.name as nama_gelombang',
                'g_tbl.id as id_gelombang',
                'sertifikat_sekolah_tbl.open_print_certificate'
            )
                ->leftjoin('gelombang_tbl as g_tbl', 'sertifikat_sekolah_tbl.id_gelombang', '=', 'g_tbl.id');

            
            // Filtering
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('sertifikat_sekolah_tbl.nomor_surat', 'like', "%{$search}%")
                      ->orWhere('sertifikat_sekolah_tbl.periode_ppl', 'like', "%{$search}%");
                });
            }
            
            // Filter by periode
            if ($request->has('periode')) {
                $query->where('sertifikat_sekolah_tbl.periode_ppl', $request->periode);
            }

            // Filter by open_print_certificate status
            if ($request->has('open_print')) {
                $query->where('sertifikat_sekolah_tbl.open_print_certificate', $request->open_print === 'true');
            }
            
            // Sorting
            $sortField = "sertifikat_sekolah_tbl.".$request->get('sort_by', 'tanggal_surat');
            $sortDirection = $request->get('sort_dir', 'desc');
            $query->orderBy($sortField, $sortDirection);
            
            // Pagination
            $perPage = $request->get('per_page', 15);
            $data = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $data->items(),
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'last_page' => $data->lastPage(),
                    'per_page' => $data->perPage(),
                    'total' => $data->total(),
                ],
                'links' => [
                    'first' => $data->url(1),
                    'last' => $data->url($data->lastPage()),
                    'prev' => $data->previousPageUrl(),
                    'next' => $data->nextPageUrl(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data sertifikat sekolah',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomor_surat' => 'required|string|max:100|unique:sertifikat_sekolah_tbl,nomor_surat',
            'periode_ppl' => 'required|string|max:50',
            'tanggal_surat' => 'required|string',
            'open_print_certificate' => 'boolean',
            'id_gelombang' => 'required'
        ], [
            'nomor_surat.required' => 'Nomor surat wajib diisi',
            'nomor_surat.unique' => 'Nomor surat sudah digunakan',
            'periode_ppl.required' => 'Periode PPL wajib diisi',
            'tanggal_surat.required' => 'Tanggal surat wajib diisi',
            'tanggal_surat.date' => 'Format tanggal tidak valid',
            'id_gelombang.required'=> "Gelombang wajib diisi"
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            $sertifikat = SertifikatSekolahModel::create([
                'nomor_surat' => $request->nomor_surat,
                'periode_ppl' => $request->periode_ppl,
                'tanggal_surat' => $request->tanggal_surat,
                'open_print_certificate' => $request->open_print_certificate ?? false,
                'id_gelombang' => $request->id_gelombang
            ]);

            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Sertifikat sekolah berhasil ditambahkan',
                'data' => $sertifikat
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan sertifikat sekolah',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $sertifikat = SertifikatSekolahModel::find($id);
            
            if (!$sertifikat) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data sertifikat sekolah tidak ditemukan'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $sertifikat
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail sertifikat sekolah',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $sertifikat = SertifikatSekolahModel::find($id);
        
        if (!$sertifikat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data sertifikat sekolah tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nomor_surat' => 'required|string|max:100|unique:sertifikat_sekolah_tbl,nomor_surat,' . $id,
            'periode_ppl' => 'required|string|max:50',
            'tanggal_surat' => 'required|string',
            'open_print_certificate' => 'boolean',
            'id_gelombang' => 'required'
        ], [
            'nomor_surat.required' => 'Nomor surat wajib diisi',
            'nomor_surat.unique' => 'Nomor surat sudah digunakan',
            'periode_ppl.required' => 'Periode PPL wajib diisi',
            'tanggal_surat.required' => 'Tanggal surat wajib diisi',
            'id_gelombang.required' => 'Gelombang wajib diisi'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            $sertifikat->update([
                'nomor_surat' => $request->nomor_surat,
                'periode_ppl' => $request->periode_ppl,
                'tanggal_surat' => $request->tanggal_surat,
                'open_print_certificate' => $request->has('open_print_certificate') 
                    ? $request->open_print_certificate 
                    : $sertifikat->open_print_certificate,
                'id_gelombang' => $request->id_gelombang
            ]);

            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Sertifikat sekolah berhasil diperbarui',
                'data' => $sertifikat
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui sertifikat sekolah',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $sertifikat = SertifikatSekolahModel::find($id);
            
            if (!$sertifikat) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data sertifikat sekolah tidak ditemukan'
                ], 404);
            }

            DB::beginTransaction();
            $sertifikat->delete();
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Sertifikat sekolah berhasil dihapus'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Check if error is due to foreign key constraint
            if (strpos($e->getMessage(), 'foreign key constraint') !== false) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak dapat menghapus data karena terkait dengan data lain'
                ], 409);
            }
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus sertifikat sekolah',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Bulk delete multiple records
     */
    public function bulkDestroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:sertifikat_sekolah_tbl,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            $deletedCount = SertifikatSekolahModel::whereIn('id', $request->ids)->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => "Berhasil menghapus {$deletedCount} data sertifikat sekolah",
                'deleted_count' => $deletedCount
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus data sertifikat sekolah',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Toggle open_print_certificate status
     */
    public function togglePrintStatus($id)
    {
        try {
            $sertifikat = SertifikatSekolahModel::find($id);
            
            if (!$sertifikat) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data sertifikat sekolah tidak ditemukan'
                ], 404);
            }

            DB::beginTransaction();
            
            $sertifikat->open_print_certificate = !$sertifikat->open_print_certificate;
            $sertifikat->save();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Status print certificate berhasil diubah',
                'data' => [
                    'id' => $sertifikat->id,
                    'open_print_certificate' => $sertifikat->open_print_certificate
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengubah status print certificate',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get latest certificate number
     */
    public function getLatestCertificateNumber()
    {
        try {
            $latest = SertifikatSekolahModel::latest('id')->first();
            
            $nomorSurat = '001';
            if ($latest && preg_match('/\d+$/', $latest->nomor_surat, $matches)) {
                $lastNumber = intval($matches[0]);
                $nomorSurat = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'suggested_number' => $nomorSurat,
                    'latest_certificate' => $latest
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendapatkan nomor sertifikat terbaru',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    public function getStatistics()
    {
        try {
            $total = SertifikatSekolahModel::count();
            $active = SertifikatSekolahModel::where('open_print_certificate', true)->count();
            $inactive = SertifikatSekolahModel::where('open_print_certificate', false)->count();
            
            // Get certificates by period
            $periods = SertifikatSekolahModel::select('periode_ppl', DB::raw('count(*) as total'))
                ->groupBy('periode_ppl')
                ->orderBy('periode_ppl', 'desc')
                ->get();
            
            // Get recent certificates
            $recent = SertifikatSekolahModel::latest('tanggal_surat')
                ->limit(5)
                ->get(['id', 'nomor_surat', 'periode_ppl', 'tanggal_surat', 'open_print_certificate']);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_certificates' => $total,
                    'active_certificates' => $active,
                    'inactive_certificates' => $inactive,
                    'by_period' => $periods,
                    'recent_certificates' => $recent
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil statistik',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Export data (CSV/Excel)
     */
    public function export(Request $request)
    {
        try {
            $query = SertifikatSekolahModel::query();
            
            // Apply filters if any
            if ($request->has('periode')) {
                $query->where('periode_ppl', $request->periode);
            }
            
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('tanggal_surat', [
                    $request->start_date,
                    $request->end_date
                ]);
            }
            
            $data = $query->get([
                'id',
                'nomor_surat',
                'periode_ppl',
                'tanggal_surat',
                'open_print_certificate',
                'created_at',
                'updated_at'
            ]);
            
            // Return as JSON (you can implement CSV/Excel export here)
            return response()->json([
                'status' => 'success',
                'data' => $data,
                'count' => $data->count(),
                'exported_at' => now()->toDateTimeString()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Check if certificate number exists
     */
    public function checkCertificateNumber(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomor_surat' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nomor sertifikat diperlukan'
            ], 422);
        }

        try {
            $exists = SertifikatSekolahModel::where('nomor_surat', $request->nomor_surat)->exists();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'nomor_surat' => $request->nomor_surat,
                    'exists' => $exists,
                    'available' => !$exists
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memeriksa nomor sertifikat',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
}
