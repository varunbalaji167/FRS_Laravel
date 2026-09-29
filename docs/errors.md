# Error framework

See [docs/architecture.md](architecture.md) for where these classes live.

## Pattern

**Server:**

```php
// app/Support/ErrorCode.php
enum ErrorCode: string {
    case VALIDATION_FAILED = 'VALIDATION_FAILED';
    // …
    public function httpStatus(): int { … }
    public function userMessage(): string { … }
}

// app/Exceptions/DomainException.php
// Property is `errorCode`, not `code` — \Exception already declares a
// non-readonly `$code` (int), which a child class can't redeclare.
class DomainException extends \RuntimeException {
    public function __construct(
        public readonly ErrorCode $errorCode,
        public readonly array $details = [],
        ?string $message = null,
    ) { … }
}
```

`Handler.php` renders exceptions to a single JSON shape:

```json
{ "code": "APP_AD_DEADLINE_PASSED", "message": "…", "details": {}, "request_id": "01H…" }
```

with the enum's `httpStatus()`. Registered from `bootstrap/app.php`'s
`withExceptions()`. Every controller `abort()`/inline error routes through
`throw new DomainException(...)`.

`DomainException` renders the contract for any non-Inertia caller — a curl
request, the axios-driven step-validate probe, a JSON test client — but **not**
for an Inertia visit (`X-Inertia` header present). A raw JSON body isn't a
valid Inertia response (no `X-Inertia` response header, no page payload), so
Inertia's client would treat it as "invalid" and show its own raw-JSON error
dialog instead of the app's UI. For an Inertia visit, `DomainException`
instead redirects back with the message flashed
(`redirect()->back()->with('error', $e->getMessage())`) — the same shape a
pre-Phase-3 `back()->with('error', ...)` controller already produced, so
`ToastListener` picks it up exactly as before. `saveDraft`'s
`APP_DRAFT_CONFLICT`, for example, reaches a plain `<form>`/curl POST as the
JSON contract and a real Inertia `router.post()` as a flashed toast.

Everything else (a generic `ValidationException`, `AuthenticationException`,
a converted `ModelNotFoundException`/`AuthorizationException`,
`ThrottleRequestsException`, or an uncaught exception in production) is
**left alone** for two kinds of requests, so Laravel's own Inertia-compatible
behaviour keeps working:

- an Inertia visit (`X-Inertia` header present) — Inertia's client populates
  `useForm()`'s `errors` from Laravel's default redirect-back/422-with-`errors`
  response, and would break if we rewrote that response into our contract;
- a request that doesn't `expectsJson()` (a classic `<form>` post, or a test
  client without JSON headers) — session-flashed validation errors keep
  working for the Admin/Auth forms that still use them.

Only a plain JSON caller gets the contract for these. `ValidateStepRequest`
is the one exception that gets its own code (`APP_STEP_INVALID`) regardless of
transport, via a `failedValidation()` override that throws `DomainException`
directly rather than going through the generic mapping — that route is only
ever called from axios, never from a real Inertia visit, so the DomainException
Inertia-redirect branch never applies to it in practice.

A production 500 is handled separately, in `bootstrap/app.php`'s
`$exceptions->respond()`: it swaps the response for an Inertia render of
`Pages/Error.jsx` (carrying `status` and `requestId`), so an unhandled
exception still shows inside the SPA shell instead of Laravel's default error
view.

**Client:**

```js
// resources/js/lib/errors.js
export function flattenServerErrors(errors) { /* handles both { fields } and dot-notation */ }
export function formatErrorCode(code, fallback) { /* code → friendly sentence */ }
```

- `ToastListener` fires **one** summary toast per response (a count of
  failing fields, not one toast per field).
- Every page mounts inside `<ErrorBoundary>` in `app.jsx`. Fallback shows the
  `request_id` when the boundary is given one.
