<?php

namespace App\Services\Referees;

use App\Models\JobApplication;

/**
 * Dedup + queue referee notification mail via the referee_notifications
 * table. Empty stub — filled in Phase 4. Behaviour still lives inline in
 * Applicant\WizardController::submitApplication until then.
 */
class RefereeNotificationDispatcher
{
    public function __construct()
    {
        //
    }

    public function dispatch(JobApplication $application, array $referees, string $applicantName): void
    {
        throw new \LogicException('Not implemented — filled in Phase 4.');
    }
}
