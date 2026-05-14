<?php

namespace App\Http\Controllers;

use App\Models\LamaranKPM;
use Exception;
use Illuminate\Http\Request;

class MahasiswaKPM extends Controller
{
    public function getMahasiswa(Request $request)
    {
        $search = $request->query('search_key');
        $sortBy = $request->query('sort_key', 'created_at');
        $sortOrder = $request->query('sort_dir', 'desc');
        $perPage = $request->query('entries_per_page', 10);
        $idTempatKPM = $request->id_tempat_kpm;

        try {
            $query = LamaranKPM::query();
            $query->select(
                'lamaran_kpm_tbl.id as id',
                'usr.name as name',
                'usr.username as nim',
                'ptbl.name as prodi',
                'mtbl.jk as jenis_kelamin'
            )
                ->join('users as usr', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'usr.username')
                ->join('mahasiswa_tbl as mtbl', 'lamaran_kpm_tbl.username_mahasiswa', '=', 'mtbl.nim')
                ->join('prodi_tbl as ptbl', 'mtbl.id_prodi', 'ptbl.id');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('usr.username', 'like', "$search")
                        ->orWhere('usr.name', 'like', "$search");
                });
            }
            $sortColumns = [
                'name' => 'usr.name',
                'jenis_kelamin' => 'mtbl.jk',
                'prodi' => 'ptbl.name',
                'nim' => 'usr.username'
            ];
            if (in_array($sortBy, ['name', 'jenis_kelamin', 'prodi', 'nim']) && in_array($sortOrder, ['ASC', 'DESC'])) {
                $query->orderBy($sortColumns[$sortBy], $sortOrder);
            }
            $query->where('lamaran_kpm_tbl.id_tempat_kpm', '=', $idTempatKPM);
            $data = $query->paginate($perPage);

            return response()->json([
                'message' => 'Berhasil mengambil data',
                'data' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