- `resources/js/lib/inertiaErrorInterceptor.js` registers `router.on('invalid', …)`:
  419 ⇒ toast and a full reload, which re-issues the CSRF token; 429 ⇒ toast
  with `Retry-After`. 500 doesn't need a client branch — it's already a valid
  Inertia response by the time it reaches the browser (see above).

  A 419 is deliberately *not* replayed. The original request may be a
  non-idempotent POST, and the session it was signed against may have been
  invalidated by a logout elsewhere; a reload restores a consistent page and
  the wizard's own draft autosave means no typed input is lost.

## ErrorCode table

| Code | HTTP | When |
|---|---|---|
| `VALIDATION_FAILED` | 422 | Any FormRequest fails; `details.fields = { flatKey: [msgs] }` |
| `AUTH_INVALID_CREDENTIALS` | 401 | Login password mismatch |
| `AUTH_UNVERIFIED_EMAIL` | 403 | Unverified applicant on a wizard route (JSON callers; browsers still redirect to the notice page) |
| `AUTH_DOMAIN_NOT_ALLOWED` | 403 | Non-`iiti.ac.in` email for admin/hod |
| `AUTH_ROLE_MISMATCH` | 403 | DB role != requested portal role |
| `AUTH_RATE_LIMITED` | 429 | Login lockout after 5 failed attempts; carries `Retry-After` |
| `OAUTH_STATE_INVALID` | 400 | Socialite state mismatch |
| `OAUTH_ACCOUNT_LINK_REQUIRED` | 409 | Existing local account, no `google_id` |
| `OAUTH_HD_MISMATCH` | 403 | Google `hd` claim != `iiti.ac.in` for staff |
| `APP_ALREADY_SUBMITTED` | 409 | Second submit against a submitted row; the stored dossier is never overwritten |
| `APP_DRAFT_CONFLICT` | 409 | `saveDraft` on non-draft row |
| `APP_AD_DEADLINE_PASSED` | 422 | Submit against an ad past its deadline |
| `APP_STEP_INVALID` | 422 | Step rules failed |
| `FILE_MIME_REJECTED` | 422 | Validation failed and *every* failing rule was a file-type rule |
| `FILE_TOO_LARGE` | 413 | Request body over `post_max_size` (`PostTooLargeException`) |
| `FILE_KEY_NOT_ALLOWED` | 422 | Upload key not on whitelist |
| `HOD_DEPT_SCOPE_VIOLATION` | 403 | HOD accessed foreign dept |
| `ADMIN_SELF_DEMOTE_FORBIDDEN` | 403 | Admin tries to change own role |
| `USER_LAST_ADMIN` | 409 | Deleting/demoting last admin |
| `RATE_LIMITED` | 429 | Any other throttle |
| `NOT_FOUND` | 404 | Model not found or scope hides it |
| `FORBIDDEN` | 403 | Any other authorisation failure |
| `INTERNAL_ERROR` | 500 | Unhandled exception |

### OAuth codes are redirects, not JSON

The Google callback is always a browser `GET`, so a JSON body would be wrong
there. `OAUTH_STATE_INVALID`, `OAUTH_HD_MISMATCH`, `OAUTH_ACCOUNT_LINK_REQUIRED`
and `AUTH_DOMAIN_NOT_ALLOWED` reach the user as a redirect carrying
`ErrorCode::X->userMessage()` in the `error` flash, which `ToastListener`
renders. The enum is still the single source of the wording.

## How to add a new code

1. Add the `case` to `app/Support/ErrorCode.php`, plus its `httpStatus()` and
   `userMessage()` arms.
2. Add a row to the table above.
3. Add a Feature test that triggers it and asserts the JSON shape.
   `Feature\Errors\ErrorCodeCoverageTest` fails the build if a case has no
   test and no row in this table.
4. `throw new DomainException(ErrorCode::YOUR_CODE, $details)` from the
   controller/service — never `abort(422, 'string')`.
