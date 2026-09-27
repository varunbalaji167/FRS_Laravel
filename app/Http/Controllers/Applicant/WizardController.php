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
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WizardController extends Controller
{
    public function __construct(
        private readonly DraftService $drafts,
        private readonly SubmissionService $submissions,
    ) {
        //
    }

    /**
     * Show the application form wizard.
     */
    public function showApplyForm(Advertisement $advertisement)
    {
        $application = JobApplication::where('user_id', Auth::id())
            ->where('advertisement_id', $advertisement->id)
            ->first();

        if ($application && $application->status === 'submitted') {
            return redirect()->route('dashboard')
                ->with('error', 'Application already submitted for this position.');
        }

        return Inertia::render('Applicant/ApplyForm', [
            'advertisement' => $advertisement,
            'existingDraft' => $application ? $application->form_data : null,
            'existingDepartment' => $application ? $application->department : '',
            'existingGrade' => $application ? $application->grade : '',
        ]);
    }

    // SAVE AS DRAFT — lax validation (types/sizes only); see SaveDraftRequest.

    public function saveDraft(SaveDraftRequest $request, Advertisement $advertisement)
    {
        $this->drafts->save($request, $advertisement);

        return redirect()->back();
    }

    // STEP TIER — strict validation for the single step the wizard is
    // transitioning away from. Called from the wizard's Next button.
    // Validation itself happens in ValidateStepRequest; reaching this method
    // body means it already passed.

    public function validateStep(ValidateStepRequest $request, Advertisement $advertisement): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    // FINAL SUBMIT — strict validation across every step; see
    // SubmitApplicationRequest. Reaching this method body means every field
    // and required document already passed validation.

    public function submitApplication(SubmitApplicationRequest $request, Advertisement $advertisement)
    {
        $this->submissions->submit($request, $advertisement);

        return redirect()->route('dashboard')
            ->with('success', 'Application Submitted! A confirmation copy has been sent to your email.');
    }
}
