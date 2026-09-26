<?php

namespace Tests\Feature\Applicant;

use App\Models\Advertisement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SubmitValidationTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(): array
    {
        return [
            'department' => 'Computer Science',
            'grade' => 'Assistant Professor',
            'form_data' => [
                'personal_details' => [
                    'first_name' => 'Ada', 'last_name' => 'Lovelace', 'dob' => '1990-01-01',
                    'gender' => 'Female', 'category' => 'UR', 'nationality' => 'Indian',
                    'email' => 'ada@example.com', 'phone' => '9876543210',
                ],
                'education' => ['phd' => [
                    'university' => 'IIT Indore', 'department' => 'Computer Science', 'date_joining' => '2015-07-01',
                ]],
                'employment' => [
                    'present' => ['position' => 'Lecturer', 'organization' => 'IIT Indore', 'date_joining' => '2020-01-01'],
                    'has_three_years_exp' => 'Yes',
                ],
                'research' => ['specialization' => [
                    'area_of_specialization' => 'Machine Learning', 'current_area_of_research' => 'Deep Learning',
                ]],
                'statements' => ['research_plan' => 'Plan.', 'teaching_plan' => 'Plan.'],
                'referees_section' => ['referees' => [
                    ['name' => 'R1', 'position' => 'Professor', 'association' => 'Advisor', 'institute' => 'IIT Indore', 'email' => 'r1@example.com', 'contact_number' => '9000000001'],
                    ['name' => 'R2', 'position' => 'Professor', 'association' => 'Colleague', 'institute' => 'IIT Bombay', 'email' => 'r2@example.com', 'contact_number' => '9000000002'],
                    ['name' => 'R3', 'position' => 'Professor', 'association' => 'Manager', 'institute' => 'IIT Delhi', 'email' => 'r3@example.com', 'contact_number' => '9000000003'],
                ]],
                'declaration' => true,
            ],
            'documents' => [
                'phd_cert' => UploadedFile::fake()->create('phd.pdf', 100, 'application/pdf'),
                'ssc_cert' => UploadedFile::fake()->create('ssc.pdf', 100, 'application/pdf'),
                'signature' => UploadedFile::fake()->image('signature.png'),
            ],
        ];
    }

    private function submit(User $applicant, Advertisement $advertisement, array $overrides = [])
    {
        return $this->actingAs($applicant)
            ->post("/apply/{$advertisement->id}/submit", array_replace_recursive($this->validPayload(), $overrides));
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Mail::fake();
    }

    public function test_a_fully_valid_application_submits_successfully(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->submit($applicant, $advertisement)->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('job_applications', [
            'user_id' => $applicant->id,
            'advertisement_id' => $advertisement->id,
            'status' => 'submitted',
        ]);
    }

    public function test_submit_after_the_deadline_is_rejected(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create(['deadline' => now()->subDay()]);

        $this->submit($applicant, $advertisement)->assertStatus(422);
    }

    public function test_submit_against_an_inactive_advertisement_is_rejected(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create(['is_active' => false]);

        $this->submit($applicant, $advertisement)->assertStatus(422);
    }

    public function test_an_unknown_document_upload_key_is_rejected(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $payload = $this->validPayload();
        $payload['documents']['hacked_key'] = UploadedFile::fake()->create('sneaky.pdf', 10, 'application/pdf');

        $this->actingAs($applicant)
            ->post("/apply/{$advertisement->id}/submit", $payload)
            ->assertStatus(422);
    }

    public function test_a_previously_skipped_step_6_field_is_now_validated(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->submit($applicant, $advertisement, [
            'form_data' => ['additional_info' => ['books' => [
                ['authors' => 'X', 'title' => 'Y', 'year' => 1800],
            ]]],
        ])
            ->assertStatus(302)
            ->assertSessionHasErrors('form_data.additional_info.books.0.year');
    }
}
