<?php

namespace Tests\Feature\Security;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A submitted application outside an HOD's department is a genuine scope
 * violation; a draft is hidden as 404 regardless (HodCannotSeeDraftsTest).
 */
class HodDepartmentScopeViolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_hod_cannot_view_a_submitted_application_from_another_department(): void
    {
        $hod = User::factory()->create(['role' => 'hod', 'department' => 'Computer Science']);
        $application = JobApplication::factory()->submitted()->create(['department' => 'Mechanical Engineering']);

        $response = $this->actingAs($hod)->getJson("/hod/applications/{$application->id}");

        $response->assertStatus(403)->assertJson(['code' => 'HOD_DEPT_SCOPE_VIOLATION']);
    }

    public function test_hod_cannot_update_status_of_an_application_from_another_department(): void
    {
        $hod = User::factory()->create(['role' => 'hod', 'department' => 'Computer Science']);
        $application = JobApplication::factory()->submitted()->create(['department' => 'Mechanical Engineering']);

        $response = $this->actingAs($hod)
            ->patchJson("/hod/applications/{$application->id}", ['status' => 'shortlisted']);

        $response->assertStatus(403)->assertJson(['code' => 'HOD_DEPT_SCOPE_VIOLATION']);
        $this->assertSame('submitted', $application->fresh()->status);
    }

    public function test_hod_can_still_view_a_submitted_application_in_their_own_department(): void
    {
        $hod = User::factory()->create(['role' => 'hod', 'department' => 'Computer Science']);
        $application = JobApplication::factory()->submitted()->create(['department' => 'Computer Science']);

        $response = $this->actingAs($hod)->get("/hod/applications/{$application->id}");

        $response->assertOk();
    }

    public function test_admin_is_not_scoped_by_department(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $application = JobApplication::factory()->submitted()->create(['department' => 'Mechanical Engineering']);

        $response = $this->actingAs($admin)->get("/admin/applications/{$application->id}");

        $response->assertOk();
    }
}
