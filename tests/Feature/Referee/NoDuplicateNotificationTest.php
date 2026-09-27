<?php

namespace Tests\Feature\Referee;

use App\Mail\RefereeNotification;
use App\Models\JobApplication;
use App\Services\Referees\RefereeNotificationDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NoDuplicateNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatching_twice_for_the_same_application_and_referee_only_queues_one_mail(): void
    {
        Mail::fake();

        $application = JobApplication::factory()->submitted()->create();
        $referees = [['name' => 'Referee One', 'email' => 'r1@example.com']];

        $dispatcher = app(RefereeNotificationDispatcher::class);
        $dispatcher->dispatch($application, $referees, 'Ada Lovelace');
        $dispatcher->dispatch($application, $referees, 'Ada Lovelace');

        Mail::assertQueued(RefereeNotification::class, 1);

        $this->assertSame(1, DB::table('referee_notifications')
            ->where('job_application_id', $application->id)
            ->where('referee_email', 'r1@example.com')
            ->count());
    }

    public function test_invalid_or_missing_referee_emails_are_skipped(): void
    {
        Mail::fake();

        $application = JobApplication::factory()->submitted()->create();
        $referees = [
            ['name' => 'Bad Email', 'email' => 'not-an-email'],
            ['name' => 'No Email'],
        ];

        app(RefereeNotificationDispatcher::class)->dispatch($application, $referees, 'Ada Lovelace');

        Mail::assertNothingQueued();
        $this->assertSame(0, DB::table('referee_notifications')->count());
    }
}
