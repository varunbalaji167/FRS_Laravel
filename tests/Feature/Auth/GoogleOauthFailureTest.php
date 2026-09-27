<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Support\ErrorCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

/**
 * The OAuth callback is always a browser GET, so failures surface as a
 * redirect carrying the ErrorCode's message.
 */
class GoogleOauthFailureTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUser(string $email, array $raw = [], string $googleId = 'google-123'): void
    {
        $socialiteUser = (new SocialiteUser)->map([
            'id' => $googleId,
            'name' => 'Ada Lovelace',
            'email' => $email,
            'user' => $raw,
        ]);

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_a_state_mismatch_reports_oauth_state_invalid(): void
    {
        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andThrow(new InvalidStateException);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $this->get('/auth/google/callback')
            ->assertRedirect(route('login'))
            ->assertSessionHas('error', ErrorCode::OAUTH_STATE_INVALID->userMessage());
    }

    public function test_a_foreign_hosted_domain_on_the_staff_portal_reports_oauth_hd_mismatch(): void
    {
        $this->fakeGoogleUser('someone@iiti.ac.in', ['hd' => 'example.com']);

        $this->withSession(['intended_role' => 'admin'])
            ->get('/auth/google/callback')
            ->assertRedirect(route('login'))
            ->assertSessionHas('error', ErrorCode::OAUTH_HD_MISMATCH->userMessage());

        $this->assertGuest();
    }

    public function test_a_non_institute_email_on_the_staff_portal_reports_auth_domain_not_allowed(): void
    {
        $this->fakeGoogleUser('someone@gmail.com');

        $this->withSession(['intended_role' => 'admin'])
            ->get('/auth/google/callback')
            ->assertRedirect(route('login'))
            ->assertSessionHas('error', ErrorCode::AUTH_DOMAIN_NOT_ALLOWED->userMessage());
    }

    public function test_an_existing_password_account_reports_oauth_account_link_required(): void
    {
        $existing = User::factory()->create(['role' => 'applicant', 'google_id' => null]);
        $this->fakeGoogleUser($existing->email);

        $this->withSession(['intended_role' => 'applicant'])
            ->get('/auth/google/callback')
            ->assertRedirect(route('google.link'))
            ->assertSessionHas('error', ErrorCode::OAUTH_ACCOUNT_LINK_REQUIRED->userMessage());
    }

    public function test_a_successful_google_login_regenerates_the_session(): void
    {
        $user = User::factory()->create(['role' => 'applicant', 'google_id' => 'google-999']);
        $this->fakeGoogleUser($user->email, [], 'google-999');

        $this->startSession();
        $before = session()->getId();

        $this->withSession(['intended_role' => 'applicant'])->get('/auth/google/callback');

        $this->assertAuthenticatedAs($user->fresh());
        $this->assertNotSame($before, session()->getId());
    }
}
