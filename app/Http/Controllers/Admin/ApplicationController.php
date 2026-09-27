<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\DomainException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Applications\UpdateStatusRequest;
use App\Models\Advertisement;
use App\Models\ApplicationStatusEvent;
use App\Models\Department;
use App\Models\JobApplication;
use App\Services\Applications\DossierExporter;
use App\Support\ErrorCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    public function __construct(private readonly DossierExporter $exporter)
    {
        //
    }

    /**
     * Enforce departmental security boundaries.
     * Admins see all applications. HODs only see applications for their assigned department.
     */
    private function getScopedQuery(Request $request)
    {
        $query = JobApplication::with(['user', 'advertisement'])
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected']);

        if ($request->user()->role === 'hod') {
            $query->where('department', $request->user()->department);
        }

        return $query;
    }

    /**
     * Fetch a single application by id, still hiding drafts as 404 (an HOD
     * or admin has no legitimate reason to look one up — see
     * Feature\Security\HodCannotSeeDraftsTest), but distinguishing an HOD
     * reaching outside their own department as a scope violation rather
     * than folding it into the same "not found" as a missing/draft row.
     */
    private function findVisibleOrFail(Request $request, $id): JobApplication
    {
        $application = JobApplication::with(['user', 'advertisement'])
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->findOrFail($id);

        if ($request->user()->role === 'hod' && $application->department !== $request->user()->department) {
            throw new DomainException(ErrorCode::HOD_DEPT_SCOPE_VIOLATION);
        }

        return $application;
    }

    public function index(Request $request)
    {
        // 1. Secure the base query
        $query = $this->getScopedQuery($request);

        if ($request->filled('advertisement_id')) {
            $query->where('advertisement_id', $request->advertisement_id);
        }

        // If user is HOD, this filter is somewhat redundant but safe. If Admin, it filters dynamically.
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // paginate() + withQueryString() bakes active filter params into next_page_url
        // so the frontend never has to manually reconstruct the URL on each scroll fetch.
        $applications = $query->latest()->paginate(5)->withQueryString();

        // CHANGE 1: Removed the stale $advertisements variable that sat on the
        // original line 51. It fetched from DB and was immediately thrown away
        // because the identical query was repeated inside the return block.

        $viewFolder = $request->user()->role === 'admin' ? 'Admin' : 'Hod';

        return Inertia::render("{$viewFolder}/Applications/Index", [
            // Always a plain value — evaluated and sent on every request.
            // On scroll the frontend sends only:['applications'], so Inertia
            // returns only this key in the JSON, keeping the payload tiny.
            'applications' => $applications,

            // CHANGE 2: Converted to closures (fn() =>).
            //
            // Inertia behaviour for closures vs plain values:
            //   Plain value  → PHP evaluates it immediately on every request,
            //                  regardless of whether the frontend asked for it.
            //   Closure      → Inertia calls it ONLY when the frontend explicitly
            //                  requests that prop. On a scroll request that sends
            //                  only:['applications'], these three closures are
            //                  never called — zero DB queries for ads/depts/filters.
            //
            // On the initial full page load all props are requested, so all three
            // closures run and their data reaches the frontend as normal.
            'advertisements' => fn () => Advertisement::select('id', 'title', 'reference_number')->get(),
            'departments' => fn () => Department::orderBy('name')->get(),
            'filters' => fn () => $request->only(['advertisement_id', 'department', 'status']),
        ]);
    }

    public function show(Request $request, $id)
    {
        $application = $this->findVisibleOrFail($request, $id);

        // Dynamically choose view folder
        $viewFolder = $request->user()->role === 'admin' ? 'Admin' : 'Hod';

        return Inertia::render("{$viewFolder}/Applications/Show", [
            'application' => $application,
        ]);
    }

    public function updateStatus(UpdateStatusRequest $request, $id)
    {
        $application = $this->findVisibleOrFail($request, $id);
        $from = $application->status;

        DB::transaction(function () use ($application, $request, $from) {
            $application->update(['status' => $request->status]);

            ApplicationStatusEvent::create([
                'application_id' => $application->id,
                'actor_id' => $request->user()->id,
                'from' => $from,
                'to' => $request->status,
                'at' => now(),
            ]);
        });

        return back()->with('success', "Application status updated to {$request->status}.");
    }

    /**
     * Generate and stream the PDF on the fly via DossierExporter, shared
     * with Applicant\ExportController.
     */
    public function exportPdf(Request $request, $id)
    {
        $application = $this->findVisibleOrFail($request, $id);

        return $this->exporter->exportPdf($application);
    }

    /**
     * Export the dossier CSV via DossierExporter, shared with
     * Applicant\ExportController.
     */
    public function exportExcel(Request $request, $id)
    {
        $application = $this->findVisibleOrFail($request, $id);

        return $this->exporter->exportExcel($application);
    }
}
