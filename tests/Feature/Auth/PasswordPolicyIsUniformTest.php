<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Registration used to be the only endpoint with a real policy, so a reset
 * could quietly downgrade an account to Laravel's stock default.
 */
class PasswordPolicyIsUniformTest extends TestCase
{
    use RefreshDatabase;

    private const WEAK = 'password';

    public function test_registration_rejects_a_weak_password(): void
    {
        $this->post('/register', [
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'password' => self::WEAK,
            'password_confirmation' => self::WEAK,
        ])->assertSessionHasErrors('password');
    }

    public function test_changing_a_password_rejects_a_weak_one(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->from('/profile')->put('/password', [
            'current_password' => 'password',
            'password' => self::WEAK,
            'password_confirmation' => self::WEAK,
        ])->assertSessionHasErrors('password');
    }

    public function test_resetting_a_password_rejects_a_weak_one(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => self::WEAK,
                'password_confirmation' => self::WEAK,
            ])->assertSessionHasErrors('password');

            return true;
        });
    }
}
