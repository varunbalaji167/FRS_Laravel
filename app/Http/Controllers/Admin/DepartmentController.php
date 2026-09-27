<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\StoreDepartmentRequest;
use App\Models\Department;
use App\Services\Auditing\AdminActionRecorder;
use App\Services\Reporting\DashboardAggregator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function storeDepartment(StoreDepartmentRequest $request, AdminActionRecorder $adminActions, DashboardAggregator $dashboard): RedirectResponse
    {
        $department = Department::create($request->validated());

        $adminActions->record($request, 'department.created', $department, null, $department->only(['id', 'name']));

        Department::flushCache();
        $dashboard->forget(null);

        return back()->with('success', 'Department added successfully.');
    }

    public function destroyDepartment(Request $request, Department $department, AdminActionRecorder $adminActions, DashboardAggregator $dashboard): RedirectResponse
    {
        $before = $department->only(['id', 'name']);

        $department->delete();

        $adminActions->record($request, 'department.deleted', $department, $before, null);

        Department::flushCache();
        $dashboard->forget($before['name']);

        return back()->with('success', 'Department deleted successfully.');
    }
}
