<?php

namespace App\Services\Auditing;

use App\Models\AdminAction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Writes one row to admin_actions per sensitive admin/HOD action. Shared by
 * Admin\UserController, Admin\DepartmentController and
 * Admin\ApplicationController@updateStatus so the audit-row shape can't
 * drift between them. See docs/architecture.md.
 */
class AdminActionRecorder
{
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
