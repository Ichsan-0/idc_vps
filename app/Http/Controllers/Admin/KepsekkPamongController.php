<?php

namespace App\Http\Controllers\Admin;

use App\Exports\KepsekPamongExport;
use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use App\Models\AmprahamPPL;
use App\Models\LamaranPPL;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class KepsekkPamongController extends Controller
{

    public function update_status(Request $request, $id)
    {
        $data = [];
        DB::beginTransaction();
        try {

            $record = AmprahamPPL::find($id);
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

    public function mahasiswa(Request $request)
    {
        $data = [];
        try {
            $data_mahasiswa = LamaranPPL::join('lowongan_ppl_tbl as l_ppl', 'lamaran_ppl_tbl.id_lowongan_ppl', 'l_ppl.id')
                ->join('users as us', 'lamaran_ppl_tbl.username_mahasiswa', '=', 'us.username')
                ->where('status', 'accepted')
                ->where('l_ppl.id_sekolah', $request->id_sekolah)
                ->select(
                    'us.name',
                    'us.username'
                )
                ->get();
                
            $data['status'] = 'error';
            $data['data'] = $data_mahasiswa;
            return response()->json($data);
        } catch (Exception $err) {
            $data['status'] = 'error';
            $data['message'] = $err->getMessage();
            return response()->json($data);
        }
    }

    public function detail($id)
    {
        $data = AmprahamPPL::join('sekolah_tbl as s_tbl', 'ampraham_ppl_tbl.id_sekolah', '=', 's_tbl.id')
            ->select('s_tbl.name as nama_sekolah', 'ampraham_ppl_tbl.*')
            ->where('ampraham_ppl_tbl.id', $id)
            ->first();
        return Inertia::render('Admin/pages/Data/KepsekPamong/Detail', ['data' => $data, 'base_url' => url('/')]);
    }

    public function edit (Request $request){
        $data = AmprahamPPL::find($request->id);
       
        return Inertia::render('Admin/pages/Data/KepsekPamong/EditKepsekPamong', [
            'data' => $data
        ]);

    }
    public function export()
    {
        return Excel::download(new KepsekPamongExport, 'data_kepsek_pamong.xlsx');
    }
    public function list()
    {
        return Inertia::render('Admin/pages/Data/KepsekPamong/List', ['base_url' => url('/')]);
    }
    public function query(Request $request)
    {
        $query = AmprahamPPL::join('sekolah_tbl as s_tbl', 'ampraham_ppl_tbl.id_sekolah', '=', 's_tbl.id')
            ->leftjoin('users as us', 'ampraham_ppl_tbl.username_mahasiswa', '=', 'us.username');

        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('ampraham_ppl_tbl.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('s_tbl.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('us.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('us.username', 'like', '%' . $request->search_key . '%');
                // ->orWhere('booking_tbl.student_nim', 'like', '%' . $request->search_key . '%');
            });
        }
        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY ampraham_ppl_tbl.status ASC, ampraham_ppl_tbl.id ASC) AS row_index,
               ampraham_ppl_tbl.*, 
                s_tbl.name as nama_sekolah,
                us.name as nama_mahasiswa,
                us.username as nim'
        );

        $data = $query->paginate(10);

        return response()->json($data);
    }
    public function delete($id)
    {

        DB::beginTransaction();
        try {
            $ampraham = AmprahamPPL::find($id);

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

    public function downloadCertificate(Request $request) {
        $data = [];
        $pdf = Pdf::loadView('certificate', $data);
        return $pdf->download('certificate_PPKPM.pdf');


    }

    public function update(Request $request){

        try{
            $data = [
                'id' => $request->id,
                'no_rekening' => $request->no_rekening,
                'no_npwp' => $request->no_npwp,
                'name' => $request->name,
                'nip' => $request->nip,
                'nama_bank' =>$request->nama_bank,
                'nama_di_buku_rekening' =>$request->nama_di_buku_rekening,
                'pangkat_dan_golongan' => $request->pangkat_dan_golongan,
                'username_mahasiswa' => $request->username_mahasiswa,
                'id_sekolah' => $request->id_sekolah,
                'jabatan'=> $request->jabatan
            ];
    
            $ampraham = AmprahamPPL::find($request->id);
            if($ampraham == null){
                throw new Exception('Data tidak ditemukan',404);
            }

            $ampraham->update($data);
    
            return response()->json(['success'=> true, 'message'=>'Data Berhasil disimpan']);

        }catch(Exception $e){
            return response()->json([
                'success'=> false,
                'message' => $e->getMessage(),
            ], $e->getCode());

        }
        
    }



}


