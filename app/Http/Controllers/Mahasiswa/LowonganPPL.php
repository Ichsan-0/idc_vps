<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\LamaranPPL;
use App\Models\LowonganPPL as ModelsLowonganPPL;
use App\Models\Mahasiswa;
use App\Models\Sekolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use function Laravel\Prompts\select;

class LowonganPPL extends Controller
{
    public function detail(Request $request, $id)
    {
        $lowonganPPL = ModelsLowonganPPL::with(['sekolah.master', 'prodi'])
            ->findOrFail($id);

        // Mencari prodi berdasarkan ID lamaran PPL
        $prodi = DB::table('lamaran_ppl_tbl as lp')
            ->join('lowongan_ppl_tbl as l', 'lp.id_lowongan_ppl', '=', 'l.id')
            ->join('prodi_tbl as p', 'l.id_prodi', '=', 'p.id')
            ->select('p.id', 'p.name')
            ->where('l.id', $id)
            ->first();

        // Query manual untuk statistik
        $stats = DB::table('lamaran_ppl_tbl')
            ->selectRaw('COUNT(*) as total_pelamar')
            ->selectRaw('SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted_pelamar_count')
            ->where('id_lowongan_ppl', $id)
            ->first();

        $genderStats = DB::table('lamaran_ppl_tbl as lp')
            ->join('mahasiswa_tbl as m', 'lp.username_mahasiswa', '=', 'm.nim')
            ->selectRaw('SUM(CASE WHEN m.jk = "L" AND lp.status = "accepted" THEN 1 ELSE 0 END) as jumlah_pria')
            ->selectRaw('SUM(CASE WHEN m.jk = "P" AND lp.status = "accepted" THEN 1 ELSE 0 END) as jumlah_wanita')
            ->where('lp.id_lowongan_ppl', $id)
            ->first();

        // Pelamar yang diterima
        $pelamar = LamaranPPL::with(['data_user.prodi', 'user'])
            ->where('id_lowongan_ppl', $id)
            ->where('status', 'accepted')
            ->get()
            ->map(function ($lamaran) {
                return [
                    'nama_mahasiswa' => $lamaran->user->name ?? $lamaran->data_user->nama ?? 'N/A',
                    'nim' => $lamaran->username_mahasiswa,
                    'nama_prodi' => $lamaran->data_user->prodi->name ?? 'N/A',
                    'jk' => $lamaran->data_user->jk ?? 'N/A',
                ];
            });

        return Inertia::render('Mahasiswa/DetailLowonganPPL', [
            'lowongan_ppl' => [
                'id' => $lowonganPPL->id,
                'prodi' => $prodi,
                'name' => $lowonganPPL->name,
                'description' => $lowonganPPL->description,
                'quota' => $lowonganPPL->quota,
                'sekolah' => $lowonganPPL->sekolah ? [
                    'nama_sekolah' => $lowonganPPL->sekolah->master->name ?? $lowonganPPL->sekolah->name,
                    'regency' => $lowonganPPL->sekolah->master->regency ?? $lowonganPPL->sekolah->regency,
                    'sub_district' => $lowonganPPL->sekolah->master->sub_district ?? $lowonganPPL->sekolah->sub_district,
                    'village' => $lowonganPPL->sekolah->master->village ?? $lowonganPPL->sekolah->village,
                    'address' => $lowonganPPL->sekolah->master->address ?? $lowonganPPL->sekolah->address,
                    'username_supervisor' => $lowonganPPL->sekolah->username_supervisor ?? null,
                ] : null,
                'total_pelamar' => $stats->total_pelamar ?? 0,
                'accepted_pelamar_count' => $stats->accepted_pelamar_count ?? 0,
                'jumlah_pria' => $genderStats->jumlah_pria ?? 0,
                'jumlah_wanita' => $genderStats->jumlah_wanita ?? 0,
            ],

            'pelamar' => $pelamar,
        ]);
    }

    public function all()
    {
        $data_mahasiswa = Mahasiswa::where('nim', Auth::user()->username)->first();
        $tempat_ppl = ModelsLowonganPPL::with(['sekolah', 'prodi'])->where('id_prodi', $data_mahasiswa->id_prodi)->get();


        return Inertia::render('Mahasiswa/PPL', ['tempat_ppl' => $tempat_ppl]);
    }

    public function lamar(Request $request)
    {
        $lowongan = ModelsLowonganPPL::find($request->id);
        // dd($lowongan);

        $eksisting_lamaran = LamaranPPL::where('id', $request->id)->where('username_mahasiswa', Auth::user()->username)->first();
        $lamaran_accepted = LamaranPPL::where('username_mahasiswa', Auth::user()->username)->where('status', 'accepted')->first();
        $totallamaran = LamaranPPL::where('status', 'accepted')
            ->where('id_lowongan_ppl', $request->id)
            ->get();
        $data = [
            'username_mahasiswa' => Auth::user()->username,
            'id_lowongan_ppl' => $request->id,
            'status' => 'accepted',
        ];

        if (count($totallamaran) < $lowongan->quota) {
            if ($eksisting_lamaran) {
                return redirect('/my-proposal')->with('message', ['error' => 'Kamu Sudah Melamar Ke Lowongan ini']);
            } else if ($lamaran_accepted) {
                return redirect('/my-proposal')->with('message', ['error' => 'Kamu sudah diterima di lowongan lain']);
            } else {
                LamaranPPL::create($data);
                return redirect('/my-proposal')->with('message', ['success' => 'Lamaran Berhasil Dikirim']);
            }
        } else {
            return redirect()->back()->with('message', ['error' => 'Sudah Penuh']);
        }
    }
}
