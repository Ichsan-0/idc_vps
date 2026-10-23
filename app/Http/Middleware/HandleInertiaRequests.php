<?php

namespace App\Http\Middleware;

use App\Models\Data;
use App\Models\LamaranKPM;
use App\Models\LamaranPPL;
use App\Models\Mahasiswa;
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
        $user = $request->user();
        $isMahasiswa = $user && $user->role === 'user';

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'data_kelas' => fn() => $isMahasiswa
                    ? LamaranKPM::where('username_mahasiswa', $user->username)
                    ->where('lamaran_kpm_tbl.status', 'accepted')
                    ->select('lamaran_kpm_tbl.id_tempat_kpm')
                    ->first()
                    : null,
                'has_lokasi' => fn() => $isMahasiswa
                    ? (
                        LamaranKPM::where('username_mahasiswa', $user->username)->where('status', 'accepted')->exists()
                        || LamaranPPL::where('username_mahasiswa', $user->username)->where('status', 'accepted')->exists()
                        || Mahasiswa::where('nim', $user->username)->where(function ($q) {
                            $q->whereNotNull('id_tempat_kpm')->orWhereNotNull('id_lowongan_ppl');
                        })->exists()
                    )
                    : false,
                'has_lokasi_kpm' => fn() => $isMahasiswa
                    ? (
                        LamaranKPM::where('username_mahasiswa', $user->username)->where('status', 'accepted')->exists()
                        || Mahasiswa::where('nim', $user->username)->whereNotNull('id_tempat_kpm')->exists()
                    )
                    : false,
                'has_lokasi_ppl' => fn() => $isMahasiswa
                    ? (
                        LamaranPPL::where('username_mahasiswa', $user->username)->where('status', 'accepted')->exists()
                        || Mahasiswa::where('nim', $user->username)->whereNotNull('id_lowongan_ppl')->exists()
                    )
                    : false,
            ],
            'flash' => [
                'message'       => fn() => $request->session()->get('message'),
                'status'        => fn() => $request->session()->get('status'),
                'micro_warning' => fn() => $request->session()->get('micro_warning'),
            ],
            'maintenance' => function () {
                try {
                    return (bool) (Data::query()->value('maintenance') ?? false);
                } catch (\Throwable $exception) {
                    return false;
                }
            },
        ];
    }
}
