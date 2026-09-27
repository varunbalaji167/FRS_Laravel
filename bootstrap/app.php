<?php

use App\Exceptions\Handler;
use App\Http\Middleware\AttachRequestId;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EnsureEmailIsVerified;
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
        // Global, and first: a 419/429/413 thrown by an earlier middleware
        // must still carry a request id the user can quote to support.
        $middleware->prepend(AttachRequestId::class);

        // Appends Inertia's shared props (flash messages, errors) to every
        // web response.
        $middleware->web(append: [HandleInertiaRequests::class]);

        $middleware->alias([
            'role' => CheckRole::class,
            'verified' => EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Single render pipeline — see docs/errors.md and Handler::render().
        $exceptions->render(fn (Throwable $e, Request $request) => (new Handler)->render($request, $e));

        // A production 500 renders Pages/Error.jsx inside the SPA shell,
        // carrying the request-id the user can quote to support.
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
