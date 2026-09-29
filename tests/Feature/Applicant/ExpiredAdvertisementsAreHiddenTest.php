<?php

namespace Tests\Feature\Applicant;

use App\Models\Advertisement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Applicants should only ever be offered advertisements whose registration
 * deadline hasn't passed yet — an expired ad must not appear on the public
 * homepage or the applicant dashboard.
 */
class ExpiredAdvertisementsAreHiddenTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_hides_advertisements_past_their_deadline(): void
    {
        $open = Advertisement::factory()->create(['deadline' => now()->addWeek()]);
        $expired = Advertisement::factory()->create(['deadline' => now()->subWeek()]);

        $response = $this->get('/');

        $ids = collect($response->getOriginalContent()->getData()['page']['props']['advertisements'])
            ->pluck('id');

        $this->assertTrue($ids->contains($open->id));
        $this->assertFalse($ids->contains($expired->id));
    }

    public function test_applicant_dashboard_hides_advertisements_past_their_deadline(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $open = Advertisement::factory()->create(['deadline' => now()->addWeek()]);
        $expired = Advertisement::factory()->create(['deadline' => now()->subWeek()]);

        $response = $this->actingAs($applicant)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->where(
                'advertisements',
                fn ($advertisements) => collect($advertisements)->pluck('id')->contains($open->id)
                    && ! collect($advertisements)->pluck('id')->contains($expired->id)
            ));
    }

    public function test_applicant_dashboard_still_shows_an_advertisement_due_today(): void
    {
        $applicant = User::factory()->create(['role' => 'applicant']);
        $dueToday = Advertisement::factory()->create(['deadline' => now()->startOfDay()]);

        $response = $this->actingAs($applicant)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->where(
                'advertisements',
                fn ($advertisements) => collect($advertisements)->pluck('id')->contains($dueToday->id)
            ));
    }
}
