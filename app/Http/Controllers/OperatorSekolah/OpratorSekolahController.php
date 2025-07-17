<?php

namespace App\Http\Controllers\OperatorSekolah;

use App\Http\Controllers\Controller;
use App\Http\Middleware\User;
use App\Models\AdminSekolah;
use App\Models\AmprahamPPL;
use App\Models\User as ModelsUser;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpParser\Node\Stmt\Catch_;
use PHPUnit\Framework\MockObject\ReturnValueNotConfiguredException;

class OpratorSekolahController extends Controller
{
    public function index()
    {
        return Inertia::render('OperatorSekolah/Dashboard');
    }

    public function kepsek_pamong()
    {
        $data_opt = AdminSekolah::where('email', Auth::user()->email)->first();

        return Inertia::render('OperatorSekolah/PamongKepsek', [
            'base_url' => url('/'),
            'data_opt' => $data_opt
        ]);
    }

    public function kepsek_pamong_detail($id)
    {
        $data = AmprahamPPL::join('sekolah_tbl as s_tbl', 'ampraham_ppl_tbl.id_sekolah', '=', 's_tbl.id')
            ->select('s_tbl.name as nama_sekolah', 'ampraham_ppl_tbl.*')
            ->where('ampraham_ppl_tbl.id', $id)
            ->first();
        return Inertia::render('OperatorSekolah/DetailKepsekPamong', ['data' => $data, 'base_url' => url('/')]);
    }


    public function kepsek_pamong_add()
    {
        $data_opt = AdminSekolah::where('email', Auth::user()->email)->first();
        return Inertia::render('OperatorSekolah/AddKepsekPamong', [
            'base_url' => url('/'),
            'data_opt' => $data_opt
        ]);
    }
    public function query(Request $request)
    {
        $query = AmprahamPPL::where('id_sekolah', $request->id_sekolah)
            ->join('sekolah_tbl as s_tbl', 'ampraham_ppl_tbl.id_sekolah', '=', 's_tbl.id')
            ->leftjoin('users as us', 'ampraham_ppl_tbl.username_mahasiswa', '=', 'us.username');

        if ($request->has('search_key') && !empty($request->search_key)) {
            $query->where(function ($subQuery) use ($request) {
                $subQuery->where('ampraham_ppl_tbl.name', 'like', '%' . $request->search_key . '%')
                    ->orWhere('s_tbl.name', 'like', '%' . $request->search_key . '%');
                // ->orWhere('booking_tbl.student_nim', 'like', '%' . $request->search_key . '%');
            });
        }
        $query->selectRaw(
            'ROW_NUMBER() OVER (ORDER BY ampraham_ppl_tbl.id) AS row_index,
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

    public function edit() {}
}
