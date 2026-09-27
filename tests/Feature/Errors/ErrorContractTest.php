<?php

namespace Tests\Feature\Errors;

use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The docs/errors.md contract against real routes. HandlerTest covers the
 * mapping itself; this asserts the wiring actually produces it.
 */
class ErrorContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_domain_exception_carries_code_details_and_the_request_id_header(): void
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
        ]);

        $response->assertStatus(409)
            ->assertJson(['code' => 'APP_DRAFT_CONFLICT'])
            ->assertJsonStructure(['code', 'message', 'details', 'request_id']);

        $requestId = $response->json('request_id');
        $this->assertNotEmpty($requestId);
        $this->assertSame($requestId, $response->headers->get('X-Request-Id'));
    }

    public function test_step_validate_failure_carries_the_app_step_invalid_code(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $response = $this->actingAs($applicant)
            ->postJson("/apply/{$advertisement->id}/step/1/validate", ['department' => '', 'grade' => '']);

        $response->assertStatus(422)->assertJson(['code' => 'APP_STEP_INVALID']);
        $this->assertArrayHasKey('department', $response->json('details.fields'));
    }

    public function test_model_not_found_renders_the_not_found_code_for_json_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->getJson('/admin/applications/999999');

        $response->assertStatus(404)->assertJson(['code' => 'NOT_FOUND']);
    }

    public function test_authentication_exception_renders_the_auth_invalid_credentials_code_for_json_requests(): void
    {
        $response = $this->getJson('/profile');

        $response->assertStatus(401)->assertJson(['code' => 'AUTH_INVALID_CREDENTIALS']);
    }
}
