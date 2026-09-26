<?php

namespace App\Services\Applications;

use App\Models\Advertisement;
use App\Models\JobApplication;
use Illuminate\Http\Request;

/**
 * Draft merge + guard against overwriting a non-draft row. Filled in
 * Phase 4 — behaviour still lives in Applicant\WizardController::saveDraft
 * until then.
 */
class DraftService
{
    public function __construct()
    {
        //
    }

    public function save(Request $request, Advertisement $advertisement): JobApplication
    {
        throw new \LogicException('Not implemented — filled in Phase 4.');
    }
}
