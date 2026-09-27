<?php

namespace Tests\Feature\Errors;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Breaks loudly if CheckRole ever bypasses the error framework again — an
 * earlier commit used abort(403), which Handler's branch does not match.
 */
class ForbiddenContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_wrong_role_on_a_json_call_returns_the_forbidden_contract(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);

        $response = $this->actingAs($applicant)->getJson('/admin/applications');

        $response->assertStatus(403)
            ->assertJson(['code' => 'FORBIDDEN'])
            ->assertHeader('X-Request-Id');
    }

    public function test_wrong_role_on_a_browser_get_renders_the_inertia_error_page(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);

        $response = $this->actingAs($applicant)
            ->withHeaders(['Accept' => 'text/html'])
            ->get('/admin/applications');

        $response->assertStatus(403);
        // The page component name is embedded in data-page, so the Error page
        // identifies itself whether or not the client renders it.
        $response->assertSee('Error', escape: false);
    }

    public function test_guest_hitting_a_role_guarded_route_is_redirected_to_login(): void
    {
        // Guards the ordering: `auth` runs before `role:`, so a visitor gets
        // the login redirect and never reaches the FORBIDDEN contract.
        $response = $this->get('/admin/applications');

        $response->assertRedirect(route('login'));
    }
}
