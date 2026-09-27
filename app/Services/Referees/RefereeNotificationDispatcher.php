<?php

namespace App\Services\Referees;

use App\Mail\RefereeNotification;
use App\Models\JobApplication;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * The unique (job_application_id, referee_email) pair is what guarantees
 * no duplicates: insertOrIgnore only queues mail for a row it inserted.
 */
class RefereeNotificationDispatcher
{
    /**
     * @param  list<array<string, mixed>>  $referees
     */
    public function dispatch(JobApplication $application, array $referees, string $applicantName): void
    {
        foreach ($referees as $referee) {
            $email = $referee['email'] ?? null;

            if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Log::warning('Referee notification skipped: invalid email', [
                    'application_id' => $application->id,
                    'referee_email' => $email,
                ]);

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
