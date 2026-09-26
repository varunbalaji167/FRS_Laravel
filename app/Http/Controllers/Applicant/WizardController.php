<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Applicant\SaveDraftRequest;
use App\Http\Requests\Applicant\SubmitApplicationRequest;
use App\Http\Requests\Applicant\ValidateStepRequest;
use App\Mail\ApplicationSubmitted;
use App\Mail\RefereeNotification;
use App\Models\Advertisement;
use App\Models\JobApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WizardController extends Controller
{
    // Keep in sync with Rules/StepDocumentsRules.php — anything outside this
    // whitelist bypasses validation entirely (no rule key matches it) and,
    // pre-Phase-2, was stored to disk under a fully user-controlled key.
    private const ALLOWED_DOCUMENT_KEYS = [
        'phd_cert', 'ssc_cert', 'pg_cert', 'ug_cert', 'hsc_cert',
        'payslip', 'noc', 'post_phd_exp', 'other_docs', 'signature',
    ];

    private const ALLOWED_BEST_PAPER_KEYS = [
        'best_paper_1', 'best_paper_2', 'best_paper_3', 'best_paper_4', 'best_paper_5',
    ];

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
        $validated = $request->validated();
        $formData = $validated['form_data'] ?? [];

        if ($request->hasFile('form_data.personal_details.profile_image')) {
            $path = $request->file('form_data.personal_details.profile_image')
                ->store('applications/'.Auth::id()."/{$advertisement->id}/photos", 'local');
            $formData['personal_details']['profile_image'] = $path;
        }

        $data = collect($request->only(['department', 'grade']))
            ->map(fn ($value) => $value ?? '')
            ->all();

        DB::transaction(function () use ($advertisement, $data, $formData) {
            $existing = JobApplication::where('user_id', Auth::id())
                ->where('advertisement_id', $advertisement->id)
                ->lockForUpdate()
                ->first();

            // TODO(Phase 3): replace with throw new DomainException(ErrorCode::APP_DRAFT_CONFLICT)
            abort_if($existing && $existing->status !== 'draft', 409, 'draft conflict');

            JobApplication::updateOrCreate(
                ['user_id' => Auth::id(), 'advertisement_id' => $advertisement->id],
                array_merge($data, [
                    'form_data' => $formData,
                    'status' => 'draft',
                ])
            );
        });

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
        $validated = $request->validated();
        $user = Auth::user();
        $formData = $validated['form_data'];

        $documentPaths = $formData['uploaded_documents'] ?? [];

        foreach (array_keys($request->file('documents', [])) as $key) {
            if (! in_array($key, self::ALLOWED_DOCUMENT_KEYS, true)) {
                // TODO(Phase 3): replace with throw new DomainException(ErrorCode::FILE_KEY_NOT_ALLOWED)
                abort(422, "Unrecognised document upload key: {$key}");
            }
        }

        foreach (array_keys($request->file('best_papers', [])) as $key) {
            if (! in_array($key, self::ALLOWED_BEST_PAPER_KEYS, true)) {
                // TODO(Phase 3): replace with throw new DomainException(ErrorCode::FILE_KEY_NOT_ALLOWED)
                abort(422, "Unrecognised document upload key: {$key}");
            }
        }

        // ── Profile image
        if ($request->hasFile('form_data.personal_details.profile_image')) {
            $path = $request->file('form_data.personal_details.profile_image')
                ->store("applications/{$user->id}/{$advertisement->id}/photos", 'local');
            $formData['personal_details']['profile_image'] = $path;
        }

        // ── Supporting documents & signature
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $key => $file) {
                $documentPaths[$key] = $file->store(
                    "applications/{$user->id}/{$advertisement->id}", 'local'
                );
            }
        }

        // ── Best papers
        if ($request->hasFile('best_papers')) {
            foreach ($request->file('best_papers') as $key => $file) {
                $documentPaths[$key] = $file->store(
                    "applications/{$user->id}/{$advertisement->id}/best_papers", 'local'
                );
            }
        }

        $formData['uploaded_documents'] = $documentPaths;

        // ── Persist — locked so a duplicate submit can't race the status transition
        $application = null;
        $isNewSubmission = false;

        DB::transaction(function () use ($user, $advertisement, $validated, $formData, &$application, &$isNewSubmission) {
            $existing = JobApplication::where('user_id', $user->id)
                ->where('advertisement_id', $advertisement->id)
                ->lockForUpdate()
                ->first();

            $isNewSubmission = in_array($existing?->status, [null, 'draft'], true);

            $application = JobApplication::updateOrCreate(
                ['user_id' => $user->id, 'advertisement_id' => $advertisement->id],
                [
                    'department' => $validated['department'],
                    'grade' => $validated['grade'],
                    'form_data' => $formData,
                    'status' => 'submitted',
                ]
            );
        });

        // Only the null|draft → submitted transition generates the PDF and
        // fires mail — a duplicate submit on an already-submitted row must
        // not re-queue the applicant/referee emails.
        if ($isNewSubmission) {
            $pdf = Pdf::loadView('pdf.application_format', [
                'application' => $application,
                'user' => $user,
                'advertisement' => $advertisement,
                'data' => $formData,
            ]);

            $pdfPath = "applications/{$user->id}/{$advertisement->id}/Final_Application_Form.pdf";
            Storage::disk('local')->put($pdfPath, $pdf->output());

            Mail::to($user->email)->queue(new ApplicationSubmitted($application, $pdfPath));

            $referees = $formData['referees_section']['referees'] ?? [];
            $applicantName = trim(
                ($formData['personal_details']['first_name'] ?? '').' '.
                ($formData['personal_details']['last_name'] ?? '')
            );

            foreach ($referees as $referee) {
                if (! empty($referee['email']) && filter_var($referee['email'], FILTER_VALIDATE_EMAIL)) {
                    Mail::to($referee['email'])->queue(
                        new RefereeNotification($application, $applicantName, $referee)
                    );
                }
            }
        }

        return redirect()->route('dashboard')
            ->with('success', 'Application Submitted! A confirmation copy has been sent to your email.');
    }
}
