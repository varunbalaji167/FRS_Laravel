<?php

namespace App\Http\Middleware;

use App\Exceptions\DomainException;
use App\Support\ErrorCode;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Use the spread operator (...$roles) to accept multiple roles as an array.
     *
     * Guarded via DomainException so the FORBIDDEN failure flows through the
     * single render pipeline in Handler.php — an axios/JSON caller gets the
     * error contract, an Inertia visit gets the flash-and-back UX, and a
     * plain browser hit gets the Inertia Error page. `abort(403)` here
     * throws a plain HttpException that Handler's AccessDeniedHttpException
     * branch does not match, so it would bypass the contract entirely.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $roles, true)) {
            throw new DomainException(ErrorCode::FORBIDDEN);
        }

        return $next($request);
    }
}
