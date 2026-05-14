<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sertifikat;
use App\Models\Gelombang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SertifikatMahasiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Sertifikat::query()
                ->leftJoin('gelombang_tbl', 'sertifikat_tbl.id_gelombang', '=', 'gelombang_tbl.id')
                ->select(
                    'sertifikat_tbl.*',
                    'gelombang_tbl.name as nama_gelombang',
                );
            
            // Search by kode or bulan_tahun
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('kode', 'like', "%{$search}%")
                      ->orWhere('bulan_tahun', 'like', "%{$search}%")
                      ->orWhereHas('gelombang', function ($subQuery) use ($search) {
                          $subQuery->where('nama_gelombang', 'like', "%{$search}%");
                      });
                });
            }
            
            // Filter by gelombang
            if ($request->has('id_gelombang') && $request->id_gelombang) {
                $query->where('sertifikat_tbl.id_gelombang', $request->id_gelombang);
            }
            
            // Filter by status cetak
            if ($request->has('status') && $request->status) {
                $query->where('open_print_certificate', $request->status === 'active');
            }
            
            // Filter by bulan_tahun
            if ($request->has('bulan_tahun') && $request->bulan_tahun) {
                $query->where('bulan_tahun', $request->bulan_tahun);
            }
            
            // Sorting
            $sortField = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_dir', 'desc');
            
            // Map frontend field names to database columns
            $fieldMap = [
                'tanggal_surat' => 'tanggal_surat',
                'created_at' => 'sertifikat_tbl.created_at',
                'nama_gelombang' => 'gelombang_tbl.nama_gelombang',
                'kode' => 'kode',
                'bulan_tahun' => 'bulan_tahun'
            ];
            
            $sortField = $fieldMap[$sortField] ?? 'sertifikat_tbl.created_at';
            $query->orderBy($sortField, $sortDirection);
            
            // Pagination
            $perPage = $request->get('per_page', 10);
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
                'message' => 'Gagal mengambil data sertifikat',
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
            'kode' => 'required|string|max:20',
            'kode_universitas' => 'nullable|string|max:20',
            'kode_idc' => 'nullable|string|max:20',
            'kode_jenis_surat' => 'nullable|string|max:20',
            'bulan_tahun' => 'required|string|max:20',
            'open_print_certificate' => 'boolean',
            'base_number' => 'integer|min:0',
            'tanggal_surat' => 'required|string',
            'id_gelombang' => 'required|integer',
            'template_sertifikat' => 'nullable|string|max:255'
        ], [
            'kode.required' => 'Kode sertifikat wajib diisi',
            'kode.max' => 'Kode maksimal 20 karakter',
            'bulan_tahun.required' => 'Bulan tahun wajib diisi',
            'base_number.min' => 'Base number minimal 0',
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
            
          
            
            $sertifikat = Sertifikat::create([
                'kode' => $request->kode,
                'kode_universitas' => $request->kode_universitas ?? '/Un.08',
                'kode_idc' => $request->kode_idc ?? '/IDC',
                'kode_jenis_surat' => $request->kode_jenis_surat ?? '/Kp.07.6',
                'bulan_tahun' => $request->bulan_tahun,
                'open_print_certificate' => $request->open_print_certificate ?? false,
                'base_number' => $request->base_number ?? 0,
                'tanggal_surat' => $request->tanggal_surat,
                'id_gelombang' => $request->id_gelombang,
                'template_sertifikat' => $request->template_sertifikat,
       
            ]);

            DB::commit();

            
            return response()->json([
                'status' => 'success',
                'message' => 'Sertifikat berhasil ditambahkan',
                'data' => $sertifikat
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan sertifikat',
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
            $sertifikat = Sertifikat::with('gelombang')->find($id);
            
            if (!$sertifikat) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data sertifikat tidak ditemukan'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $sertifikat
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail sertifikat',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $sertifikat = Sertifikat::find($id);
        
        if (!$sertifikat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data sertifikat tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:20',
            'kode_universitas' => 'nullable|string|max:20',
            'kode_idc' => 'nullable|string|max:20',
            'kode_jenis_surat' => 'nullable|string|max:20',
            'bulan_tahun' => 'required|string|max:20',
            'open_print_certificate' => 'boolean',
            'base_number' => 'integer|min:0',
            'tanggal_surat' => 'required|string',
            'id_gelombang' => 'required|integer',
            'template_sertifikat' => 'nullable|string|max:255'
        ], [
            'kode.required' => 'Kode sertifikat wajib diisi',
            'kode.max' => 'Kode maksimal 20 karakter',
            'bulan_tahun.required' => 'Bulan tahun wajib diisi',
            'base_number.min' => 'Base number minimal 0',
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
                'kode' => $request->kode,
                'kode_universitas' => $request->kode_universitas ?? $sertifikat->kode_universitas,
                'kode_idc' => $request->kode_idc ?? $sertifikat->kode_idc,
                'kode_jenis_surat' => $request->kode_jenis_surat ?? $sertifikat->kode_jenis_surat,
                'bulan_tahun' => $request->bulan_tahun,
                'open_print_certificate' => $request->has('open_print_certificate') 
                    ? $request->open_print_certificate 
                    : $sertifikat->open_print_certificate,
                'base_number' => $request->base_number ?? $sertifikat->base_number,
                'tanggal_surat' => $request->tanggal_surat ?? $sertifikat->tanggal_surat,
                'id_gelombang' => $request->id_gelombang ?? $sertifikat->id_gelombang,
                'template_sertifikat' => $request->template_sertifikat ?? $sertifikat->template_sertifikat,
                'nomor_surat' => $this->generateCertificateNumber($request, $sertifikat)
            ]);

            DB::commit();
            
            
            return response()->json([
                'status' => 'success',
                'message' => 'Sertifikat berhasil diperbarui',
                'data' => $sertifikat
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui sertifikat',
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
            $sertifikat = Sertifikat::find($id);
            
            if (!$sertifikat) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data sertifikat tidak ditemukan'
                ], 404);
            }

            DB::beginTransaction();
            $sertifikat->delete();
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Sertifikat berhasil dihapus'
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
                'message' => 'Gagal menghapus sertifikat',
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
            $sertifikat = Sertifikat::find($id);
            
            if (!$sertifikat) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data sertifikat tidak ditemukan'
                ], 404);
            }

            DB::beginTransaction();
            
            $sertifikat->open_print_certificate = !$sertifikat->open_print_certificate;
            $sertifikat->save();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Status cetak berhasil diubah',
                'data' => [
                    'id' => $sertifikat->id,
                    'open_print_certificate' => $sertifikat->open_print_certificate
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengubah status cetak',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Generate certificate number
     */
    private function generateCertificateNumber(Request $request, $existingSertifikat = null)
    {
        // Format: {kode}/{kode_universitas}/{kode_idc}/{kode_jenis_surat}/{bulan_tahun}/{base_number+1}
        $kode = $request->kode ?? ($existingSertifikat->kode ?? 'B-');
        $kodeUniversitas = $request->kode_universitas ?? ($existingSertifikat->kode_universitas ?? '/Un.08');
        $kodeIdc = $request->kode_idc ?? ($existingSertifikat->kode_idc ?? '/IDC');
        $kodeJenisSurat = $request->kode_jenis_surat ?? ($existingSertifikat->kode_jenis_surat ?? '/Kp.07.6');
        $bulanTahun = $request->bulan_tahun ?? ($existingSertifikat->bulan_tahun ?? date('m/Y'));
        $baseNumber = $request->base_number ?? ($existingSertifikat->base_number ?? 0);
        
        // Increment base number for new certificates
        if (!$existingSertifikat) {
            $lastCertificate = Sertifikat::where('bulan_tahun', $bulanTahun)
                ->orderBy('base_number', 'desc')
                ->first();
            
            if ($lastCertificate) {
                $baseNumber = $lastCertificate->base_number + 1;
            }
        }
        
        // Format base number dengan 3 digit
        $formattedBaseNumber = str_pad($baseNumber + 1, 3, '0', STR_PAD_LEFT);
        
        return "{$kode}{$kodeUniversitas}{$kodeIdc}{$kodeJenisSurat}/{$bulanTahun}/{$formattedBaseNumber}";
    }

    /**
     * Get latest certificate data
     */
    public function getLatestCertificate()
    {
        try {
            $latest = Sertifikat::with('gelombang')
                ->latest('id')
                ->first();
            
            // Generate suggested next number
            $suggestedNumber = 1;
            $lastBaseNumber = 0;
            
            if ($latest) {
                $lastBaseNumber = $latest->base_number;
                $suggestedNumber = $lastBaseNumber + 1;
                
                // Extract month/year from bulan_tahun
                $bulanTahun = $latest->bulan_tahun;
                $currentBulanTahun = date('m/Y');
                
                // Reset base number if month/year changes
                if ($bulanTahun !== $currentBulanTahun) {
                    $suggestedNumber = 1;
                }
            }
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'latest_certificate' => $latest,
                    'suggested_base_number' => $suggestedNumber,
                    'suggested_bulan_tahun' => date('m/Y'),
                    'suggested_kode' => 'B-',
                    'suggested_kode_universitas' => '/Un.08',
                    'suggested_kode_idc' => '/IDC',
                    'suggested_kode_jenis_surat' => '/Kp.07.6'
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendapatkan data sertifikat terbaru',
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
            $total = Sertifikat::count();
            $active = Sertifikat::where('open_print_certificate', true)->count();
            $inactive = Sertifikat::where('open_print_certificate', false)->count();
            
            // Get certificates by gelombang
            $byGelombang = Sertifikat::select('id_gelombang', DB::raw('count(*) as total'))
                ->groupBy('id_gelombang')
                ->with('gelombang')
                ->get();
            
            // Get certificates by bulan_tahun
            $byBulanTahun = Sertifikat::select('bulan_tahun', DB::raw('count(*) as total'))
                ->groupBy('bulan_tahun')
                ->orderBy('bulan_tahun', 'desc')
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_certificates' => $total,
                    'active_certificates' => $active,
                    'inactive_certificates' => $inactive,
                    'by_gelombang' => $byGelombang,
                    'by_bulan_tahun' => $byBulanTahun
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
     * Bulk delete
     */
    public function bulkDestroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:sertifikat_tbl,id'
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
            
            $deletedCount = Sertifikat::whereIn('id', $request->ids)->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => "Berhasil menghapus {$deletedCount} data sertifikat",
                'deleted_count' => $deletedCount
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus data sertifikat',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get available bulan_tahun options
     */
    public function getBulanTahunOptions()
    {
        try {
            $options = Sertifikat::select('bulan_tahun')
                ->distinct()
                ->orderBy('bulan_tahun', 'desc')
                ->get()
                ->pluck('bulan_tahun');
            
            return response()->json([
                'status' => 'success',
                'data' => $options
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil opsi bulan tahun',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
}