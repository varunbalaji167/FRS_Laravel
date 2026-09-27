<?php

namespace Tests\Feature\Cache;

use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\Reporting\DashboardAggregator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * An admin row can carry a department, which used to make the admin and that
 * department's HOD share one entry — leaking global counts into an HOD's view.
 */
class DashboardCacheIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_with_a_department_does_not_poison_that_departments_hod_entry(): void
    {
        $advertisement = Advertisement::factory()->create();

        foreach (['Computer Science', 'Mechanical Engineering'] as $department) {
            JobApplication::factory()->submitted()->create([
                'advertisement_id' => $advertisement->id,
                'department' => $department,
            ]);
        }

        $admin = User::factory()->create(['role' => 'admin', 'department' => 'Computer Science']);
        $hod = User::factory()->create(['role' => 'hod', 'department' => 'Computer Science']);

        $aggregator = app(DashboardAggregator::class);

        $this->assertSame(2, $aggregator->forUser($admin)['stats']['totalApplications']);
        $this->assertSame(1, $aggregator->forUser($hod)['stats']['totalApplications']);
    }

    public function test_two_hods_get_their_own_entries(): void
    {
        $advertisement = Advertisement::factory()->create();

        JobApplication::factory()->submitted()->create([
            'advertisement_id' => $advertisement->id,
            'department' => 'Computer Science',
        ]);

        $cse = User::factory()->create(['role' => 'hod', 'department' => 'Computer Science']);
        $mech = User::factory()->create(['role' => 'hod', 'department' => 'Mechanical Engineering']);

        $aggregator = app(DashboardAggregator::class);

        $this->assertSame(1, $aggregator->forUser($cse)['stats']['totalApplications']);
        $this->assertSame(0, $aggregator->forUser($mech)['stats']['totalApplications']);
    }
}
