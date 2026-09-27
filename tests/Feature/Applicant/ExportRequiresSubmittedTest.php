<?php

namespace Tests\Feature\Applicant;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportRequiresSubmittedTest extends TestCase
{
    use RefreshDatabase;

    public function test_applicant_cannot_export_pdf_of_a_draft_application(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $application = JobApplication::factory()->draft()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->get("/applications/{$application->id}/export/pdf");

        $response->assertNotFound();
    }

    public function test_applicant_cannot_export_excel_of_a_draft_application(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $application = JobApplication::factory()->draft()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->get("/applications/{$application->id}/export/excel");

        $response->assertNotFound();
    }

    public function test_applicant_can_export_pdf_of_their_own_submitted_application(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $application = JobApplication::factory()->submitted()->create(['user_id' => $applicant->id]);

        $response = $this->actingAs($applicant)->get("/applications/{$application->id}/export/pdf");

        $response->assertOk();
    }

    /**
     * A review decision is not a reason to revoke the applicant's own copy.
     */
    public function test_a_review_decision_does_not_revoke_the_applicants_export(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);

        foreach (['shortlisted', 'rejected'] as $status) {
            $application = JobApplication::factory()->create([
                'user_id' => $applicant->id,
                'status' => $status,
            ]);

            $this->actingAs($applicant)
                ->get("/applications/{$application->id}/export/pdf")
                ->assertOk();
        }
    }

    public function test_applicant_cannot_export_someone_elses_submitted_application(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $application = JobApplication::factory()->submitted()->create();

        $response = $this->actingAs($applicant)->get("/applications/{$application->id}/export/pdf");

        $response->assertNotFound();
    }
}
