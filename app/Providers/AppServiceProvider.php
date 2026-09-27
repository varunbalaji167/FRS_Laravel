<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (app()->environment('production') && config('app.debug')) {
            throw new RuntimeException('APP_DEBUG must be false in production.');
        }

        // Applied here, not in bootstrap/app.php: config is loaded by now, so
        // the value survives `config:cache` (see config/app.php).
        TrustProxies::at(config('app.trusted_proxies'));

        // One policy for register, reset and change alike; Laravel's stock
        // defaults() would let a reset downgrade to 8 plain characters.
        Password::defaults(function () {
            $rule = Password::min(10)->mixedCase()->numbers()->symbols();

            return $this->app->isProduction() ? $rule->uncompromised() : $rule;
        });

        Vite::prefetch(concurrency: 3);

        // Surfaces missing eager loads as an exception locally; ignored in
        // production so users never see one.
        Model::preventLazyLoading(! app()->isProduction());
    }
}
