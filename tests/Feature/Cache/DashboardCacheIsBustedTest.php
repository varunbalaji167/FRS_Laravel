<?php

namespace Tests\Feature\Cache;

use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\Reporting\DashboardAggregator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Phase 8: DashboardAggregator caches the admin/HOD dashboard for 120s
 * (docs/architecture.md). Every write path that changes the numbers must
 * bust the relevant cache entry, or the dashboard shows stale counts until
 * the TTL expires. See PLAN.md Phase 8.
 */
class DashboardCacheIsBustedTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_update_busts_the_admin_dashboard_cache(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $advertisement = Advertisement::factory()->create();
        $application = JobApplication::factory()->submitted()->create([
            'advertisement_id' => $advertisement->id,
            'department' => 'Computer Science',
        ]);

        // Prime the cache.
        $first = $this->actingAs($admin)->get('/admin');
        $first->assertOk();
        $first->assertInertia(fn ($page) => $page
            ->where('stats.submitted', 1)
            ->where('stats.shortlisted', 0)
        );

        $this->actingAs($admin)
            ->patch("/admin/applications/{$application->id}", ['status' => 'shortlisted'])
            ->assertRedirect();

        // Without the bust in ApplicationController::updateStatus, this
        // would still show the pre-update counts for another 120s.
        $second = $this->actingAs($admin)->get('/admin');
        $second->assertOk();
        $second->assertInertia(fn ($page) => $page
            ->where('stats.submitted', 0)
            ->where('stats.shortlisted', 1)
        );
    }

    public function test_hod_dashboard_cache_is_scoped_per_department(): void
    {
        $csHod = User::factory()->create(['role' => 'hod', 'department' => 'Computer Science']);
        $mathHod = User::factory()->create(['role' => 'hod', 'department' => 'Mathematics']);

        // Prime both HODs' cache entries.
        $this->actingAs($csHod)->get('/hod')->assertOk();
        $this->actingAs($mathHod)->get('/hod')->assertOk();

        $this->assertTrue(Cache::has('dashboard.hod.Computer Science.v1'));
        $this->assertTrue(Cache::has('dashboard.hod.Mathematics.v1'));

        app(DashboardAggregator::class)->forget('Computer Science');

        // Busting is per-department: forgetting Computer Science's entry
        // (and the shared admin entry) must not evict Mathematics'.
        $this->assertFalse(Cache::has('dashboard.hod.Computer Science.v1'));
        $this->assertTrue(Cache::has('dashboard.hod.Mathematics.v1'));
    }
}
