<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Applicant\SaveDraftRequest;
use App\Http\Requests\Applicant\SubmitApplicationRequest;
use App\Http\Requests\Applicant\ValidateStepRequest;
use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Services\Applications\DraftService;
use App\Services\Applications\SubmissionService;
use App\Support\ErrorCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WizardController extends Controller
{
    public function __construct(
        private readonly DraftService $drafts,
        private readonly SubmissionService $submissions,
    ) {
        //
    }

    public function showApplyForm(Advertisement $advertisement): Response|RedirectResponse
    {
        $application = JobApplication::where('user_id', Auth::id())
            ->where('advertisement_id', $advertisement->id)
            ->first();

        if ($application && $application->status === 'submitted') {
            return redirect()->route('dashboard')
                ->with('error', ErrorCode::APP_ALREADY_SUBMITTED->userMessage());
        }

        return Inertia::render('Applicant/ApplyForm', [
            'advertisement' => $advertisement,
            'existingDraft' => $application ? $application->form_data : null,
            'existingDepartment' => $application ? $application->department_name : '',
            'existingGrade' => $application ? $application->grade : '',
            // No longer on the global Inertia share (see HandleInertiaRequests) —
            // fetched explicitly to pre-fill a fresh wizard from the master profile.
            'applicantProfile' => Auth::user()->applicantProfile,
        ]);
    }

    // Draft tier — lax validation; see SaveDraftRequest.
    public function saveDraft(SaveDraftRequest $request, Advertisement $advertisement): RedirectResponse
    {
        $this->drafts->save($request, $advertisement);

        return redirect()->back();
    }

    // Step tier — reaching this body means ValidateStepRequest already passed.
    public function validateStep(ValidateStepRequest $request, Advertisement $advertisement): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    // Submit tier — every step and document validated by SubmitApplicationRequest.
    public function submitApplication(SubmitApplicationRequest $request, Advertisement $advertisement): RedirectResponse
    {
        $this->submissions->submit($request, $advertisement);

        return redirect()->route('dashboard')
            ->with('success', 'Application Submitted! A confirmation copy has been sent to your email.');
    }
}
