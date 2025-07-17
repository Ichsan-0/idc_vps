<?php

namespace App\Http\Controllers;

use App\Models\LamaranPPL;
use App\Models\LowonganPPL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LamaranPPLController extends Controller
{
    public function index()
    {
    }
    public function store(Request $request, int $id)
    {
        $maksimumlamaran = 2;

        $jumlahlamaran = LamaranPPL::where('nim', Auth::user()->username)->count();

        if ($jumlahlamaran < $maksimumlamaran) {
            try {
                DB::transaction(function () use ($id) {
                    $data = [
                        'nim' => Auth::user()->username,
                        'id_lowongan_ppl' => $id,
                    ];
                    LamaranPPL::create($data);
                    LowonganPPL::where('id', $id)->increment('jumlahpelamar');
                });

                return back()->with('status', 'sukses')->with('message', 'Lamaran berhasil diajukan.');
            } catch (\Exception $e) {
                // Log the error or handle it
                return back()->with('status', 'gagal')->with('message', 'Terjadi kesalahan, coba lagi.');
            }
        }

        return back()->with('status', 'gagal')->with('message', 'Maksimum lamaran telah tercapai.');
    }
}
