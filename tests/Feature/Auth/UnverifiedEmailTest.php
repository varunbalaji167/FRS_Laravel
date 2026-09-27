<?php

namespace Tests\Feature\Auth;

use App\Models\Advertisement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnverifiedEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_unverified_applicant_cannot_reach_the_wizard(): void
    {
        $applicant = User::factory()->unverified()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $this->actingAs($applicant)
            ->get("/apply/{$advertisement->id}")
            ->assertRedirect(route('verification.notice'));
    }

    public function test_a_json_caller_gets_the_auth_unverified_email_contract(): void
    {
        $applicant = User::factory()->unverified()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $this->actingAs($applicant)
            ->postJson("/apply/{$advertisement->id}/step/1/validate", ['department' => 'CSE', 'grade' => 'Professor'])
            ->assertStatus(403)
            ->assertJsonPath('code', 'AUTH_UNVERIFIED_EMAIL');
    }

    public function test_a_verified_applicant_is_let_through(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $advertisement = Advertisement::factory()->create();

        $this->actingAs($applicant)
            ->get("/apply/{$advertisement->id}")
            ->assertOk();
    }
}
