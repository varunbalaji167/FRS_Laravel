<?php

namespace App\Services\Reporting;

use App\Models\User;

/**
 * Aggregate counts for the Admin + HOD dashboards, cached per docs/architecture.md.
 * Empty stub — filled in Phase 8. Behaviour still lives inline in
 * Admin\DashboardController::dashboard until then.
 */
class DashboardAggregator
{
    public function __construct()
    {
        //
    }

    public function forUser(User $user): array
    {
        throw new \LogicException('Not implemented — filled in Phase 8.');
    }
}
