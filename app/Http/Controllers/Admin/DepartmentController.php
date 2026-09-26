<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\StoreDepartmentRequest;
use App\Models\Department;

class DepartmentController extends Controller
{
    /**
     * Store a new department (Admin only)
     */
    public function storeDepartment(StoreDepartmentRequest $request)
    {
        Department::create($request->validated());

        return back()->with('success', 'Department added successfully.');
    }

    /**
     * Delete a department (Admin only)
     */
    public function destroyDepartment(Department $department)
    {
        $department->delete();

        return back()->with('success', 'Department deleted successfully.');
    }
}
