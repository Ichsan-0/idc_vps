<?php

namespace App\Http\Middleware;

use App\Models\Data;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PendaftaranKPM
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $data = Data::all()->first();
        if ($data->buka_lamaran_kpm === 0) {
            return redirect('/profil')->with('message', ['error' => 'Lamaran Belum Dibuka']);
        }
        return $next($request);
    }
}
