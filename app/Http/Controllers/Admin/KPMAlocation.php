<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesaMaster;
use App\Models\Gelombang;
use App\Models\TempatKPM;
use Error;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class KPMAlocation extends Controller
{

    public function index()
    {
        return Inertia::render('Admin/pages/KPM/ALokasiKPM/AlokasiKPM');
    }

    public function createLowongan(Request $request)
    {

        try {
            $data = [
                'name' => $request->name,
                'quota_lk' => $request->quota_lk,
                'quota_pr' => $request->quota_pr,
                'qouta' => $request->qouta,
                'username_supervisor' => $request->username_supervisor,
                'id_desa' => $request->id_desa,
                'id_gelombang' => $request->id_gelombang,
                'description' => $request->description
            ];

            $tempatKPM = TempatKPM::create($data);

            return response()->json([
                'message' => 'Berhasil menambahkan tempat KPM baru',
                'code' => 201,
                'data' => $tempatKPM
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'Internal Server Error',
                'code' => $e->getCode(),
            ]);
        }



        return response()->json($request);
    }

    public function updateLowongan(Request $request){
        try {
            $validatedData = $request->validate([
                'quota_lk' => 'required',
                'quota_pr' => 'required',
                'qouta' => 'required',
                'username_supervisor' => 'required',
                'id_desa' => 'required',
                'id_gelombang' => 'required',
                'id_tempat_kpm' => 'required'
            ]);

            $data = [
                'quota_lk' => $validatedData['quota_lk'],
                'quota_pr' => $validatedData['quota_pr'],
                'qouta' => $validatedData['qouta'],
                'username_supervisor' => $validatedData['username_supervisor'],
                'id_desa' => $validatedData['id_desa'],
                'id_gelombang' => $validatedData['id_gelombang'],
                

            ];
            $tempatKPM = TempatKPM::find($validatedData['id_tempat_kpm']);

            $dt = $tempatKPM->update($data);

            return response()->json([
                'message' => 'Successfully updated data',
                'data' => $dt
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage(),
            ], 500);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getDataAlocation(Request $request)
    {
        $data = [];
        $latestGelombang = Gelombang::latest()->first();
        $columns = collect([
            ['key' => 'no', 'label' => 'No', 'editable' => false],
            ['key' => 'nama_tempat_kpm', 'label' => 'Tempat KPM', 'editable' => false],
            ['key' => 'qouta', 'label' => 'Total Slot', 'editable' => true, 'type' => 'number'],
            ['key' => 'quota_lk', 'label' => 'Slot Laki Laki', 'editable' => true, 'type' => 'number'],
            ['key' => 'quota_pr', 'label' => 'Slot Perempuan', 'editable' => true, 'type' => 'number'],
            ['key' => 'jlh', 'label' => 'JLH', 'width' => 60, 'editable' => false, 'type' => 'number']

        ]);


        try {

            $tempatKpm = TempatKPM::join('master_desa_tbl as md', 'tempat_kpm_tbl.id_desa', '=', 'md.id')
                ->select(
                    'tempat_kpm_tbl.id as id_tempat_kpm',
                    'md.name as nama_tempat_kpm',
                    'tempat_kpm_tbl.qouta',
                    'tempat_kpm_tbl.quota_lk',
                    'tempat_kpm_tbl.quota_pr'
                )
                ->where('tempat_kpm_tbl.id_gelombang', $latestGelombang->id)
                ->get();

            $tempatKpm = $tempatKpm->map(function ($item, $index) {
                $arr = $item->toArray();
                $data = [];
                $data['no'] = ['value' => $index + 1];
                foreach ($arr as $key => $value) {
                    $data[$key] = ['value' => $value];
                }
                $data['jlh'] = ['value' => ($item->quota_lk ?? 0) + ($item->quota_pr ?? 0)];
                return $data;
            });



            $data['columns'] = $columns;
            $data['desa'] = $tempatKpm;


            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => "Internal Sever Error",
                "error" => $e->getMessage()
            ], $e->getCode() || 500);
        }
    }

    public function saveBulk(Request $request)
    {
        $data = $request->data;

        // Collect IDs and build update data
        $updateData = [];

        foreach ($data as $desa) {
            $dt = [];
            foreach ($desa as $key => $item) {
                if (in_array($key, ['no', 'nama_tempat_kpm', 'jlh', 'id_tempat_kpm'])) {
                    continue;
                }
                $dt[$key] = $item['value'];
            }
            $updateData[$desa['id_tempat_kpm']['value']] = $dt;
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'No valid data to update.'], 400);
        }

        $ids = array_keys($updateData);

        DB::beginTransaction();

        try {
            // Build CASE WHEN statements
            $qoutaCase   = "CASE id";
            $quotaLkCase = "CASE id";
            $quotaPrCase = "CASE id";

            foreach ($updateData as $id => $values) {
                $id = (int) $id;

                $qouta = $values['qouta']   !== null ? (int)$values['qouta']   : "NULL";
                $quotaLk = $values['quota_lk'] !== null ? (int)$values['quota_lk'] : "NULL";
                $quotaPr = $values['quota_pr'] !== null ? (int)$values['quota_pr'] : "NULL";

                $qoutaCase   .= " WHEN {$id} THEN {$qouta}";
                $quotaLkCase .= " WHEN {$id} THEN {$quotaLk}";
                $quotaPrCase .= " WHEN {$id} THEN {$quotaPr}";
            }

            $qoutaCase   .= " ELSE qouta END";
            $quotaLkCase .= " ELSE quota_lk END";
            $quotaPrCase .= " ELSE quota_pr END";

            $sql = "
            UPDATE tempat_kpm_tbl
            SET 
                qouta = {$qoutaCase},
                quota_lk = {$quotaLkCase},
                quota_pr = {$quotaPrCase}
            WHERE id IN (" . implode(',', $ids) . ")
        ";

            DB::statement($sql);

            DB::commit();

            return response()->json(['message' => 'KPM Vacancies updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkGenerateLowongan(Request $request)
    {

        $latestGelombang = Gelombang::latest('id')->first();
        $desaList = DesaMaster::all();
        $tempatKPMData = [];

        DB::beginTransaction();

        try {
            foreach ($desaList as $desa) {
                $tempatKPMData[] = [
                    'id_gelombang' => $latestGelombang->id,
                    'qouta' => 0,
                    'id_desa' => $desa->id
                ];
            }
            $dt = TempatKPM::insert($tempatKPMData);
            DB::commit();



            return response()->json([
                'message' => 'Lowongan berhasil dibuat secara batch',
                'data' => $dt
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

            $tempatKpmToDelete = TempatKPM::where('id_gelombang', $latestGelombang->id)->get();

            if ($tempatKpmToDelete->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada kelas yang ditemukan untuk gelombang tersebut.'
                ], 200);
            }

            $tempatKpmId = $tempatKpmToDelete->pluck('id')->toArray();

            TempatKPM::whereIn('id', $tempatKpmId)->delete();

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

    public function deleteLowongan($id)
    {
        DB::beginTransaction();

        try {
            if ($id === null) throw new Error('Bad Request', 400);
            $lowongan = TempatKPM::where('id', $id)->first();
            if (!$lowongan) throw new Error('Data lowongan tidak ditemukan');
            $lowongan->delete();
            DB::commit();

            return response()->json([
                'message' => "Kelas dan lowongan dengan id_gelombang = {$id} berhasil dihapus.",
                'data' => $lowongan
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], $e->getCode() || 500);
        }
    }
}
