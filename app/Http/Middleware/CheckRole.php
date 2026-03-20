<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Use the spread operator (...$roles) to accept multiple roles as an array.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is logged in, and if their role exists in the allowed $roles array
        if (! $request->user() || ! in_array($request->user()->role, $roles)) {
            abort(403, 'Unauthorized action. You do not have the correct permissions.');
        }

        return $next($request);
    }
}