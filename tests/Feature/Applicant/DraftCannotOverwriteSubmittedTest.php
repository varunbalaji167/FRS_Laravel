<?php

namespace Tests\Feature\Applicant;

use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DraftCannotOverwriteSubmittedTest extends TestCase
{
    use RefreshDatabase;

    public function test_save_draft_on_a_submitted_application_is_rejected(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();
        $application = JobApplication::factory()->submitted()->create([
            'user_id' => $applicant->id,
            'advertisement_id' => $advertisement->id,
        ]);

        $response = $this->actingAs($applicant)->post("/apply/{$advertisement->id}/draft", [
            'department' => 'Mechanical Engineering',
            'grade' => 'Professor',
            'form_data' => ['personal_details' => ['first_name' => 'Hacker']],
        ]);

        $response->assertStatus(409);
        $fresh = $application->fresh();
        $this->assertSame('submitted', $fresh->status);
        $this->assertNotSame('Mechanical Engineering', $fresh->department);
    }

    public function test_save_draft_on_an_existing_draft_still_succeeds(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();
        $application = JobApplication::factory()->draft()->create([
            'user_id' => $applicant->id,
            'advertisement_id' => $advertisement->id,
        ]);

        $response = $this->actingAs($applicant)->post("/apply/{$advertisement->id}/draft", [
            'department' => 'Mechanical Engineering',
            'grade' => 'Professor',
            'form_data' => ['personal_details' => ['first_name' => 'Applicant']],
        ]);

        $response->assertRedirect();
        $this->assertSame('Mechanical Engineering', $application->fresh()->department);
    }
}
