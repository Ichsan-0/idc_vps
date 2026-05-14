<?php

namespace App\Http\Middleware;

use App\Models\LamaranKPM;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'data_kelas' => fn() => $request->user() && $request->user()->role === 'user'
                    ? LamaranKPM::where('username_mahasiswa', $request->user()->username)
                    ->where('lamaran_kpm_tbl.status', 'accepted')
                    ->select('lamaran_kpm_tbl.id_tempat_kpm')
                    ->first()
                    : null,
            ],
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'status' => fn() => $request->session()->get('status'),
            ],
        ];
    }
}
