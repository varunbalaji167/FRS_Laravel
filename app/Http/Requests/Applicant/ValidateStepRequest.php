<?php

namespace App\Http\Requests\Applicant;

use App\Exceptions\DomainException;
use App\Http\Requests\Applicant\Rules\StepAdditionalInfoRules;
use App\Http\Requests\Applicant\Rules\StepAwardsProjectsRules;
use App\Http\Requests\Applicant\Rules\StepDetailedPubsRules;
use App\Http\Requests\Applicant\Rules\StepDocumentsRules;
use App\Http\Requests\Applicant\Rules\StepEducationRules;
use App\Http\Requests\Applicant\Rules\StepEmploymentRules;
use App\Http\Requests\Applicant\Rules\StepPersonalRules;
use App\Http\Requests\Applicant\Rules\StepPositionRules;
use App\Http\Requests\Applicant\Rules\StepRefereesRules;
use App\Http\Requests\Applicant\Rules\StepResearchRules;
use App\Http\Requests\Applicant\Rules\StepStatementsRules;
use App\Support\ErrorCode;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Step tier — strict, but only for the single step being transitioned away
 * from. Composes the same Rules/Step{Name}Rules class SubmitApplicationRequest
 * uses for that step, so step-transition and final-submit can't drift. See
 * docs/validation.md.
 */
class ValidateStepRequest extends FormRequest
{
    private const STEP_RULES = [
        1 => StepPositionRules::class,
        2 => StepPersonalRules::class,
        3 => StepEducationRules::class,
        4 => StepEmploymentRules::class,
        5 => StepResearchRules::class,
        6 => StepAdditionalInfoRules::class,
        7 => StepAwardsProjectsRules::class,
        8 => StepStatementsRules::class,
        9 => StepDetailedPubsRules::class,
        10 => StepRefereesRules::class,
        11 => StepDocumentsRules::class,
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $step = (int) $this->route('n');

        if (! array_key_exists($step, self::STEP_RULES)) {
            throw new DomainException(ErrorCode::NOT_FOUND);
        }

        return self::STEP_RULES[$step]::rules((int) date('Y'));
    }

    /**
     * Per C3, this endpoint's contract is { code: APP_STEP_INVALID,
     * details: { fields } } rather than Laravel's default { message, errors }
     * — see docs/errors.md.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new DomainException(ErrorCode::APP_STEP_INVALID, ['fields' => $validator->errors()->messages()]);
    }
}
