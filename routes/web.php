<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\JobOpeningController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Applicant Routes
Route::middleware(['auth', 'role:applicant'])->group(function () {
    Route::get('/dashboard', [JobOpeningController::class, 'index'])->name('dashboard');
    Route::get('/applications', function () {
        return 'My Applications Page (Coming Soon)';
    })->name('applicant.applications');

    // Application Wizard Routes
    Route::get('/apply/{advertisement}', [JobOpeningController::class, 'showApplyForm'])->name('applicant.apply');
    Route::post('/apply/{advertisement}/draft', [JobOpeningController::class, 'saveDraft'])->name('applicant.draft');
    Route::post('/apply/{advertisement}/submit', [JobOpeningController::class, 'submitApplication'])->name('applicant.store');
});

// Shared Admin + HOD Routes
Route::middleware(['auth', 'role:admin,hod'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

    // Applications (both admin and hod can access)
    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/{id}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::patch('/applications/{id}', [ApplicationController::class, 'updateStatus'])->name('applications.update');

    // Admin-only routes (nested)
    Route::middleware('role:admin')->group(function () {
        Route::get('/jobs', [JobOpeningController::class, 'adminIndex'])->name('jobs.index');
        Route::get('/jobs/create', [JobOpeningController::class, 'create'])->name('jobs.create');
        Route::post('/jobs', [JobOpeningController::class, 'store'])->name('jobs.store');
        Route::patch('/users/{user}/role', [AdminController::class, 'updateRole'])->name('users.update-role');
        Route::get('/users', [AdminController::class, 'users'])->name('users.index');
    });
});

require __DIR__.'/auth.php';
