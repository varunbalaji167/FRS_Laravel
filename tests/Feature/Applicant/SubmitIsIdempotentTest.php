<?php

namespace Tests\Feature\Applicant;

use App\Mail\ApplicationSubmitted;
use App\Mail\RefereeNotification;
use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SubmitIsIdempotentTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(): array
    {
        return [
            'department' => 'Computer Science',
            'grade' => 'Assistant Professor',
            'form_data' => [
                'personal_details' => [
                    'first_name' => 'Ada',
                    'last_name' => 'Lovelace',
                    'dob' => '1990-01-01',
                    'gender' => 'Female',
                    'category' => 'UR',
                    'nationality' => 'Indian',
                    'email' => 'ada@example.com',
                    'phone' => '9876543210',
                ],
                'education' => [
                    'phd' => [
                        'university' => 'IIT Indore',
                        'department' => 'Computer Science',
                        'date_joining' => '2015-07-01',
                    ],
                ],
                'employment' => [
                    'present' => [
                        'position' => 'Lecturer',
                        'organization' => 'IIT Indore',
                        'date_joining' => '2020-01-01',
                    ],
                    'has_three_years_exp' => 'Yes',
                ],
                'research' => [
                    'specialization' => [
                        'area_of_specialization' => 'Machine Learning',
                        'current_area_of_research' => 'Deep Learning',
                    ],
                ],
                'statements' => [
                    'research_plan' => 'Continue research in ML.',
                    'teaching_plan' => 'Teach undergraduate CS courses.',
                ],
                'referees_section' => [
                    'referees' => [
                        ['name' => 'Referee One', 'position' => 'Professor', 'association' => 'PhD Advisor', 'institute' => 'IIT Indore', 'email' => 'r1@example.com', 'contact_number' => '9000000001'],
                        ['name' => 'Referee Two', 'position' => 'Professor', 'association' => 'Colleague', 'institute' => 'IIT Bombay', 'email' => 'r2@example.com', 'contact_number' => '9000000002'],
                        ['name' => 'Referee Three', 'position' => 'Professor', 'association' => 'Manager', 'institute' => 'IIT Delhi', 'email' => 'r3@example.com', 'contact_number' => '9000000003'],
                    ],
                ],
                'declaration' => true,
            ],
            'documents' => [
                'phd_cert' => UploadedFile::fake()->create('phd.pdf', 100, 'application/pdf'),
                'ssc_cert' => UploadedFile::fake()->create('ssc.pdf', 100, 'application/pdf'),
                'signature' => UploadedFile::fake()->image('signature.png'),
            ],
        ];
    }

    public function test_resubmit_is_rejected_and_leaves_the_stored_dossier_untouched(): void
    {
        Storage::fake('local');
        Mail::fake();

        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $this->actingAs($applicant)
            ->post("/apply/{$advertisement->id}/submit", $this->validPayload())
            ->assertRedirect(route('dashboard'));

        $stored = JobApplication::where('user_id', $applicant->id)->sole();

        $tampered = $this->validPayload();
        $tampered['form_data']['personal_details']['first_name'] = 'Tampered';

        $this->actingAs($applicant)
            ->postJson("/apply/{$advertisement->id}/submit", $tampered)
            ->assertStatus(409)
            ->assertJsonPath('code', 'APP_ALREADY_SUBMITTED');

        $this->assertSame(1, JobApplication::where('user_id', $applicant->id)->count());
        $this->assertSame(
            $stored->form_data['personal_details']['first_name'],
            $stored->fresh()->form_data['personal_details']['first_name'],
        );

        Mail::assertQueued(ApplicationSubmitted::class, 1);
        Mail::assertQueued(RefereeNotification::class, 3);
    }
}
