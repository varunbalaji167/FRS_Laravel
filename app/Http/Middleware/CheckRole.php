<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $allowedRoles = explode('|', $role);

        if (! $request->user() || ! in_array($request->user()->role, $allowedRoles)) {
            abort(403, 'Unauthorized action. You do not have the correct permissions.');
        }

        return $next($request);
    }
}