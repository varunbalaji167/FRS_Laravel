<?php

namespace App\Exceptions;

use App\Support\ErrorCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Single render pipeline for the JSON error contract described in
 * docs/errors.md: { code, message, details, request_id }.
 *
 * Not yet wired into bootstrap/app.php's withExceptions() — Phase 3 registers
 * render(...) there and fills in the exception-type-to-ErrorCode mapping.
 */
class Handler
{
    public function render(Request $request, Throwable $e): ?JsonResponse
    {
        if ($e instanceof DomainException) {
            return $this->toJson($e->errorCode, $e->getMessage(), $e->details, $request);
        }

        return null;
    }

    private function toJson(ErrorCode $code, string $message, array $details, Request $request): JsonResponse
    {
        return response()->json([
            'code' => $code->value,
            'message' => $message,
            'details' => $details,
            'request_id' => $request->attributes->get('request_id'),
        ], $code->httpStatus());
    }
}
