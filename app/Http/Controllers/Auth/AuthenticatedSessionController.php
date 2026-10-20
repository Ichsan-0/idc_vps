<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // $token = $request->user()->createToken('auth_token')->plainTextToken;
        // session(['access_token' => $token]);

        if ($request->user()->role != 'user') {
            if ($request->user()->role === 'admin') {
                return redirect('admin/dashboard');
            } else if ($request->user()->role === 'opt-sekolah') {
                return redirect('/operator-sekolah/dashboard');
            } else if ($request->user()->role === 'opt-kecamatan') {
                return redirect('/operator-kecamatan/dashboard');
            } else if ($request->user()->role === 'supervisor_kpm') {
                return redirect('/supervisor/classroom/home');
            } else if ($request->user()->role === 'super_admin'){
                return redirect('/superadmin/data/setting');
            }else if($request->user()-> role === 'supervisor') {
                return redirect('supervisor/dashboard');
            }
        }


        return redirect()->intended(route('profil'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // $request->user()->currentAccessToken()->delete();
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
