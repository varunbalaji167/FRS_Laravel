<?php

namespace Tests\Feature\Admin;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatusEventsRecordedTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_status_update_records_an_event(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $application = JobApplication::factory()->submitted()->create();

        $this->actingAs($admin)
            ->patch("/admin/applications/{$application->id}", ['status' => 'shortlisted']);

        $this->assertDatabaseHas('application_status_events', [
            'application_id' => $application->id,
            'actor_id' => $admin->id,
            'from' => 'submitted',
            'to' => 'shortlisted',
        ]);
    }

    public function test_hod_status_update_records_an_event(): void
    {
        $hod = User::factory()->create(['role' => 'hod', 'department' => 'Computer Science']);
        $application = JobApplication::factory()->submitted()->create(['department' => 'Computer Science']);

        $this->actingAs($hod)
            ->patch("/hod/applications/{$application->id}", ['status' => 'rejected']);

        $this->assertDatabaseHas('application_status_events', [
            'application_id' => $application->id,
            'actor_id' => $hod->id,
            'from' => 'submitted',
            'to' => 'rejected',
        ]);
    }
}
