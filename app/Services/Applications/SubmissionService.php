<?php

namespace App\Services\Applications;

use App\Models\Advertisement;
use App\Models\JobApplication;
use Illuminate\Http\Request;

/**
 * Transaction, lock, state transition, and idempotent mail dispatch for the
 * final submit. Filled in Phase 4 — behaviour still lives in
 * Applicant\WizardController::submitApplication until then.
 */
class SubmissionService
{
    public function __construct()
    {
        //
    }

    public function submit(Request $request, Advertisement $advertisement): JobApplication
    {
        throw new \LogicException('Not implemented — filled in Phase 4.');
    }
}
