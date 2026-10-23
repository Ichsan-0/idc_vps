<?php

namespace App\Http\Middleware;

use App\Models\Data;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        // Keep static assets available so the maintenance page can render.
        if (
            $request->isMethod('GET') &&
            preg_match(
                '/\.(css|js|mjs|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf)$/i',
                $request->path()
            )
        ) {
            return $next($request);
        }

        // These routes must remain reachable so the super admin can log in
        // and switch the maintenance mode off again.
        if (
            $request->routeIs(
                'maintenance',
                'login',
                'logout',
                'password.*',
                'verification.*'
            )
        ) {
            return $next($request);
        }

        if (
            $request->is(
                'login',
                'logout',
                'forgot-password',
                'reset-password',
                'reset-password/*',
                'verify-email',
                'verify-email/*',
                'email/verification-notification',
                'confirm-password',
                'maintenance'
            )
        ) {
            return $next($request);
        }

        try {
            $maintenance = (bool) (Data::query()->value('maintenance') ?? false);
        } catch (\Throwable $exception) {
            $maintenance = false;
        }

        if (!$maintenance) {
            return $next($request);
        }

        $user = $request->user();

        if ($user && $user->is_superadmin) {
            return $next($request);
        }

        if ($request->header('X-Inertia')) {
            return Inertia::location(route('maintenance'));
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Mohon maaf, web IDC sedang maintenance. Silakan menunggu beberapa saat.',
            ], 503);
        }

        return redirect()->route('maintenance');
    }
}
