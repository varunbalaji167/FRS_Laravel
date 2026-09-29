<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleAccountLinkRequiredTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUserFor(string $email, string $googleId = 'google-123'): void
    {
        $socialiteUser = (new SocialiteUser)->map([
            'id' => $googleId,
            'name' => 'Ada Lovelace',
            'email' => $email,
            'user' => [],
        ]);

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_existing_local_account_is_redirected_to_link_instead_of_silently_merged(): void
    {
        $existing = User::factory()->create(['role' => 'applicant', 'google_id' => null]);
        $this->fakeGoogleUserFor($existing->email);

        $response = $this->withSession(['intended_role' => 'applicant'])->get('/auth/google/callback');

        $response->assertRedirect(route('google.link'));
        $this->assertNull($existing->fresh()->google_id);
        $this->assertGuest();
    }

    public function test_confirming_the_password_links_the_account_and_logs_in(): void
    {
        $existing = User::factory()->create(['role' => 'applicant', 'google_id' => null]);
        $this->fakeGoogleUserFor($existing->email, 'google-456');

        $this->withSession(['intended_role' => 'applicant'])->get('/auth/google/callback');

        $response = $this->post('/auth/google/link', ['password' => 'password']);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($existing->fresh());
        $this->assertSame('google-456', $existing->fresh()->google_id);
    }

    public function test_wrong_password_does_not_link_or_log_in(): void
    {
        $existing = User::factory()->create(['role' => 'applicant', 'google_id' => null]);
        $this->fakeGoogleUserFor($existing->email);

        $this->withSession(['intended_role' => 'applicant'])->get('/auth/google/callback');

        $response = $this->postJson('/auth/google/link', ['password' => 'wrong-password']);

        $response->assertStatus(401)->assertJson(['code' => 'AUTH_INVALID_CREDENTIALS']);
        $this->assertGuest();
        $this->assertNull($existing->fresh()->google_id);
    }

    public function test_wrong_password_flashes_a_toast_message_for_a_real_inertia_visit(): void
    {
        $existing = User::factory()->create(['role' => 'applicant', 'google_id' => null]);
        $this->fakeGoogleUserFor($existing->email);

        $this->withSession(['intended_role' => 'applicant'])->get('/auth/google/callback');

        $response = $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => '1'])
            ->post('/auth/google/link', ['password' => 'wrong-password']);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $response->assertSessionDoesntHaveErrors();
        $this->assertGuest();
        $this->assertNull($existing->fresh()->google_id);
    }

    public function test_an_already_linked_account_logs_in_without_a_link_step(): void
    {
        $existing = User::factory()->create(['role' => 'applicant', 'google_id' => 'google-789']);
        $this->fakeGoogleUserFor($existing->email, 'google-789');

        $response = $this->withSession(['intended_role' => 'applicant'])->get('/auth/google/callback');

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($existing->fresh());
    }
}
