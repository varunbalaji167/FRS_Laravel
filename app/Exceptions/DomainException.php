<?php

namespace App\Exceptions;

use App\Support\ErrorCode;
use RuntimeException;

/**
 * Thrown for any business-rule failure that should reach the client as the
 * JSON error contract. See docs/errors.md. Wired into Handler.php in Phase 3.
 *
 * The ErrorCode property is named `errorCode`, not `code` — PHP's built-in
 * \Exception already declares a non-readonly `$code` (int) property, and a
 * child class can't redeclare it as a readonly, differently-typed property.
 */
class DomainException extends RuntimeException
{
    public function __construct(
        public readonly ErrorCode $errorCode,
        public readonly array $details = [],
        ?string $message = null,
    ) {
        parent::__construct($message ?? $errorCode->userMessage());
    }
}
