<?php

use App\Http\Middleware\Admin;
use App\Http\Middleware\AdminAPIMiddleware;
use App\Http\Middleware\LengkapiProfil;
use App\Http\Middleware\OptKecamatan;
use App\Http\Middleware\OptSekolah;
use App\Http\Middleware\PendaftaranKPM;
use App\Http\Middleware\PendaftaranPPL;
use App\Http\Middleware\Profil;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SuperAdmin;
use App\Http\Middleware\SuperAdminApi;
use App\Http\Middleware\Supervisor;
use App\Http\Middleware\SupervisorKPM;
use App\Http\Middleware\User;
use App\Http\Middleware\UserApi;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => Admin::class,
            'supervisor' => Supervisor::class,
            'user' => User::class,
            'profil' => Profil::class,
            'opt-kecamatan' => OptKecamatan::class,
            'opt-sekolah' => OptSekolah::class,
            'supervisor-kpm' => SupervisorKPM::class,
            'open_kpm' => PendaftaranKPM::class,
            'open_ppl' => PendaftaranPPL::class,
            'save_profil' => LengkapiProfil::class,
            'super_admin' => SuperAdmin::class,
            'super_admin_api' => SuperAdminApi::class,
            'admin_api' => AdminAPIMiddleware::class,
            'user_api' => UserApi::class,
            'role' => RoleMiddleware::class




        ]);
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class, // ✅ Add this
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
