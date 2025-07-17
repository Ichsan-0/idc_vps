<?php

namespace App\Http\Middleware;

use App\Models\Mahasiswa;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Profil
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $data_user = Mahasiswa::where('nim', Auth::user()->username)->first();

        if ($data_user->status === null) {
            return redirect('/profil')->with('message', ['error' => 'Lengkapi Biodata Terlebih Dahulu']);
        } else if ($data_user->status === 'submitted') {
            return redirect('/profil')->with('message', ['error' => 'Profilmu sedang di-review, silakan ditunggu']);
        } else if ($data_user->status === 'revisi') {
            return redirect('/profil')->with('message', ['error' => 'Bidatamu ditolak, silakan diperbaiki']);
        } else if ($data_user->status === 'rejected') {
            return redirect('/profil')->with('message', ['error' => 'Bidatamu ditolak, silakan daftar di gelombang selanjutnya']);
        } else {
            return $next($request);
        }
    }
}
