<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Gelombang;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GelombangController extends Controller
{
    public function list()
    {

        
        return Inertia::render('SuperAdmin/settings/Setting', ['DATA'=>'HALOOWOEIROAUWIER']);
    }

    public function create(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'tahun' => 'required|integer|min:2000|max:2100',
                'active' => 'required',
            ]);

            $data = Gelombang::create($validatedData);

            return response()->json([
                'message' => 'Data berhasil dibuat.',
                'data' => $data,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function all(Request $request)
    {
        $search = $request->query('search');
        $sortBy = $request->query('sortBy', 'created_at');
        $sortOrder = $request->query('sortOrder', 'desc');
        $perPage = $request->query('perPage', 10);

        try {
            $query = Gelombang::query();
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%")
                        ->orWhere('tahun', 'like', "%$search%");
                });
            }

            if (in_array($sortBy, ['name', 'tahun', 'active']) && in_array($sortOrder, ['ASC', 'DESC'])) {
                $query->orderBy($sortBy, $sortOrder);
            }

            $data = $query->paginate($perPage);


            return response()->json([
                'message' => 'Data berhasil dibuat.',
                'data' => $data,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        $gelombang = Gelombang::find($id);

        if (!$gelombang) {
            return response()->json([
                'message' => "Gelombang dengan id {$id} tidak ditemukan"
            ], 404);
        }

        $gelombang->delete();

        return response()->json([
            'message' => 'Data gelombang berhasil dihapus',
            'id' => $id
        ], 200);
    }

    public function getGelombangData(){
        try{
            $data = Gelombang::select('id', 'name', 'tahun')->get();

            return response()->json([
                'data' => $data,
                'message' => 'Successfully get all data',
            ]);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], $e->getCode() || 500);
        }
    }
}
