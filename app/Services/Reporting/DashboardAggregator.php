<?php

namespace App\Services\Reporting;

use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Aggregate counts for the Admin + HOD dashboards, cached per
 * docs/architecture.md. Admin sees one global cache entry; each HOD's
 * department gets its own entry so one department's activity doesn't
 * evict another's. See PLAN.md Phase 8.
 */
class DashboardAggregator
{
    private const TTL_SECONDS = 120;

    public function forUser(User $user): array
    {
        return Cache::remember($this->keyFor($user->department), self::TTL_SECONDS, fn () => $this->build($user));
    }

    /**
     * Bust the admin cache and, when given, one department's HOD cache.
     * Safe to call with null — callers that don't know which department
     * was affected still clear the admin-wide numbers.
     */
    public function forget(?string $department): void
    {
        Cache::forget($this->keyFor(null));

        if ($department !== null) {
            Cache::forget($this->keyFor($department));
        }
    }

    private function keyFor(?string $department): string
    {
        return $department === null ? 'dashboard.admin.v1' : 'dashboard.hod.'.$department.'.v1';
    }

    private function build(User $user): array
    {
        $applicationsQuery = JobApplication::query();

        if ($user->role === 'hod') {
            $applicationsQuery->where('department', $user->department);
        }

        $statusCounts = (clone $applicationsQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $byDepartment = (clone $applicationsQuery)
            ->select('department', DB::raw('count(*) as count'))
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->groupBy('department')
            ->orderByDesc('count')
            ->get();

        $byAdvertisement = (clone $applicationsQuery)
            ->select('advertisement_id', DB::raw('count(*) as count'))
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->with('advertisement:id,title,reference_number')
            ->groupBy('advertisement_id')
            ->orderByDesc('count')
            ->get();

        $overTime = (clone $applicationsQuery)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'stats' => [
                'totalAdvertisements' => Advertisement::count(),
                'activeAdvertisements' => Advertisement::where('is_active', true)->count(),
                'totalApplications' => (clone $applicationsQuery)->whereIn('status', ['submitted', 'shortlisted', 'rejected'])->count(),
                'submitted' => $statusCounts['submitted'] ?? 0,
                'shortlisted' => $statusCounts['shortlisted'] ?? 0,
                'rejected' => $statusCounts['rejected'] ?? 0,
                'drafts' => $statusCounts['draft'] ?? 0,
                'totalApplicants' => $user->role === 'admin' ? User::where('role', 'applicant')->count() : null,
            ],
            'byDepartment' => $byDepartment,
            'byAdvertisement' => $byAdvertisement,
            'overTime' => $overTime,
            'recentApplications' => (clone $applicationsQuery)->with(['user', 'advertisement'])
                ->whereIn('status', ['submitted', 'shortlisted', 'rejected'])
                ->latest()
                ->take(5)
                ->get(),
            'recentAdvertisements' => Advertisement::latest()->take(5)->get(),
        ];
    }
}
