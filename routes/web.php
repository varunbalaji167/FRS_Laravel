<?php

use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Applicant\DashboardController as ApplicantDashboardController;
use App\Http\Controllers\Applicant\ExportController;
use App\Http\Controllers\Applicant\WizardController;
use App\Http\Controllers\FileAccessController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'show']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/files/{path}', [FileAccessController::class, 'show'])
        ->where('path', '.*')
        ->name('files.show');
});

// Applicant Routes
Route::middleware(['auth', 'role:applicant'])->group(function () {
    Route::get('/dashboard', [ApplicantDashboardController::class, 'index'])->name('dashboard');

    // --- NEW APPLICANT DASHBOARD ROUTES ---
    Route::get('/applications', [ApplicantDashboardController::class, 'myApplications'])->name('applicant.applications');
    Route::get('/applications/{id}', [ApplicantDashboardController::class, 'show'])->name('applicant.applications.show');
    Route::get('/applications/{id}/export/pdf', [ExportController::class, 'exportPdf'])->name('applicant.applications.export.pdf');
    Route::get('/applications/{id}/export/excel', [ExportController::class, 'exportExcel'])->name('applicant.applications.export.excel');

    // Application Wizard Routes
    Route::get('/apply/{advertisement}', [WizardController::class, 'showApplyForm'])->name('applicant.apply');
    Route::post('/apply/{advertisement}/draft', [WizardController::class, 'saveDraft'])->name('applicant.draft');
    Route::post('/apply/{advertisement}/submit', [WizardController::class, 'submitApplication'])->name('applicant.store');
});

// --- ADMIN ONLY ROUTES ---
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'dashboard'])->name('dashboard');

    // Settings
    Route::get('/settings', [AdminDashboardController::class, 'settings'])->name('settings');
    Route::post('/departments', [DepartmentController::class, 'storeDepartment'])->name('departments.store');
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroyDepartment'])->name('departments.destroy');

    // Applications
    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/{id}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::patch('/applications/{id}', [ApplicationController::class, 'updateStatus'])->name('applications.update');
    Route::get('/applications/{id}/export/pdf', [ApplicationController::class, 'exportPdf'])->name('applications.export.pdf');
    Route::get('/applications/{id}/export/excel', [ApplicationController::class, 'exportExcel'])->name('applications.export.excel');

    // Jobs
    Route::get('/jobs', [AdvertisementController::class, 'index'])->name('jobs.index');
    Route::get('/jobs/create', [AdvertisementController::class, 'create'])->name('jobs.create');
    Route::post('/jobs', [AdvertisementController::class, 'store'])->name('jobs.store');

    // Users Management
    Route::get('/users', [UserController::class, 'users'])->name('users.index');
    Route::post('/users', [UserController::class, 'storeUser'])->name('users.store');
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
    Route::delete('/users/{user}', [UserController::class, 'destroyUser'])->name('users.destroy');
});

// --- HOD ONLY ROUTES ---
Route::middleware(['auth', 'role:hod'])->prefix('hod')->name('hod.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'dashboard'])->name('dashboard');

    // Settings
    Route::get('/settings', [AdminDashboardController::class, 'settings'])->name('settings');
    // Applications (HODs only see their scoped data)
    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/{id}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::patch('/applications/{id}', [ApplicationController::class, 'updateStatus'])->name('applications.update');
    Route::get('/applications/{id}/export/pdf', [ApplicationController::class, 'exportPdf'])->name('applications.export.pdf');
    Route::get('/applications/{id}/export/excel', [ApplicationController::class, 'exportExcel'])->name('applications.export.excel');
});

require __DIR__.'/auth.php';
