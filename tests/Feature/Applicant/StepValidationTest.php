<?php

namespace Tests\Feature\Applicant;

use App\Models\Advertisement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StepValidationTest extends TestCase
{
    use RefreshDatabase;

    private function validate(User $applicant, Advertisement $advertisement, int $step, array $payload)
    {
        return $this->actingAs($applicant)
            ->postJson("/apply/{$advertisement->id}/step/{$step}/validate", $payload);
    }

    /**
     * Failures here use the docs/errors.md contract, not Laravel's default
     * { message, errors } shape.
     */
    private function assertStepInvalid($response, array $fields): void
    {
        $response->assertStatus(422)->assertJson(['code' => 'APP_STEP_INVALID']);

        foreach ($fields as $field) {
            $this->assertArrayHasKey(
                $field,
                $response->json('details.fields'),
                "Expected a validation error for [{$field}]."
            );
        }
    }

    public function test_step_1_happy_and_failing_path(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->validate($applicant, $advertisement, 1, ['department' => 'Computer Science', 'grade' => 'Assistant Professor'])
            ->assertOk();

        $this->assertStepInvalid(
            $this->validate($applicant, $advertisement, 1, ['department' => '', 'grade' => '']),
            ['department', 'grade']
        );
    }

    public function test_step_2_happy_and_failing_path(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->validate($applicant, $advertisement, 2, ['form_data' => ['personal_details' => [
            'first_name' => 'Ada', 'last_name' => 'Lovelace', 'dob' => '1990-01-01',
            'gender' => 'Female', 'category' => 'UR', 'nationality' => 'Indian',
            'email' => 'ada@example.com', 'phone' => '9876543210',
        ]]])->assertOk();

        $this->assertStepInvalid(
            $this->validate($applicant, $advertisement, 2, ['form_data' => ['personal_details' => [
                'first_name' => 'Ada', 'email' => 'not-an-email', 'phone' => '123',
            ]]]),
            [
                'form_data.personal_details.last_name',
                'form_data.personal_details.email',
                'form_data.personal_details.phone',
            ]
        );
    }

    /**
     * A value the master profile used to offer ("General"/"Other") is a
     * non-empty string, so it passes the client-side zod check silently —
     * only the server's Rule::in catches it. Locks in that the field error
     * key is exactly what resources/js/lib/wizardErrorKeys.js expects.
     */
    public function test_step_2_rejects_the_retired_profile_category_value(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->assertStepInvalid(
            $this->validate($applicant, $advertisement, 2, ['form_data' => ['personal_details' => [
                'first_name' => 'Ada', 'last_name' => 'Lovelace', 'dob' => '1990-01-01',
                'gender' => 'Female', 'category' => 'General', 'nationality' => 'Indian',
                'email' => 'ada@example.com', 'phone' => '9876543210',
            ]]]),
            ['form_data.personal_details.category']
        );
    }

    public function test_step_3_rejects_a_phd_joining_year_outside_the_allowed_range(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->validate($applicant, $advertisement, 3, ['form_data' => ['education' => ['phd' => [
            'university' => 'IIT Indore', 'department' => 'CSE', 'date_joining' => '2015-01-01',
        ]]]])->assertOk();

        $this->assertStepInvalid(
            $this->validate($applicant, $advertisement, 3, ['form_data' => ['education' => ['phd' => [
                'university' => 'IIT Indore', 'department' => 'CSE', 'date_joining' => '1900-01-01',
            ]]]]),
            ['form_data.education.phd.date_joining']
        );
    }

    public function test_step_6_has_no_mandatory_fields(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $this->validate($applicant, $advertisement, 6, ['form_data' => ['additional_info' => []]])
            ->assertOk();
    }

    public function test_step_10_requires_at_least_three_fully_filled_referees(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        $referee = [
            'name' => 'Referee', 'position' => 'Professor', 'association' => 'Advisor',
            'institute' => 'IIT Indore', 'email' => 'r@example.com', 'contact_number' => '9000000001',
        ];

        $this->validate($applicant, $advertisement, 10, ['form_data' => ['referees_section' => [
            'referees' => [$referee, $referee, $referee],
        ]]])->assertOk();

        $this->assertStepInvalid(
            $this->validate($applicant, $advertisement, 10, ['form_data' => ['referees_section' => [
                'referees' => [$referee],
            ]]]),
            ['form_data.referees_section.referees']
        );
    }

    public function test_unknown_step_number_is_not_found(): void
    {
        $applicant = User::factory()->create();
        $advertisement = Advertisement::factory()->create();

        // Contract-shaped 404: an abort(404) in the FormRequest would slip
        // past Handler's DomainException branch on an Inertia visit.
        $this->validate($applicant, $advertisement, 12, [])
            ->assertNotFound()
            ->assertJson(['code' => 'NOT_FOUND']);
    }
}
