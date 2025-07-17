<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Admin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'admin') {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return match ($user?->role) {
            'user' => redirect('/'),
            'opt-kecamatan' => redirect('/operator-kecamatan/data/camat-keuchik'),
            'opt-sekolah' => redirect('/operator-sekolah/data/kepsek-pamong'),
            'supervisor_kpm' => redirect('/supervisor/classroom/home'),
            default => redirect('/supervisor/dashboard'),
        };
    }
}

