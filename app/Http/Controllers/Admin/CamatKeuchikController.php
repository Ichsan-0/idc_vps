<?php

namespace App\Http\Controllers\Admin;

use App\Exports\CamatKeuchikExport;
use App\Http\Controllers\Controller;
use App\Models\AmprahamKPM;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class CamatKeuchikController extends Controller
{
    public function update_status(Request $request, $id)
    {
        $data = [];
        DB::beginTransaction();
        try {

            $record = AmprahamKPM::find($id);
            $dt = [
                'status' => $request->status,
                'keterangan' => $request->keterangan,
            ];
            DB::commit();
            $record->update($dt);
            $data['status'] = 'success';
            $data['message'] = 'Status berhasil diupdate';
            return response()->json($data);
        } catch (Exception $e) {
            DB::rollBack();
            $data['status'] = 'error';
            $data['message'] = $e->getMessage();
            return response()->json($data);
        }
    }
    public function list()
    {
        return Inertia::render('Admin/pages/Data/CamatKeuchik/List', ['base_url' => url('/')]);
    }
    public function query(Request $request)
    {
        $query = AmprahamKPM::query();

        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('ampraham_kpm_tbl.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('ampraham_kpm_tbl.kecamatan', 'like', '%' . $request->search_key . '%')
                    ->orWhere('ampraham_kpm_tbl.desa', 'like', '%' . $request->search_key . '%');
            });
        }
        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY ampraham_kpm_tbl.status ASC, ampraham_kpm_tbl.id ASC) AS row_index,
               ampraham_kpm_tbl.id,
               ampraham_kpm_tbl.name,
               CASE WHEN ampraham_kpm_tbl.nip = "null" then "-" else ampraham_kpm_tbl.nip end as nip,
               CASE WHEN ampraham_kpm_tbl.pangkat_dan_golongan = "null" then "-" else ampraham_kpm_tbl.pangkat_dan_golongan end as pangkat_dan_golongan,
            
              ampraham_kpm_tbl.jabatan,
              nama_bank,
              no_rekening,
              ampraham_kpm_tbl.status,
              ampraham_kpm_tbl.keterangan,
              nama_di_buku_rekening,
              no_npwp,
               CASE 
                    WHEN ampraham_kpm_tbl.jabatan = "Camat" 
                    THEN CONCAT("Kecamatan ", ampraham_kpm_tbl.kecamatan) 
                    ELSE CONCAT("Desa ", ampraham_kpm_tbl.desa) 
                END AS wilayah'
        );

        $data = $query->paginate(10);

        return response()->json($data);
    }

    public function export()
    {

        return Excel::download(new CamatKeuchikExport, 'data_camat_keuchik.xlsx');
    }

    public function detail($id)
    {
        $data = AmprahamKPM::find($id);
        return Inertia::render('Admin/pages/Data/CamatKeuchik/Detail', ['data' => $data, 'base_url' => url('/')]);
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
