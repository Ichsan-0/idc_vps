<?php

namespace App\Http\Controllers;

use App\Models\LamaranKPM;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LamaranKPMController extends Controller
{
    public function update(Request $request)
    {
        try {
            try {
                $validatedData = $request->validate([
                    'username_mahasiswa' => 'required',
                    'id_desa' => 'required',
                    'status' => 'required',
                    'keterangan' => 'nullable',
                    'id_lamaran' => 'required',
                ]);
                $lamaran = LamaranKPM::find($validatedData['id_lamaran']);
                $data = [
                    'username_mahasiswa' => $validatedData['username_mahasiswa'],
                    'id_tempat_kpm' => $validatedData['id_desa'],
                    'status' => $validatedData['status'],
                    'keterangan' => $validatedData['keterangan'] ?? null,
                ];
                $dt = $lamaran->update($data);

                return response()->json([
                    'message' => 'Successfully added new lamaran',
                    'data' => $dt
                ], 201);
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
        } catch (Exception $e) {
        }
    }


    public function create(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'username_mahasiswa' => 'required',
                'id_desa' => 'required',
                'status' => 'required',
                'keterangan' => 'nullable',
            ]);

            $data = [
                'username_mahasiswa' => $validatedData['username_mahasiswa'],
                'id_tempat_kpm' => $validatedData['id_desa'],
                'status' => $validatedData['status'],
                'keterangan' => $validatedData['keterangan'] ?? null,
            ];
            $dt = LamaranKPM::create($data);

            return response()->json([
                'message' => 'Successfully added new lamaran',
                'data' => $dt
            ], 201);
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

    public function getById(Request $request)
    {
        $idLamaran = $request->x;

        $data = LamaranKPM::select(
            'lamaran_kpm_tbl.id',
            'lamaran_kpm_tbl.username_mahasiswa',
            'lamaran_kpm_tbl.id_tempat_kpm',
            'lamaran_kpm_tbl.status',
            'lamaran_kpm_tbl.keterangan',
            'usr.name as nama_mahasiswa'

        )->join('users as usr', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'usr.username')
            ->where('lamaran_kpm_tbl.id', $idLamaran)
            ->first();


        return response()->json([
            'data' => $data
        ]);
    }

    public function delete(Request $request)
    {
        try {
            $idLamaran = $request->idLamaran;
            $lamaran = LamaranKPM::find($idLamaran);
            $lamaran->delete();
            return response()->json([
                'message' => "Successfully delete record",
                'data' => $lamaran
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => "Gagal dalam menghapus data",
            ]);
        }
    }
}
