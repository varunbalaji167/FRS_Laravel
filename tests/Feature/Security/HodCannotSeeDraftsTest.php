<?php

namespace Tests\Feature\Security;

use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HodCannotSeeDraftsTest extends TestCase
{
    use RefreshDatabase;

    public function test_hod_gets_404_for_a_draft_application_in_their_own_department(): void
    {
        $department = Department::firstOrCreate(['name' => 'Computer Science']);
        $hod = User::factory()->create(['role' => 'hod', 'department_id' => $department->id]);
        $application = JobApplication::factory()->draft()->create([
            'department_id' => $department->id,
        ]);

        $response = $this->actingAs($hod)->get("/hod/applications/{$application->id}");

        $response->assertNotFound();
    }

    public function test_hod_does_not_see_drafts_in_the_applications_index(): void
    {
        $department = Department::firstOrCreate(['name' => 'Computer Science']);
        $hod = User::factory()->create(['role' => 'hod', 'department_id' => $department->id]);
        JobApplication::factory()->draft()->create(['department_id' => $department->id]);
        $submitted = JobApplication::factory()->submitted()->create(['department_id' => $department->id]);

        $response = $this->actingAs($hod)->get('/hod/applications');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $submitted->id)
        );
    }

    public function test_admin_gets_404_for_a_draft_application(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $application = JobApplication::factory()->draft()->create();

        $response = $this->actingAs($admin)->get("/admin/applications/{$application->id}");

        $response->assertNotFound();
    }
}
