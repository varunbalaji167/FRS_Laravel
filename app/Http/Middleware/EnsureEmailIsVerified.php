<?php

namespace App\Http\Middleware;

use App\Exceptions\DomainException;
use App\Support\ErrorCode;
use Closure;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Replaces Laravel's `verified` middleware so an unverified applicant hits
     * the error contract (AUTH_UNVERIFIED_EMAIL) instead of a bare 403 body.
     */
    public function handle(Request $request, Closure $next, ?string $redirectToRoute = null): Response
    {
        $user = $request->user();

        if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
            // Browser/Inertia visits keep Laravel's redirect to the notice
            // page; only machine callers get the JSON contract.
            if ($request->expectsJson()) {
                throw new DomainException(ErrorCode::AUTH_UNVERIFIED_EMAIL);
            }

            return redirect()->guest(route($redirectToRoute ?: 'verification.notice'));
        }

        return $next($request);
    }
}
