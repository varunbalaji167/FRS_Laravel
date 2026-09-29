<?php

namespace Tests\Feature\Cache;

use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\Reporting\DashboardAggregator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
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
        $cse = Department::firstOrCreate(['name' => 'Computer Science']);
        $mech = Department::firstOrCreate(['name' => 'Mechanical Engineering']);

        foreach ([$cse, $mech] as $department) {
            JobApplication::factory()->submitted()->create([
                'advertisement_id' => $advertisement->id,
                'department_id' => $department->id,
            ]);
        }

        $admin = User::factory()->create(['role' => 'admin', 'department_id' => $cse->id]);
        $hod = User::factory()->create(['role' => 'hod', 'department_id' => $cse->id]);

        $aggregator = app(DashboardAggregator::class);

        $this->assertSame(2, $aggregator->forUser($admin)['stats']['totalApplications']);
        $this->assertSame(1, $aggregator->forUser($hod)['stats']['totalApplications']);

        $this->assertTrue(Cache::has('dashboard.admin.v2'));
        $this->assertTrue(Cache::has("dashboard.hod.{$cse->id}.v2"));
    }

    public function test_two_hods_get_their_own_entries(): void
    {
        $advertisement = Advertisement::factory()->create();
        $cse = Department::firstOrCreate(['name' => 'Computer Science']);
        $mech = Department::firstOrCreate(['name' => 'Mechanical Engineering']);

        JobApplication::factory()->submitted()->create([
            'advertisement_id' => $advertisement->id,
            'department_id' => $cse->id,
        ]);

        $cseHod = User::factory()->create(['role' => 'hod', 'department_id' => $cse->id]);
        $mechHod = User::factory()->create(['role' => 'hod', 'department_id' => $mech->id]);

        $aggregator = app(DashboardAggregator::class);

        $this->assertSame(1, $aggregator->forUser($cseHod)['stats']['totalApplications']);
        $this->assertSame(0, $aggregator->forUser($mechHod)['stats']['totalApplications']);

        $this->assertTrue(Cache::has("dashboard.hod.{$cse->id}.v2"));
        $this->assertTrue(Cache::has("dashboard.hod.{$mech->id}.v2"));
    }
}
