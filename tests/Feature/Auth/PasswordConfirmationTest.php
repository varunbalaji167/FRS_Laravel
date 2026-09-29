<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordConfirmationTest extends TestCase
{
    use RefreshDatabase;

    public function test_confirm_password_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/confirm-password');

        $response->assertStatus(200);
    }

    public function test_password_can_be_confirmed(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/confirm-password', [
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    public function test_password_is_not_confirmed_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/confirm-password', [
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)->assertJson(['code' => 'AUTH_INVALID_CREDENTIALS']);
    }

    public function test_invalid_password_flashes_a_toast_message_for_a_real_inertia_visit(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => '1'])
            ->post('/confirm-password', ['password' => 'wrong-password']);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $response->assertSessionDoesntHaveErrors();
    }
}
