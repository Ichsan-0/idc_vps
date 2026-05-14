<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OptSekolah
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()->role != 'opt-sekolah') {
            if ($request->user()->role === 'user') {
                return redirect('/');
            } else if ($request->user()->role === 'admin') {
                return redirect('/admin/dashboard');
            } else if ($request->user()->role === 'opt-kecamatan') {
                return redirect('/operator-kecamatan/data/camat-keuchik');
            } else if ($request->user()->role = 'supervisor_kpm') {
                return redirect('/supervisor/classroom/home');
            } else {
                return redirect('supervisor/dashboard');
            }
        }
        return $next($request);
    }
}
