<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    public function index(Request $request){
        return Inertia::render('SuperAdmin/settings/Setting');
    }

    public function getSetting(Request $request){
        return response()->json(request()->user());
    }
}
