<?php

namespace App\Exceptions;

use App\Support\ErrorCode;
use RuntimeException;

/**
 * Any business-rule failure that should reach the client as the error
 * contract. Named `errorCode` because \Exception already owns `$code`.
 */
class DomainException extends RuntimeException
{
    /**
     * @param  array<string, mixed>  $details
     */
    public function __construct(
        public readonly ErrorCode $errorCode,
        public readonly array $details = [],
        ?string $message = null,
    ) {
        parent::__construct($message ?? $errorCode->userMessage());
    }
}
