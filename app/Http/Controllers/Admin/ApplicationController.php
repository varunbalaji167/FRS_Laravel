<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    // List all submitted applications, with optional filters
    public function index(Request $request)
    {
        $query = JobApplication::with(['user', 'advertisement'])
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected']);

        if ($request->filled('advertisement_id')) {
            $query->where('advertisement_id', $request->advertisement_id);
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->latest()->paginate(20);
        $advertisements = Advertisement::select('id', 'title', 'reference_number')->get();

        return Inertia::render('Admin/Applications/Index', [
            'applications'   => $applications,
            'advertisements' => $advertisements,
            'filters'        => $request->only(['advertisement_id', 'department', 'status']),
        ]);
    }

    // View a single application in detail
    public function show($id)
    {
        $application = JobApplication::with(['user', 'advertisement'])->findOrFail($id);

        return Inertia::render('Admin/Applications/Show', [
            'application' => $application,
        ]);
    }

    // Update application status (shortlist / reject)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:submitted,shortlisted,rejected',
        ]);

        $application = JobApplication::findOrFail($id);
        $application->update(['status' => $request->status]);

        return back()->with('success', 'Application status updated.');
    }
}