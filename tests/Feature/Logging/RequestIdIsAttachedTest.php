<?php

namespace Tests\Feature\Logging;

use Tests\TestCase;

/**
 * AttachRequestId must stamp every response, not just the ones that reach
 * the error contract.
 */
class RequestIdIsAttachedTest extends TestCase
{
    public function test_a_plain_successful_response_carries_a_request_id_header(): void
    {
        $response = $this->get('/');

        $requestId = $response->headers->get('X-Request-Id');

        $this->assertNotEmpty($requestId);
    }

    public function test_each_request_gets_a_distinct_request_id(): void
    {
        $first = $this->get('/')->headers->get('X-Request-Id');
        $second = $this->get('/')->headers->get('X-Request-Id');

        $this->assertNotSame($first, $second);
    }
}
