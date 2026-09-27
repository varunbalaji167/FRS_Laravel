<?php

use App\Exceptions\Handler;
use App\Http\Middleware\AttachRequestId;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust only the configured proxy/load-balancer (defaults to '*' until
        // TRUSTED_PROXIES is set to the CloudPanel LB CIDR — see .env.production.example).
        $middleware->trustProxies(at: env('TRUSTED_PROXIES', '*'));
        // 1. Reconnect Inertia! This tells Laravel to append the Inertia data
        // (including flash messages and errors) to every single web request.
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AttachRequestId::class,
        ]);

        // 2. Keep your custom role middleware alias intact
        $middleware->alias([
            'role' => CheckRole::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Single render pipeline — see docs/errors.md and Handler::render().
        $exceptions->render(fn (Throwable $e, Request $request) => (new Handler)->render($request, $e));

        // Any unhandled exception that reaches a 500 in production is shown
        // as an Inertia page (Pages/Error.jsx) instead of Laravel's default
        // error view, so it renders inside the SPA shell with the
        // request-id the user can quote to support.
        $exceptions->respond(function (SymfonyResponse $response, Throwable $e, Request $request) {
            if (app()->hasDebugModeEnabled() || $response->getStatusCode() !== 500) {
                return $response;
            }

            $requestId = $request->attributes->get('request_id');

            return Inertia::render('Error', ['status' => 500, 'requestId' => $requestId])
                ->toResponse($request)
                ->setStatusCode(500)
                ->header('X-Request-Id', $requestId);
        });
    })->create();
