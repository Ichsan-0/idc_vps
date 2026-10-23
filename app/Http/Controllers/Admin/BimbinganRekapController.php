<?php

namespace App\Http\Controllers\Admin;

use App\Exports\BimbinganRekapExport;
use App\Http\Controllers\Controller;
use App\Models\Gelombang;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class BimbinganRekapController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/pages/ClassroomKPM/Bimbingan/Rekap', [
            'base_url' => url('/'),
            'gelombang_list' => Gelombang::orderByDesc('id')->get([
                'id',
                'name',
                'tahun',
            ]),
        ]);
    }

    public function query(Request $request)
    {
        $search = trim((string) $request->query('search_key', ''));
        $tipe = $request->query('tipe');
        $status = $request->query('status');
        $idGelombang = $request->query('id_gelombang');

        $statsRows = $this->buildBaseQuery($search, $tipe, $idGelombang)
            ->select('bimbingan_tbl.status', DB::raw('COUNT(*) as total'))
            ->groupBy('bimbingan_tbl.status')
            ->pluck('total', 'status');

        $stats = [
            'total' => (int) $statsRows->sum(),
            'approved' => (int) ($statsRows['approved'] ?? 0),
            'pending' => (int) ($statsRows['pending'] ?? 0),
            'rejected' => (int) ($statsRows['rejected'] ?? 0),
        ];

        $paginator = $this->selectColumns($this->buildBaseQuery($search, $tipe, $idGelombang))
            ->when(
                in_array($status, ['approved', 'pending', 'rejected'], true),
                fn ($builder) => $builder->where('bimbingan_tbl.status', $status)
            )
            ->orderByDesc('bimbingan_tbl.tanggal')
            ->orderByDesc('bimbingan_tbl.id')
            ->paginate(10);

        $paginator->getCollection()->transform(function ($item) {
            $item->nama_kelas = $item->tipe === 'kpm'
                ? $item->nama_tempat_kpm
                : $item->nama_sekolah;
            $item->bimbingan_ke = (int) $item->bimbingan_ke;

            unset($item->nama_tempat_kpm, $item->nama_sekolah);

            return $item;
        });

        return response()->json([
            'data' => $paginator,
            'stats' => $stats,
        ]);
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->input('search_key', ''));
        $tipe = $request->input('tipe');
        $status = $request->input('status');
        $idGelombang = $request->input('id_gelombang');

        $query = $this->selectColumns($this->buildBaseQuery($search, $tipe, $idGelombang))
            ->when(
                in_array($status, ['approved', 'pending', 'rejected'], true),
                fn ($builder) => $builder->where('bimbingan_tbl.status', $status)
            )
            ->orderByDesc('bimbingan_tbl.tanggal')
            ->orderByDesc('bimbingan_tbl.id');

        $gelombangLabel = !empty($idGelombang)
            ? Gelombang::where('id', $idGelombang)->value('name')
            : null;

        $filename = 'rekap_bimbingan_'
            . ($gelombangLabel
                ? preg_replace('/[^A-Za-z0-9]+/', '_', $gelombangLabel) . '_'
                : '')
            . now()->format('Ymd_His')
            . '.xlsx';

        return Excel::download(new BimbinganRekapExport($query), $filename);
    }

    private function buildBaseQuery(string $search, ?string $tipe, $idGelombang = null)
    {
        $query = DB::table('bimbingan_tbl')
            ->leftJoin('users as mhs', 'bimbingan_tbl.username_mahasiswa', '=', 'mhs.username')
            ->leftJoin('users as sup', 'bimbingan_tbl.username_supervisor', '=', 'sup.username')
            ->leftJoin('tempat_kpm_tbl as tkpm', function ($join) {
                $join->on('bimbingan_tbl.id_kelas', '=', 'tkpm.id')
                    ->where('bimbingan_tbl.tipe', '=', 'kpm');
            })
            ->leftJoin('sekolah_tbl as sp', function ($join) {
                $join->on('bimbingan_tbl.id_kelas', '=', 'sp.id')
                    ->where('bimbingan_tbl.tipe', '=', 'ppl');
            });

        if (in_array($tipe, ['kpm', 'ppl'], true)) {
            $query->where('bimbingan_tbl.tipe', $tipe);
        }

        if (!empty($idGelombang)) {
            $query->where(function ($subQuery) use ($idGelombang) {
                $subQuery->where('tkpm.id_gelombang', $idGelombang)
                    ->orWhere('sp.id_gelombang', $idGelombang);
            });
        }

        if ($search !== '') {
            $like = '%' . $search . '%';

            $query->where(function ($subQuery) use ($like) {
                $subQuery->where('mhs.name', 'like', $like)
                    ->orWhere('bimbingan_tbl.username_mahasiswa', 'like', $like)
                    ->orWhere('bimbingan_tbl.judul', 'like', $like)
                    ->orWhere('bimbingan_tbl.deskripsi', 'like', $like)
                    ->orWhere('sup.name', 'like', $like);
            });
        }

        return $query;
    }

    private function selectColumns(Builder $query)
    {
        return $query->selectRaw(
            'bimbingan_tbl.id,
            bimbingan_tbl.tipe,
            bimbingan_tbl.id_kelas,
            bimbingan_tbl.username_mahasiswa,
            bimbingan_tbl.username_supervisor,
            bimbingan_tbl.bimbingan_ke,
            bimbingan_tbl.tanggal,
            bimbingan_tbl.judul,
            bimbingan_tbl.deskripsi,
            bimbingan_tbl.status,
            bimbingan_tbl.catatan_supervisor,
            bimbingan_tbl.validated_at,
            mhs.name as nama_mahasiswa,
            sup.name as nama_supervisor,
            tkpm.name as nama_tempat_kpm,
            sp.name as nama_sekolah,
            COALESCE(tkpm.id_gelombang, sp.id_gelombang) as id_gelombang,
            (
                SELECT g.name
                FROM gelombang_tbl g
                WHERE g.id = COALESCE(tkpm.id_gelombang, sp.id_gelombang)
                LIMIT 1
            ) as nama_gelombang'
        );
    }
}
