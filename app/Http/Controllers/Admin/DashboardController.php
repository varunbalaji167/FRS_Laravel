<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Services\Reporting\DashboardAggregator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * DashboardAggregator owns the query and the caching.
     */
    public function dashboard(Request $request, DashboardAggregator $dashboard): Response
    {
        $user = $request->user();
        $viewFolder = $this->adminOrHodViewFolder($user);

        return Inertia::render("{$viewFolder}/Dashboard", $dashboard->forUser($user));
    }

    public function settings(Request $request): Response
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
