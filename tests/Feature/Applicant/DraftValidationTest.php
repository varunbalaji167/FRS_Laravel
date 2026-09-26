<?php

namespace Tests\Feature\Applicant;

use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class DraftValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_draft_save_with_no_required_fields_still_succeeds(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $response = $this->actingAs($applicant)->post("/apply/{$advertisement->id}/draft", [
            'department' => '',
            'grade' => '',
            'form_data' => ['personal_details' => ['first_name' => '']],
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $applicant->id,
            'advertisement_id' => $advertisement->id,
            'status' => 'draft',
        ]);
    }

    public function test_draft_save_rejects_a_non_image_profile_photo(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $response = $this->actingAs($applicant)->post("/apply/{$advertisement->id}/draft", [
            'form_data' => [
                'personal_details' => [
                    'profile_image' => UploadedFile::fake()->create('resume.pdf', 10, 'application/pdf'),
                ],
            ],
        ]);

        $response->assertSessionHasErrors('form_data.personal_details.profile_image');
    }

    public function test_uploaded_documents_is_stripped_from_the_draft_payload(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->actingAs($applicant)->post("/apply/{$advertisement->id}/draft", [
            'department' => 'Computer Science',
            'grade' => 'Assistant Professor',
            'form_data' => [
                'uploaded_documents' => ['phd_cert' => 'applications/1/1/spoofed.pdf'],
            ],
        ]);

        $application = JobApplication::where('user_id', $applicant->id)
            ->where('advertisement_id', $advertisement->id)
            ->firstOrFail();

        $this->assertArrayNotHasKey('uploaded_documents', $application->form_data);
    }

    public function test_draft_save_rejects_an_oversized_form_data_payload(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $response = $this->actingAs($applicant)->post("/apply/{$advertisement->id}/draft", [
            'form_data' => [
                'personal_details' => [
                    'corr_address' => str_repeat('x', 1024 * 1024 + 1),
                ],
            ],
        ]);

        $response->assertSessionHasErrors('form_data');
    }
}
