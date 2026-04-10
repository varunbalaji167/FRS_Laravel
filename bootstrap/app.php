<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies (Cloudflare, Load Balancers, etc.)
        $middleware->trustProxies(at: '*');
        // 1. Reconnect Inertia! This tells Laravel to append the Inertia data
        // (including flash messages and errors) to every single web request.
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        // 2. Keep your custom role middleware alias intact
        $middleware->alias([
            'role' => CheckRole::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
