<?php

use App\Http\Controllers\SuperAdmin\GelombangController;
use App\Http\Controllers\SuperAdmin\ImportDataController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'super_admin'])->prefix('superadmin')->group(function () {
    Route::prefix('/data')->group(function () {
        Route::get('setting', [GelombangController::class, 'list']);
        Route::get('import', [ImportDataController::class, 'index']);

    });
});
