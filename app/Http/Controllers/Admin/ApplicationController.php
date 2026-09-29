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
use App\Services\Auditing\AdminActionRecorder;
use App\Services\Reporting\DashboardAggregator;
use App\Support\ErrorCode;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationController extends Controller
{
    public function __construct(private readonly DossierExporter $exporter)
    {
        //
    }

    /**
     * Admins see everything, HODs only their own department. Scopes by
     * department_id.
     */
    /**
     * @return Builder<JobApplication>
     */
    private function getScopedQuery(Request $request): Builder
    {
        $query = JobApplication::with(['user', 'advertisement', 'department:id,name'])
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected']);

        if ($request->user()->role === 'hod') {
            $query->where('department_id', $request->user()->department_id);
        }

        return $query;
    }

    /**
     * Drafts stay hidden as 404; an out-of-department HOD gets a scope
     * violation instead.
     */
    private function findVisibleOrFail(Request $request, int|string $id): JobApplication
    {
        $application = JobApplication::with(['user', 'advertisement', 'department:id,name'])
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->findOrFail($id);

        $user = $request->user();
        $outOfScope = $application->department_id !== $user->department_id;

        if ($user->role === 'hod' && $outOfScope) {
            throw new DomainException(ErrorCode::HOD_DEPT_SCOPE_VIOLATION);
        }

        return $application;
    }

    public function index(Request $request): Response
    {
        $query = $this->getScopedQuery($request);

        if ($request->filled('advertisement_id')) {
            $query->where('advertisement_id', $request->advertisement_id);
        }

        // Redundant for an HOD (already scoped), a real filter for an admin.
        // The query parameter stays a name so filtered URLs remain bookmarkable.
        if ($request->filled('department')) {
            $department = Department::firstWhere('name', $request->department);

            abort_if($department === null, 404);

            $query->where('department_id', $department->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // withQueryString() bakes the active filters into next_page_url so the
        // frontend never rebuilds it on each scroll fetch.
        $applications = $query->latest()->paginate(5)->withQueryString();

        $viewFolder = $this->adminOrHodViewFolder($request->user());

        return Inertia::render("{$viewFolder}/Applications/Index", [
            'applications' => $applications,

            // Closures, so a scroll fetch sending only:['applications'] never
            // runs these queries. Full page loads request them as normal.
            // deadline is selected because Advertisement::isActive() (appended
            // to every serialised advertisement) reads it.
            'advertisements' => fn () => Advertisement::select('id', 'title', 'reference_number', 'deadline')->get(),
            'departments' => fn () => Department::allCached(),
            'filters' => fn () => $request->only(['advertisement_id', 'department', 'status']),
        ]);
    }

    public function show(Request $request, int|string $id): Response
    {
        $application = $this->findVisibleOrFail($request, $id);

        $viewFolder = $this->adminOrHodViewFolder($request->user());

        return Inertia::render("{$viewFolder}/Applications/Show", [
            'application' => $application,
        ]);
    }

    public function updateStatus(UpdateStatusRequest $request, int|string $id, AdminActionRecorder $adminActions, DashboardAggregator $dashboard): RedirectResponse
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

        $adminActions->record($request, 'application.status_updated', $application, ['status' => $from], ['status' => $request->status]);

        $dashboard->forget($application->department_id);

        return back()->with('success', "Application status updated to {$request->status}.");
    }

    public function exportPdf(Request $request, int|string $id): SymfonyResponse
    {
        $application = $this->findVisibleOrFail($request, $id);

        return $this->exporter->exportPdf($application);
    }

    public function exportExcel(Request $request, int|string $id): StreamedResponse
    {
        $application = $this->findVisibleOrFail($request, $id);

        return $this->exporter->exportExcel($application);
    }
}
