<?php

namespace App\Services\Applications;

use App\Exceptions\DomainException;
use App\Http\Requests\Applicant\SaveDraftRequest;
use App\Models\Advertisement;
use App\Models\Department;
use App\Models\JobApplication;
use App\Support\ErrorCode;
use Illuminate\Support\Facades\DB;

/**
 * Draft merge + guard against overwriting a non-draft row. See
 * docs/architecture.md.
 */
class DraftService
{
    public function save(SaveDraftRequest $request, Advertisement $advertisement): JobApplication
    {
        $validated = $request->validated();
        $formData = $validated['form_data'] ?? [];
        $user = $request->user();

        if ($request->hasFile('form_data.personal_details.profile_image')) {
            $path = $request->file('form_data.personal_details.profile_image')
                ->store("applications/{$user->id}/{$advertisement->id}/photos", 'local');
            $formData['personal_details']['profile_image'] = $path;
        }

        $grade = $request->input('grade') ?? '';
        $departmentId = Department::idForName($request->input('department'));

        return DB::transaction(function () use ($user, $advertisement, $grade, $departmentId, $formData) {
            $existing = JobApplication::where('user_id', $user->id)
                ->where('advertisement_id', $advertisement->id)
                ->lockForUpdate()
                ->first();

            if ($existing && $existing->status !== 'draft') {
                throw new DomainException(ErrorCode::APP_DRAFT_CONFLICT);
            }

            return JobApplication::updateOrCreate(
                ['user_id' => $user->id, 'advertisement_id' => $advertisement->id],
                [
                    'department_id' => $departmentId,
                    'grade' => $grade,
                    'form_data' => $formData,
                    'status' => 'draft',
                ]
            );
        });
    }
}
