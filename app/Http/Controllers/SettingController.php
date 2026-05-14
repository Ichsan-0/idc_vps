<?php

namespace App\Http\Controllers;

use App\Models\Data;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Writer\Ods\Settings;

class SettingController extends Controller
{
    public function index()
    {
        $data = Data::all()->first();
        return Inertia::render('Admin/pages/Data/setting/Setting', ['settings' => $data]);
    }

    public function update(Request $request)
    {
        $settings = Data::all()->first();
        $data = [
            'buka_pendaftaran' => $request->buka_pendaftaran,
            'buka_lengkapi_profil' => $request->buka_lengkapi_profil,
            'buka_lamaran_ppl' => $request->buka_lamaran_ppl,
            'buka_lamaran_kpm' => $request->buka_lamaran_kpm,
            'link_grup' => $request->link_grup,
        ];

        // dd($data);

        $settings->update($data);

        return redirect()->back();
    }
}
