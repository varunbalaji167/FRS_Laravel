<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        // STOPS THE N+1 QUERY PROBLEM:
        // This will throw an exception locally if you forget to eager load,
        // but it will safely ignore it in production so users don't see errors.
        Model::preventLazyLoading(! app()->isProduction());
    }
}
