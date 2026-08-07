<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\VerifikasiMahasiswaController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\RegistrasiPPKPMController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;


Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
                ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

 // Verifikasi NIM & Tanggal Lahir via API Sevima
    Route::get('verifikasi-mahasiswa', [VerifikasiMahasiswaController::class, 'create'])
                ->name('verifikasi.mahasiswa');
    Route::post('verifikasi-mahasiswa', [VerifikasiMahasiswaController::class, 'check'])
                ->name('verifikasi.mahasiswa.check');
    Route::post('verifikasi-mahasiswa/pertimbangan', [VerifikasiMahasiswaController::class, 'ajukanPertimbangan'])
                ->name('verifikasi.mahasiswa.pertimbangan');

    Route::get('registrasi-ppkpm', [RegistrasiPPKPMController::class, 'create'])
                ->name('registrasi.ppkpm');
    Route::post('registrasi-ppkpm', [RegistrasiPPKPMController::class, 'store'])
                ->name('registrasi.ppkpm.store');
    Route::get('registrasi-ppkpm/transkrip', [RegistrasiPPKPMController::class, 'getTranskrip'])
                ->name('registrasi.ppkpm.transkrip');

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');

    Route::get('verifikasi', [VerifikasiMahasiswaController::class, 'index'])
        ->name('verifikasi.index');

    Route::post('verifikasi', [VerifikasiMahasiswaController::class, 'store'])
        ->name('verifikasi.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
