<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** Statuses past the draft stage: the dossier is locked and exportable. */
    private const LOCKED_STATUSES = ['submitted', 'shortlisted', 'rejected'];

    public function index(): Response
    {
        $advertisements = Advertisement::where('is_active', true)->latest()->get();
        $submittedAdvtIds = [];
        $draftAdvtIds = [];

        if (Auth::check()) {
            $applications = JobApplication::where('user_id', Auth::id())
                ->get(['advertisement_id', 'status']);

            foreach ($applications as $app) {
                // submitted/shortlisted/rejected are all "locked".
                if (in_array($app->status, self::LOCKED_STATUSES, true)) {
                    $submittedAdvtIds[] = $app->advertisement_id;
                } elseif ($app->status === 'draft') {
                    $draftAdvtIds[] = $app->advertisement_id;
                }
            }
        }

        return Inertia::render('Dashboard', [
            'advertisements' => $advertisements,
            'submittedAdvtIds' => $submittedAdvtIds,
            'draftAdvtIds' => $draftAdvtIds,
        ]);
    }

    public function myApplications(): Response
    {
        $applications = JobApplication::with('advertisement')
            ->where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'advertisement' => $app->advertisement,
                    'department' => $app->department,
                    'grade' => $app->grade,
                    'status' => $app->status,
                    'current_step' => $app->form_data['current_step'] ?? 1,
                    'updated_at' => $app->updated_at->format('M d, Y - h:i A'),
                    'has_pdf' => in_array($app->status, self::LOCKED_STATUSES, true),
                    'pdf_url' => in_array($app->status, self::LOCKED_STATUSES, true)
                        ? route('applicant.applications.export.pdf', $app->id)
                        : null,
                ];
            });

        return Inertia::render('Applicant/MyApplications', [
            'applications' => $applications,
        ]);
    }

    public function show(int|string $id): Response
    {
        $application = JobApplication::with('advertisement')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('Applicant/ApplicationShow', [
            'application' => $application,
        ]);
    }
}
