<?php

namespace Tests\Feature\Applicant;

use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Locks in the DraftService fix: a Step 1 draft must resolve the submitted
 * department name to department_id, not leave it null.
 */
class DraftPopulatesDepartmentIdTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_draft_save_populates_department_id_from_the_submitted_name(): void
    {
        $department = Department::create(['name' => 'Computer Science']);
        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $response = $this->actingAs($applicant)->post("/apply/{$advertisement->id}/draft", [
            'department' => 'Computer Science',
            'grade' => 'Assistant Professor',
            'form_data' => ['personal_details' => ['first_name' => 'Ada']],
        ]);

        $response->assertRedirect();

        $application = JobApplication::where('user_id', $applicant->id)
            ->where('advertisement_id', $advertisement->id)
            ->firstOrFail();

        $this->assertSame($department->id, $application->department_id);
    }
}
