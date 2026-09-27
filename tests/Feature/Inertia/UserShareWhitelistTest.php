<?php

namespace Tests\Feature\Inertia;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * HandleInertiaRequests shares only a whitelisted subset of the user.
 */
class UserShareWhitelistTest extends TestCase
{
    use RefreshDatabase;

    public function test_shared_user_omits_sensitive_and_heavy_fields(): void
    {
        $user = User::factory()->create([
            'role' => 'applicant',
            'google_id' => 'google-123',
        ]);
        $user->applicantProfile()->create(['father_name' => 'Test Father']);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('auth.user.id')
            ->has('auth.user.name')
            ->has('auth.user.email')
            ->has('auth.user.role')
            ->has('auth.user.department')
            ->missing('auth.user.google_id')
            ->missing('auth.user.email_verified_at')
            ->missing('auth.user.applicant_profile')
            ->missing('auth.user.applicantProfile')
        );
    }
}
