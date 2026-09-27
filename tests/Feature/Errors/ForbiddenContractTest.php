<?php

namespace Tests\Feature\Errors;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Every role-guarded route hits CheckRole. If CheckRole ever bypasses the
 * error framework again (an earlier commit used `abort(403, 'string')`,
 * which throws a plain HttpException that Handler's AccessDeniedHttpException
 * branch does NOT match), these tests break loudly.
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
        // The Inertia Error page identifies itself in the response body
        // regardless of whether the test client renders it — the page
        // component name is embedded in the data-page attribute.
        $response->assertSee('Error', escape: false);
    }

    public function test_guest_hitting_a_role_guarded_route_is_redirected_to_login(): void
    {
        // The framework's `auth` middleware runs before `role:`, so this
        // test guards the ordering: an unauthenticated visitor should never
        // reach CheckRole and never see the FORBIDDEN contract — they get
        // Laravel's standard login redirect first.
        $response = $this->get('/admin/applications');

        $response->assertRedirect(route('login'));
    }
}
