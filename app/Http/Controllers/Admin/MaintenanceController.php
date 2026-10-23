<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Data;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function toggle(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->is_superadmin) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin yang dapat mengubah mode maintenance.',
            ], 403);
        }

        $validated = $request->validate([
            'active' => 'required|boolean',
        ]);

        $settings = Data::query()->first();

        if (!$settings) {
            $settings = Data::create([]);
        }

        $settings->maintenance = (bool) $validated['active'];
        $settings->save();

        return response()->json([
            'success' => true,
            'maintenance' => (bool) $settings->maintenance,
            'message' => $settings->maintenance
                ? 'Mode maintenance diaktifkan.'
                : 'Mode maintenance dinonaktifkan.',
        ]);
    }
}
