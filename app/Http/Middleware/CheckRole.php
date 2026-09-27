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
     * Throws a DomainException, not abort(403): a plain HttpException does
     * not match Handler's branch and would bypass the error contract.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $roles, true)) {
            throw new DomainException(ErrorCode::FORBIDDEN);
        }

        return $next($request);
    }
}
