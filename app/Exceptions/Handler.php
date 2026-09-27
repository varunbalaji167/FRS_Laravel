<?php

namespace App\Exceptions;

use App\Support\ErrorCode;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Single render pipeline for docs/errors.md. Inertia visits get a flashed
 * redirect instead — raw JSON is not a valid Inertia response.
 */
class Handler
{
    /** Validation rules whose failure means "wrong file type", not "bad field". */
    private const MIME_RULES = ['Mimes', 'Mimetypes', 'Image'];

    public function render(Request $request, Throwable $e): JsonResponse|RedirectResponse|Response|SymfonyResponse|null
    {
        if ($e instanceof DomainException) {
            return $this->renderDomainException($e, $request);
        }

        // Thrown by ValidatePostSize before any FormRequest runs, so it can
        // never surface as a field error.
        if ($e instanceof PostTooLargeException) {
            return $this->renderDomainException(new DomainException(ErrorCode::FILE_TOO_LARGE), $request);
        }

        if ($request->header('X-Inertia')) {
            return null;
        }

        if (! $request->expectsJson()) {
            return null;
        }

        if ($e instanceof ValidationException) {
            $code = $this->isPurelyMimeFailure($e) ? ErrorCode::FILE_MIME_REJECTED : ErrorCode::VALIDATION_FAILED;

            return $this->toJson($code, $e->getMessage(), ['fields' => $e->errors()], $request);
        }

        if ($e instanceof AuthenticationException) {
            return $this->toJson(ErrorCode::AUTH_INVALID_CREDENTIALS, $e->getMessage(), [], $request);
        }

        // Laravel converts these before any renderable callback sees them,
        // so both the original and converted forms are matched.
        if ($e instanceof AuthorizationException || $e instanceof AccessDeniedHttpException) {
            return $this->toJson(ErrorCode::FORBIDDEN, $e->getMessage() ?: ErrorCode::FORBIDDEN->userMessage(), [], $request);
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return $this->toJson(ErrorCode::NOT_FOUND, ErrorCode::NOT_FOUND->userMessage(), [], $request);
        }

        if ($e instanceof ThrottleRequestsException) {
            $response = $this->toJson(ErrorCode::RATE_LIMITED, $e->getMessage() ?: ErrorCode::RATE_LIMITED->userMessage(), [], $request);

            foreach ($e->getHeaders() as $name => $value) {
                $response->headers->set($name, $value);
            }

            return $response;
        }

        if (app()->environment('production')) {
            app(Reporter::class)->report($e, ['request_id' => $request->attributes->get('request_id')]);

            return $this->toJson(ErrorCode::INTERNAL_ERROR, ErrorCode::INTERNAL_ERROR->userMessage(), [], $request);
        }

        return null;
    }

    private function renderDomainException(DomainException $e, Request $request): JsonResponse|RedirectResponse|Response|SymfonyResponse
    {
        // Inertia visit → flash the message so ToastListener surfaces it and
        // the previous page re-renders in place.
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        // Browser navigation into a guarded route gets the Inertia Error
        // page; machine callers set Accept: application/json and fall below.
        if ($request->isMethod('GET') && $request->acceptsHtml() && ! $request->expectsJson()) {
            $status = $e->errorCode->httpStatus();
            $requestId = $request->attributes->get('request_id');

            $response = Inertia::render('Error', [
                'status' => $status,
                'code' => $e->errorCode->value,
                'message' => $e->getMessage(),
                'requestId' => $requestId,
            ])
                ->toResponse($request)
                ->setStatusCode($status);

            $response->headers->set('X-Request-Id', $requestId);

            return $response;
        }

        return $this->toJson($e->errorCode, $e->getMessage(), $e->details, $request);
    }

    /**
     * True when every failed rule is a file-type rule.
     */
    private function isPurelyMimeFailure(ValidationException $e): bool
    {
        $failures = collect($e->validator->failed())->flatMap(fn (array $rules) => array_keys($rules));

        return $failures->isNotEmpty() && $failures->every(fn (string $rule) => in_array($rule, self::MIME_RULES, true));
    }

    /**
     * @param  array<string, mixed>  $details
     */
    private function toJson(ErrorCode $code, string $message, array $details, Request $request): JsonResponse
    {
        $requestId = $request->attributes->get('request_id');

        $response = response()->json([
            'code' => $code->value,
            'message' => $message,
            'details' => $details,
            'request_id' => $requestId,
        ], $code->httpStatus())->header('X-Request-Id', $requestId);

        if (isset($details['retry_after'])) {
            $response->header('Retry-After', (string) $details['retry_after']);
        }

        return $response;
    }
}
