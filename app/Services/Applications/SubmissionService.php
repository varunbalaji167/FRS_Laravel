<?php

namespace App\Services\Applications;

use App\Exceptions\DomainException;
use App\Http\Requests\Applicant\SubmitApplicationRequest;
use App\Jobs\GenerateApplicationPdfJob;
use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Services\Referees\RefereeNotificationDispatcher;
use App\Support\ErrorCode;
use Illuminate\Support\Facades\DB;

/**
 * Transaction, lock, state transition, and idempotent mail dispatch for the
 * final submit. See docs/architecture.md.
 */
class SubmissionService
{
    private const ALLOWED_DOCUMENT_KEYS = [
        'phd_cert', 'ssc_cert', 'pg_cert', 'ug_cert', 'hsc_cert',
        'payslip', 'noc', 'post_phd_exp', 'other_docs', 'signature',
    ];

    private const ALLOWED_BEST_PAPER_KEYS = [
        'best_paper_1', 'best_paper_2', 'best_paper_3', 'best_paper_4', 'best_paper_5',
    ];

    public function __construct(
        private readonly RefereeNotificationDispatcher $refereeNotifications,
    ) {
        //
    }

    public function submit(SubmitApplicationRequest $request, Advertisement $advertisement): JobApplication
    {
        $validated = $request->validated();
        $user = $request->user();
        $formData = $validated['form_data'];

        $documentPaths = $formData['uploaded_documents'] ?? [];

        foreach (array_keys($request->file('documents', [])) as $key) {
            if (! in_array($key, self::ALLOWED_DOCUMENT_KEYS, true)) {
                throw new DomainException(ErrorCode::FILE_KEY_NOT_ALLOWED, ['key' => $key]);
            }
        }

        foreach (array_keys($request->file('best_papers', [])) as $key) {
            if (! in_array($key, self::ALLOWED_BEST_PAPER_KEYS, true)) {
                throw new DomainException(ErrorCode::FILE_KEY_NOT_ALLOWED, ['key' => $key]);
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
            GenerateApplicationPdfJob::dispatch($application);

            $referees = $formData['referees_section']['referees'] ?? [];
            $applicantName = trim(
                ($formData['personal_details']['first_name'] ?? '').' '.
                ($formData['personal_details']['last_name'] ?? '')
            );

            $this->refereeNotifications->dispatch($application, $referees, $applicantName);
        }

        return $application;
    }
}
