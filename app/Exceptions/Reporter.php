<?php

namespace App\Exceptions;

use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Structured log emission for unhandled exceptions.
 */
class Reporter
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function report(Throwable $e, array $context = []): void
    {
        $payload = array_merge($context, [
            'exception' => get_class($e),
            'trace' => $e->getTraceAsString(),
        ]);

        Log::error($e->getMessage(), $payload);

        // Blank LOG_SLACK_WEBHOOK_URL ⇒ no external call at all — the
        // handler is only reached when a webhook is actually configured.
        if (config('logging.channels.slack.url')) {
            Log::channel('slack')->critical($e->getMessage(), $payload);
        }
    }
}
