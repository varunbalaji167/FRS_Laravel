<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class LoginThrottleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('');
    }

    public function test_the_sixth_failed_attempt_returns_the_auth_rate_limited_contract(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
                'role' => 'applicant',
            ])->assertStatus(422);
        }

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'role' => 'applicant',
        ]);

        $response->assertStatus(429)
            ->assertJsonPath('code', 'AUTH_RATE_LIMITED')
            ->assertHeader('Retry-After');
    }

    public function test_a_lockout_blocks_the_correct_password_too(): void
    {
        $user = User::factory()->create(['role' => 'applicant']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
                'role' => 'applicant',
            ]);
        }

        $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'applicant',
        ])->assertStatus(429);

        $this->assertGuest();
    }
}
