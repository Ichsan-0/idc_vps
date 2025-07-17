<?php

namespace App\Http\Controllers\OperatorKecamatan;

use App\Http\Controllers\Controller;
use App\Models\AdminKecamatan;
use App\Models\AmprahamKPM;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OperatorKecamatanController extends Controller
{
    // public function index()
    // {
    //     return Inertia::render('OperatorSekolah/Dashboard');
    // }
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
                $subQuery->where('ampraham_kpm_tbl.name', 'like', '%' . $request->search_key . '%');
                // ->orWhere('s_tbl.name', 'like', '%' . $request->search_key . '%');
                // ->orWhere('booking_tbl.student_nim', 'like', '%' . $request->search_key . '%');
            });
        }
        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY ampraham_kpm_tbl.id) AS row_index,
               ampraham_kpm_tbl.*'
        );

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
