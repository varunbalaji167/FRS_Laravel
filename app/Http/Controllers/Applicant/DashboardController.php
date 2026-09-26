<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Dashboard: Display active advertisements.
     */
    public function index()
    {
        $advertisements = Advertisement::where('is_active', true)->latest()->get();
        $submittedAdvtIds = [];
        $draftAdvtIds = [];

        if (Auth::check()) {
            $applications = JobApplication::where('user_id', Auth::id())
                ->get(['advertisement_id', 'status']);

            foreach ($applications as $app) {
                // Treat submitted, shortlisted, and rejected all as "Locked" applications
                if (in_array($app->status, ['submitted', 'shortlisted', 'rejected'])) {
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

    /**
     * Applicant: View their own application list.
     */
    public function myApplications()
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
                    'has_pdf' => $app->status === 'submitted',
                    'pdf_url' => $app->status === 'submitted'
                        ? route('applicant.applications.export.pdf', $app->id)
                        : null,
                ];
            });

        return Inertia::render('Applicant/MyApplications', [
            'applications' => $applications,
        ]);
    }

    /**
     * Applicant: View their detailed read-only application.
     */
    public function show($id)
    {
        $application = JobApplication::with('advertisement')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('Applicant/ApplicationShow', [
            'application' => $application,
        ]);
    }
}
