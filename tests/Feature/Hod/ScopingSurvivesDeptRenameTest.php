<?php

namespace Tests\Feature\Hod;

use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 8 department FK cutover: with FEATURE_DEPARTMENT_FK on, HOD scoping
 * (Admin\ApplicationController::getScopedQuery/findVisibleOrFail) keys off
 * department_id, so renaming a department in Settings can't silently drop
 * an HOD's own applications out of scope or leak them to the wrong HOD.
 * See PLAN.md Phase 8 and config/features.php.
 */
class ScopingSurvivesDeptRenameTest extends TestCase
{
    use RefreshDatabase;

    public function test_hod_still_sees_their_departments_applications_after_a_rename(): void
    {
        config(['features.department_fk' => true]);

        $department = Department::create(['name' => 'Computer Science']);

        $hod = User::factory()->create([
            'role' => 'hod',
            'department' => $department->name,
            'department_id' => $department->id,
        ]);

        $application = JobApplication::factory()->submitted()->create([
            'department' => $department->name,
            'department_id' => $department->id,
        ]);

        // Rename the department. The string columns are now stale on both
        // rows, but department_id never changed.
        $department->update(['name' => 'Computer Science and Engineering']);

        $indexResponse = $this->actingAs($hod)->get('/hod/applications');
        $indexResponse->assertOk();
        $indexResponse->assertInertia(fn ($page) => $page
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $application->id)
        );

        $showResponse = $this->actingAs($hod)->get("/hod/applications/{$application->id}");
        $showResponse->assertOk();
    }

    public function test_hod_cannot_see_another_departments_application_after_a_rename(): void
    {
        config(['features.department_fk' => true]);

        $ownDepartment = Department::create(['name' => 'Computer Science']);
        $otherDepartment = Department::create(['name' => 'Mathematics']);

        $hod = User::factory()->create([
            'role' => 'hod',
            'department' => $ownDepartment->name,
            'department_id' => $ownDepartment->id,
        ]);

        $foreignApplication = JobApplication::factory()->submitted()->create([
            // The legacy string column has drifted out of sync with
            // department_id (e.g. a rename that only updated some rows) and
            // now collides with the HOD's own department name. Under
            // string-based scoping this would leak the row; department_id
            // still correctly points at Mathematics.
            'department' => $ownDepartment->name,
            'department_id' => $otherDepartment->id,
        ]);

        $response = $this->actingAs($hod)->get("/hod/applications/{$foreignApplication->id}");

        $response->assertForbidden();
    }
}
