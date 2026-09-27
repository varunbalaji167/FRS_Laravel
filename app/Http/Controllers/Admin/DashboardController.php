<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Services\Reporting\DashboardAggregator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Aggregate counts for the Admin and HOD dashboards. See
     * DashboardAggregator for the query + caching (Phase 8).
     */
    public function dashboard(Request $request, DashboardAggregator $dashboard)
    {
        $user = $request->user();
        $viewFolder = $this->adminOrHodViewFolder($user);

        return Inertia::render("{$viewFolder}/Dashboard", $dashboard->forUser($user));
    }

    /**
     * Display Settings page for Admin/HOD
     */
    public function settings(Request $request)
    {
        $user = $request->user();
        $viewFolder = $this->adminOrHodViewFolder($user);

        return Inertia::render("{$viewFolder}/Settings", [
            'departments' => Department::allCached(),
            'status' => session('status'),
            'mustVerifyEmail' => false,
        ]);
    }
}
