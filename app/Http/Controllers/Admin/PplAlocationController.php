<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gelombang;
use App\Models\KelasPPLModel;
use App\Models\LowonganPPL;
use App\Models\Prodi;
use App\Models\Sekolah;
use App\Models\SekolahMasterModel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


use function PHPSTORM_META\map;

class PplAlocationController extends Controller
{
    public function getDataAlocation()
    {
        try {
            $data = [];

            // Ambil data awal
            $sekolah = Sekolah::all();
            $prodi = Prodi::select('kode', 'name', 'id')
                ->orderBy('id', 'asc')
                ->get();

            $latestGelombang = Gelombang::orderBy('id', 'desc')->first();

            if (!$latestGelombang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gelombang tidak ditemukan.'
                ], 404);
            }

            // Definisi kolom awal
            $columns = collect([
                ['key' => 'no', 'label' => 'No', 'editable' => false],
                ['key' => 'nama_sekolah', 'label' => 'Nama Sekolah', 'editable' => false],
            ]);

            // Kolom berdasarkan Prodi
            $prodiColumns = $prodi->map(function ($p) {
                return [
                    'key' => $p->kode,
                    'label' => $p->kode,
                    'editable' => true,
                    'type' => 'number',
                ];
            });

            // Tambahan kolom jumlah
            $jlh = collect([
                ['key' => 'jlh', 'label' => 'JLH', 'width' => 60, 'editable' => false, 'type' => 'number']
            ]);

            // Gabungkan semua kolom
            $allColumns = $columns->merge($prodiColumns)->merge($jlh)->values();

            // Ambil data Lowongan PPL
            $lowonganPPl = LowonganPPL::select(
                'sm.name as nama_sekolah',
                'lowongan_ppl_tbl.id as id_lowongan',
                'lowongan_ppl_tbl.quota',
                'lowongan_ppl_tbl.id_prodi',
                'sm.id as id_sekolah',
                'lowongan_ppl_tbl.name'
            )
                ->leftJoin('kelas_ppl as s', 'lowongan_ppl_tbl.id_sekolah', '=', 's.id')
                ->join('sekolah_master as sm', 's.id_sekolah', '=', 'sm.id')
                ->where('s.id_gelombang', '=', $latestGelombang->id)
                ->orderBy('lowongan_ppl_tbl.id_prodi', 'asc')
                ->get();

            // Mapping data sekolah + quota prodi
            $sekolah = $sekolah->map(function ($item, $index) use ($prodi, $lowonganPPl) {
                $row = [];
                $row['no'] = ['value' => $index + 1];
                $row['nama_sekolah'] = ['value' => $item->name, 'id' => $item->id];

                $total = 0;

                foreach ($prodi as $p) {
                    $match = $lowonganPPl->first(function ($l) use ($item, $p) {
                        return $l->id_sekolah == $item->id && $l->id_prodi == $p->id;
                    });

                    $quota = $match ? $match->quota : '';
                    $row[$p->kode] = [
                        'value' => $quota,
                        'id' => $match ? $match->id_lowongan : null
                    ];

                    if (is_numeric($quota)) {
                        $total += $quota;
                    }
                }

                $row['jlh'] = ['value' => $total];

                return $row;
            });

            // Tambahkan info prodi (setting lebar & type)
            $prodi = $prodi->map(function ($item) {
                $extra = ['width' => 60, "editable" => true, "type" => "number"];
                return array_merge($item->toArray(), $extra);
            });

            // Susun final response
            $data['coloumns'] = $allColumns;
            $data['sekolah'] = $sekolah;

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Throwable $e) {
      

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data alokasi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function bulkGenerateLowongan()
    {
        $prodiList = Prodi::all();
        $sekolahList = SekolahMasterModel::all();
        $latestGelombang = Gelombang::latest('id')->first();

        DB::beginTransaction();

        try {
            // 1. Prepare batch data for kelas_ppl
            $kelasData = [];
            $timestamp = now();

            foreach ($sekolahList as $sekolah) {
                $kelasData[] = [
                    'id_sekolah' => $sekolah->id,
                    'id_gelombang' => $latestGelombang->id,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }

            // 2. Batch insert kelas_ppl
            KelasPPLModel::insert($kelasData);

            // 3. Get inserted kelas records (in same order)
            $kelasList = KelasPPLModel::latest('id')
                ->take(count($sekolahList))
                ->get()
                ->reverse()
                ->values(); // To match original order

            // 4. Prepare batch data for lowongan_ppl
            $lowonganData = [];

            foreach ($kelasList as $index => $kelas) {
                $sekolah = $sekolahList[$index];

                foreach ($prodiList as $prodi) {
                    $lowonganData[] = [
                        'name' => 'PPL ' . $prodi->name . ' ' . $sekolah->name,
                        'description' => '-',
                        'quota' => 0,
                        'id_sekolah' => $kelas->id, // this points to kelas
                        'id_prodi' => $prodi->id,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }
            }

            // 5. Batch insert lowongan_ppl
            LowonganPPL::insert($lowonganData);

            DB::commit();

            return response()->json([
                'message' => 'Lowongan berhasil dibuat secara batch'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function bulkDeleteLowongan()
    {
        DB::beginTransaction();

        try {
            $latestGelombang = Gelombang::latest('id')->first();

            if (!$latestGelombang) {
                return response()->json([
                    'message' => 'Tidak ada gelombang yang ditemukan.'
                ], 404);
            }

            $kelasToDelete = KelasPPLModel::where('id_gelombang', $latestGelombang->id)->get();

            if ($kelasToDelete->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada kelas yang ditemukan untuk gelombang tersebut.'
                ], 200);
            }

            $kelasIds = $kelasToDelete->pluck('id')->toArray();

            LowonganPPL::whereIn('id_sekolah', $kelasIds)->delete();
            KelasPPLModel::whereIn('id', $kelasIds)->delete();

            DB::commit();

            return response()->json([
                'message' => "Kelas dan lowongan dengan id_gelombang = {$latestGelombang->id} berhasil dihapus."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkSave(Request $request)
    {
        $data = $request->data;

        // Collect IDs and case statements
        $updateData = [];

        foreach ($data as $sekolah) {
            foreach ($sekolah as $key => $item) {
                if (in_array($key, ['no', 'nama_sekolah', 'jlh'])) {
                    continue;
                }

                if (isset($item['id']) && isset($item['value'])) {
                    $updateData[$item['id']] = $item['value'];
                }
            }
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'No valid data to update.'], 400);
        }

        DB::beginTransaction();

        try {
            // Build raw SQL
            $cases = '';
            $ids = [];

            foreach ($updateData as $id => $value) {
                $id = (int)$id;
                $value = (int)$value;

                $cases .= "WHEN id = {$id} THEN {$value} ";
                $ids[] = $id;
            }

            $idsList = implode(',', $ids);

            $sql = "
            UPDATE lowongan_ppl_tbl
            SET quota = CASE {$cases} END
            WHERE id IN ({$idsList})
        ";

            DB::statement($sql);

            DB::commit();

            return response()->json(['message' => 'LowonganPPL updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
