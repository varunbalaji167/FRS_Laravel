<?php

namespace Tests\Feature\Boot;

use App\Providers\AppServiceProvider;
use Illuminate\Http\Middleware\TrustProxies;
use ReflectionClass;
use Tests\TestCase;

/**
 * `config:cache` skips .env, so reading TRUSTED_PROXIES with env() at boot
 * would fall back to '*' and let any client spoof its IP.
 */
class TrustedProxiesSurviveConfigCacheTest extends TestCase
{
    public function test_the_proxy_list_comes_from_config_not_a_bootstrap_env_call(): void
    {
        $this->assertStringNotContainsString(
            "env('TRUSTED_PROXIES'",
            file_get_contents(base_path('bootstrap/app.php')),
        );

        $this->assertSame(config('app.trusted_proxies'), $this->configuredProxies());
    }

    public function test_the_configured_value_is_what_the_middleware_trusts(): void
    {
        config(['app.trusted_proxies' => '10.0.0.0/8']);
        (new AppServiceProvider($this->app))->boot();

        $this->assertSame('10.0.0.0/8', $this->configuredProxies());
    }

    private function configuredProxies(): mixed
    {
        $property = (new ReflectionClass(TrustProxies::class))->getProperty('alwaysTrustProxies');
        $property->setAccessible(true);

        return $property->getValue();
    }
}
