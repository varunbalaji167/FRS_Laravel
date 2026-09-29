<?php

namespace App\Http\Requests\Auth;

use App\Exceptions\DomainException;
use App\Support\ErrorCode;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Two portals, not three: an HOD signs in through the 'admin' portal
        // and is routed by their DB role (see AuthenticatedSessionController).
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'role' => ['required', 'string', 'in:admin,applicant'],
        ];
    }

    /**
     * @throws DomainException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw new DomainException(ErrorCode::AUTH_INVALID_CREDENTIALS);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * @throws DomainException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        // Not a field error, so it goes out as the AUTH_RATE_LIMITED contract
        // rather than a 422 hung off the email input.
        throw new DomainException(ErrorCode::AUTH_RATE_LIMITED, [
            'retry_after' => $seconds,
        ], trans('auth.throttle', ['seconds' => $seconds, 'minutes' => (int) ceil($seconds / 60)]));
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
