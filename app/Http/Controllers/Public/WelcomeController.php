<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'advertisements' => Cache::remember('welcome.active_ads.v3', 60, fn () => Advertisement::where('deadline', '>=', now()->toDateString())
                ->latest()
                ->take(5)
                ->get(['id', 'reference_number', 'title', 'deadline', 'departments', 'document_path'])),
        ]);
    }
}
