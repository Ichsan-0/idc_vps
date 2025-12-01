<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\SekolahMaster;
use Error;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use PHPUnit\Framework\MockObject\ReturnValueNotConfiguredException;
use Psr\Http\Message\ResponseInterface;

class SekolahController extends Controller
{
    public function listSekolah(Request $request)
    {

        return Inertia::render('Admin/pages/Data/MasterSekolah/MasterSekolah');
    }

    public function getAllDataWithoutPagination(){
        try{
            $sekolah = SekolahMaster::select('name', 'id')->get();

            return response()->json([
                'message' =>'successfully get All data',
                'data' => $sekolah
            ]);

        }catch(Exception $e){
            return response()->json([

                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSekolahData(Request $request)
    {

        $search = $request->query('search');
        $sortBy = $request->query('sortBy', 'created_at');
        $sortOrder = $request->query('sortOrder', 'desc');
        $perPage = $request->query('perPage', 10);

        try {
            $data = SekolahMaster::query();
            if ($search) {
                $data->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%");
                    // ->orWhere('tahun', 'like', "%$search%");
                });
            }

            if (in_array($sortBy, ['name']) && in_array($sortOrder, ['ASC', 'DESC'])) {
                $data->orderBy($sortBy, $sortOrder);
            }

            $data = $data->paginate($request->perPage);
            return response()->json([
                'message' => 'Sucessfully get all data',
                'data' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function createSekolah(Request $request)
    {
        $data = [
            'name' => $request->name,
            'regency' => $request->regency,
            'sub_district' => $request->sub_district,
            'village' => $request->village
        ];
        try {
            $sekolah = SekolahMaster::create($data);
            return response()->json([
                'message' => 'Berhasil membuat sekolah baru',
                'data' => $sekolah
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Internal Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteSekolah(Request $request, $id)
    {
        try {
            $sekolah = SekolahMaster::find($id);
            $sekolah->delete();

            return response()->json([
                'message' => 'Berhasil menghapus sekolah'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Internal Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function viewSekolah($id)
    {
        return Inertia::render("Admin/pages/Data/MasterSekolah/ViewSekolah", ['id' => $id]);
    }

    public function  getData($id)
    {
        try {

            $data = SekolahMaster::find($id);

            if (!$data) throw new Error('Data tidak ditemukan', 404);

            return response()->json([
                'data' => $data,
                'message' => 'Berhasil mengambil data'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'Internal Server Error'
            ], $e->getCode() || 500);
        }
    }

    public function updateData(Request $request, $id)
    {
        try {

            $data = SekolahMaster::find($id);
            $validator = Validator::make($request->all(), [
                'name' => 'required',
                'regency' => 'required',
                'sub_district' => 'required',
                'village' => 'required'
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            if (!$data) return throw new Error('Data tidak ditemukan', 404);

            $data->update($request->only(['name', 'regency', 'sub_district', 'village']));

            return response()->json([
                'message' => 'Data berhasil diperbarui',
                'data' => $data
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'Internal Server Error'
            ], $e->getCode() || 500);
        }
    }
}
