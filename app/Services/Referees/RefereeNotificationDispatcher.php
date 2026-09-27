<?php

namespace App\Services\Referees;

use App\Mail\RefereeNotification;
use App\Models\JobApplication;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * Dedup + queue referee notification mail via the referee_notifications
 * table. The unique (job_application_id, referee_email) pair, enforced at
 * the DB level, is what actually guarantees no-duplicate — insertOrIgnore
 * only queues the mail for the row it actually inserted.
 */
class RefereeNotificationDispatcher
{
    public function dispatch(JobApplication $application, array $referees, string $applicantName): void
    {
        foreach ($referees as $referee) {
            $email = $referee['email'] ?? null;

            if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            $inserted = DB::table('referee_notifications')->insertOrIgnore([
                'job_application_id' => $application->id,
                'referee_email' => $email,
                'sent_at' => now(),
            ]);

            if ($inserted) {
                Mail::to($email)->queue(new RefereeNotification($application, $applicantName, $referee));
            }
        }
    }
}
