<?php

namespace Tests\Unit\Exceptions;

use App\Exceptions\DomainException;
use App\Exceptions\Handler;
use App\Support\ErrorCode;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

/**
 * Handler::render() against fabricated requests, so every branch is reachable
 * — including ones with no matching real endpoint yet, like a throttle.
 */
class HandlerTest extends TestCase
{
    private function jsonRequest(): Request
    {
        $request = Request::create('/probe', 'POST');
        $request->headers->set('Accept', 'application/json');
        $request->headers->set('X-Requested-With', 'XMLHttpRequest');
        $request->attributes->set('request_id', '01TESTREQUESTID');

        return $request;
    }

    private function htmlRequest(): Request
    {
        $request = Request::create('/probe', 'POST');
        $request->attributes->set('request_id', '01TESTREQUESTID');

        return $request;
    }

    private function browserGetRequest(): Request
    {
        $request = Request::create('/probe', 'GET');
        $request->headers->set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        $request->attributes->set('request_id', '01TESTREQUESTID');

        return $request;
    }

    public function test_domain_exception_renders_the_contract_for_non_inertia_requests(): void
    {
        $response = (new Handler)->render($this->htmlRequest(), new DomainException(ErrorCode::APP_DRAFT_CONFLICT));

        $this->assertNotNull($response);
        $this->assertSame(409, $response->getStatusCode());
        $this->assertSame('APP_DRAFT_CONFLICT', $response->getData(true)['code']);
        $this->assertSame('01TESTREQUESTID', $response->getData(true)['request_id']);
        $this->assertSame('01TESTREQUESTID', $response->headers->get('X-Request-Id'));
    }

    /**
     * A raw JSON body is not a valid Inertia response, so an Inertia visit
     * gets a redirect-back with the message flashed instead.
     */
    public function test_domain_exception_redirects_back_with_a_flashed_error_for_inertia_requests(): void
    {
        $request = $this->htmlRequest();
        $request->headers->set('X-Inertia', 'true');
        $request->setLaravelSession(app('session.store'));

        $response = (new Handler)->render($request, new DomainException(ErrorCode::APP_DRAFT_CONFLICT));

        $this->assertInstanceOf(RedirectResponse::class, $response);
        $this->assertSame('This draft can no longer be edited.', $response->getSession()->get('error'));
    }

    /**
     * A plain browser GET into a role-guarded URL should land on the Inertia
     * Error page, not a raw JSON body.
     */
    public function test_domain_exception_renders_the_inertia_error_page_for_a_plain_browser_get(): void
    {
        $response = (new Handler)->render($this->browserGetRequest(), new DomainException(ErrorCode::FORBIDDEN));

        $this->assertNotNull($response);
        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('01TESTREQUESTID', $response->headers->get('X-Request-Id'));
        // Inertia embeds the component name and props in data-page, so this
        // proves the ErrorCode reached the props bag.
        $this->assertStringContainsString('FORBIDDEN', $response->getContent());
        $this->assertStringContainsString('Error', $response->getContent());
    }

    public function test_validation_exception_is_left_alone_for_non_json_requests(): void
    {
        $validator = validator([], ['name' => 'required']);
        $validator->fails();

        $response = (new Handler)->render($this->htmlRequest(), new ValidationException($validator));

        $this->assertNull($response);
    }

    public function test_validation_exception_is_left_alone_for_inertia_requests(): void
    {
        $validator = validator([], ['name' => 'required']);
        $validator->fails();

        $request = $this->jsonRequest();
        $request->headers->set('X-Inertia', 'true');

        $response = (new Handler)->render($request, new ValidationException($validator));

        $this->assertNull($response);
    }

    public function test_validation_exception_renders_the_contract_for_plain_json_requests(): void
    {
        $validator = validator([], ['name' => 'required']);
        $validator->fails();

        $response = (new Handler)->render($this->jsonRequest(), new ValidationException($validator));

        $this->assertNotNull($response);
        $data = $response->getData(true);
        $this->assertSame(422, $response->getStatusCode());
        $this->assertSame('VALIDATION_FAILED', $data['code']);
        $this->assertArrayHasKey('name', $data['details']['fields']);
    }

    public function test_authentication_exception_renders_for_json_requests(): void
    {
        $response = (new Handler)->render($this->jsonRequest(), new AuthenticationException);

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame('AUTH_INVALID_CREDENTIALS', $response->getData(true)['code']);
    }

    public function test_authorization_exception_renders_forbidden_for_json_requests(): void
    {
        $response = (new Handler)->render($this->jsonRequest(), new AuthorizationException);

        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('FORBIDDEN', $response->getData(true)['code']);
    }

    public function test_model_not_found_renders_not_found_for_json_requests(): void
    {
        $response = (new Handler)->render($this->jsonRequest(), new ModelNotFoundException);

        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('NOT_FOUND', $response->getData(true)['code']);
    }

    /**
     * Laravel converts ModelNotFoundException to this Symfony type before any
     * renderable callback runs.
     */
    public function test_the_converted_not_found_http_exception_also_renders_not_found(): void
    {
        $response = (new Handler)->render($this->jsonRequest(), new NotFoundHttpException);

        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('NOT_FOUND', $response->getData(true)['code']);
    }

    /**
     * Likewise for a status-less AuthorizationException.
     */
    public function test_the_converted_access_denied_http_exception_also_renders_forbidden(): void
    {
        $response = (new Handler)->render($this->jsonRequest(), new AccessDeniedHttpException);

        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('FORBIDDEN', $response->getData(true)['code']);
    }

    public function test_throttle_exception_renders_rate_limited_with_retry_after_header(): void
    {
        $exception = new ThrottleRequestsException('Too Many Attempts.', null, ['Retry-After' => '30']);

        $response = (new Handler)->render($this->jsonRequest(), $exception);

        $this->assertSame(429, $response->getStatusCode());
        $this->assertSame('RATE_LIMITED', $response->getData(true)['code']);
        $this->assertSame('30', $response->headers->get('Retry-After'));
    }

    public function test_generic_exception_is_left_alone_outside_production(): void
    {
        $response = (new Handler)->render($this->jsonRequest(), new RuntimeException('boom'));

        $this->assertNull($response);
    }

    public function test_generic_exception_renders_internal_error_in_production(): void
    {
        app()['env'] = 'production';

        try {
            $response = (new Handler)->render($this->jsonRequest(), new RuntimeException('boom'));

            $this->assertSame(500, $response->getStatusCode());
            $this->assertSame('INTERNAL_ERROR', $response->getData(true)['code']);
        } finally {
            app()['env'] = 'testing';
        }
    }
}
