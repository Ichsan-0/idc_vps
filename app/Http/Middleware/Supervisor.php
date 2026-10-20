<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Supervisor
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();


        if ($user && $user->role === 'supervisor') {
            return $next($request);
        }


        return match ($user?->role) {
            'user' => redirect('/'),
            'opt-kecamatan' => redirect('/operator-kecamatan/dashboard'),
            'opt-sekolah' => redirect('/operator-sekolah/dashboard'),
            'super_admin' => redirect('/admin/data/setting'),
            'supervisor_kpm' => redirect('/supervisor/classroom/home'),
            "admin" => redirect('/admin/dashboard'),
        };

        return $next($request);
    }
}
