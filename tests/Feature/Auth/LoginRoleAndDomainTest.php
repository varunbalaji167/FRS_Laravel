<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The login endpoint's role/domain checks must reach the client as the
 * intended ErrorCode, not as a generic VALIDATION_FAILED (which is what the
 * pre-Phase-4 code threw via ValidationException::withMessages).
 */
class LoginRoleAndDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_institute_email_on_admin_portal_carries_the_domain_not_allowed_code(): void
    {
        User::factory()->create([
            'email' => 'external@gmail.com',
            'role' => 'admin',
        ]);

        $response = $this->postJson('/login', [
            'email' => 'external@gmail.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $response->assertStatus(403)
            ->assertJson(['code' => 'AUTH_DOMAIN_NOT_ALLOWED']);
        $this->assertGuest();
    }

    public function test_applicant_signing_in_to_admin_portal_carries_the_role_mismatch_code(): void
    {
        User::factory()->create([
            'email' => 'staff@iiti.ac.in',
            'role' => 'applicant',
        ]);

        $response = $this->postJson('/login', [
            'email' => 'staff@iiti.ac.in',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $response->assertStatus(403)
            ->assertJson(['code' => 'AUTH_ROLE_MISMATCH']);
        $this->assertGuest();
    }

    public function test_role_mismatch_flashes_back_for_a_real_inertia_login_visit(): void
    {
        User::factory()->create([
            'email' => 'staff@iiti.ac.in',
            'role' => 'applicant',
        ]);

        $response = $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => '1'])
            ->post('/login', [
                'email' => 'staff@iiti.ac.in',
                'password' => 'password',
                'role' => 'admin',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertGuest();
    }
}
