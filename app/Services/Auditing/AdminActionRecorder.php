<?php

namespace App\Services\Auditing;

use App\Models\AdminAction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * One admin_actions row per sensitive admin/HOD action, shared by every
 * caller so the audit-row shape can't drift.
 */
class AdminActionRecorder
{
    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public function record(Request $request, string $action, Model $subject, ?array $before, ?array $after): void
    {
        AdminAction::create([
            'actor_id' => $request->user()->id,
            'action' => $action,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'before' => $before,
            'after' => $after,
            'at' => now(),
            'request_id' => $request->attributes->get('request_id'),
        ]);
    }
}
