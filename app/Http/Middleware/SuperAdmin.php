<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'super_admin') {
            return $next($request);
        }


        return match ($user?->role) {
            'user' => redirect('/'),
            'opt-kecamatan' => redirect('/operator-kecamatan/data/camat-keuchik'),
            'opt-sekolah' => redirect('/operator-sekolah/data/kepsek-pamong'),
            'supervisor_kpm' => redirect('/supervisor/classroom/home'),
            'admin' => redirect('/admin/dashboard'),
            default => redirect('/supervisor/dashboard'),
        };
    }
}

