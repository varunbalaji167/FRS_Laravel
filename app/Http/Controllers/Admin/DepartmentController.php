<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Store a new department (Admin only)
     */
    public function storeDepartment(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:departments,name|max:255',
        ]);

        Department::create($request->only('name'));

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
