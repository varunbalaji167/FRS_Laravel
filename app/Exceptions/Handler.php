<?php

namespace App\Exceptions;

use App\Support\ErrorCode;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
 * Single render pipeline for the JSON error contract described in
 * docs/errors.md: { code, message, details, request_id }.
 *
 * Registered from bootstrap/app.php's withExceptions().
 *
 * Inertia visits (X-Inertia header present) are left alone by every branch
 * below, including DomainException — a raw JSON body isn't a valid Inertia
 * response (no X-Inertia response header, no page payload), so Inertia's
 * client would treat it as "invalid" and show its own raw-JSON error dialog
 * instead of the app's UI. Inertia visits get a redirect-back with the
 * message flashed instead, which is what `useForm()`/`ToastListener` already
 * know how to show. Plain requests that don't expect JSON (a classic <form>
 * post, or a test client without JSON headers) are left alone too, so
 * session-flashed validation errors keep working. Everything else — the
 * axios-driven step-validate probe, curl, any future JSON consumer — gets
 * the stable contract.
 */
class Handler
{
    public function render(Request $request, Throwable $e): JsonResponse|RedirectResponse|Response|SymfonyResponse|null
    {
        if ($e instanceof DomainException) {
            return $this->renderDomainException($e, $request);
        }

        if ($request->header('X-Inertia')) {
            return null;
        }

        if (! $request->expectsJson()) {
            return null;
        }

        if ($e instanceof ValidationException) {
            return $this->toJson(
                ErrorCode::VALIDATION_FAILED,
                $e->getMessage(),
                ['fields' => $e->errors()],
                $request,
            );
        }

        if ($e instanceof AuthenticationException) {
            return $this->toJson(ErrorCode::AUTH_INVALID_CREDENTIALS, $e->getMessage(), [], $request);
        }

        // Laravel's own Handler::prepareException() converts
        // ModelNotFoundException → NotFoundHttpException and a status-less
        // AuthorizationException → AccessDeniedHttpException before any
        // renderable callback (including this one) ever sees it — so both
        // the original and converted forms are checked here.
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
        // Inertia visit → flash the message so ToastListener can surface it
        // and the previous page re-renders in place.
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        // Real browser navigation (typed URL hitting a role-guarded route,
        // link-click into an unauthorised page) → render the Inertia Error
        // page so the user isn't dumped onto a raw JSON body. GET + HTML
        // Accept + not asking for JSON is the least ambiguous signal; any
        // machine consumer (axios, curl, tests using ->postJson etc.) sets
        // Accept: application/json and stays on the JSON contract below.
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

        // Everything else → the stable error contract from docs/errors.md.
        return $this->toJson($e->errorCode, $e->getMessage(), $e->details, $request);
    }

    private function toJson(ErrorCode $code, string $message, array $details, Request $request): JsonResponse
    {
        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'code' => $code->value,
            'message' => $message,
            'details' => $details,
            'request_id' => $requestId,
        ], $code->httpStatus())->header('X-Request-Id', $requestId);
    }
}
