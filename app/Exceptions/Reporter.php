<?php

namespace App\Exceptions;

use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Structured log emission for unhandled/reported exceptions.
 * Wired into Handler.php's report pipeline in Phase 3.
 */
class Reporter
{
    public function report(Throwable $e, array $context = []): void
    {
        Log::error($e->getMessage(), array_merge($context, [
            'exception' => get_class($e),
            'trace' => $e->getTraceAsString(),
        ]));
    }
}
