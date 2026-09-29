<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'applicant',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    /**
     * A wrong password is a DomainException, not a generic ValidationException
     * — otherwise it renders as "Please fix the highlighted fields" instead
     * of "Incorrect email or password."
     */
    public function test_invalid_password_carries_the_auth_invalid_credentials_code(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'role' => 'applicant',
        ]);

        $response->assertStatus(401)
            ->assertJson(['code' => 'AUTH_INVALID_CREDENTIALS']);
        $this->assertGuest();
    }

    public function test_invalid_password_flashes_a_toast_message_for_a_real_inertia_login_visit(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);

        $response = $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => '1'])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
                'role' => 'applicant',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $response->assertSessionDoesntHaveErrors();
        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
