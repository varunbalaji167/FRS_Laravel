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

with the enum's `httpStatus()`. This pipeline exists today (`app/Exceptions/Handler.php`,
`Reporter.php`) but is not yet wired into `bootstrap/app.php`'s `withExceptions()` —
that lands in Phase 3, at which point every controller `abort()`/inline error also
gets replaced with `throw new DomainException(...)`.

**Client:**

```js
// resources/js/lib/errors.js
export function flattenServerErrors(errors) { /* handles both { fields } and dot-notation */ }
export function formatErrorCode(code, fallback) { /* code → friendly sentence */ }
```

- `ToastListener` fires **one** summary toast per response.
- Every page mounts inside `<ErrorBoundary>` in `app.jsx` (Phase 3). Fallback
  shows the `request_id` from the `X-Request-Id` response header.
- 419 ⇒ refresh CSRF and retry once; 429 ⇒ show `Retry-After`; 500 ⇒
  `Pages/Error.jsx` with the reference id.

## ErrorCode table

| Code | HTTP | When |
|---|---|---|
| `VALIDATION_FAILED` | 422 | Any FormRequest fails; `details.fields = { flatKey: [msgs] }` |
| `AUTH_INVALID_CREDENTIALS` | 401 | Login password mismatch |
| `AUTH_UNVERIFIED_EMAIL` | 403 | Applicant not verified |
| `AUTH_DOMAIN_NOT_ALLOWED` | 403 | Non-`iiti.ac.in` email for admin/hod |
| `AUTH_ROLE_MISMATCH` | 403 | DB role != requested portal role |
| `AUTH_RATE_LIMITED` | 429 | Login throttle exceeded |
| `OAUTH_STATE_INVALID` | 400 | Socialite state mismatch |
| `OAUTH_ACCOUNT_LINK_REQUIRED` | 409 | Existing local account, no `google_id` |
| `OAUTH_HD_MISMATCH` | 403 | Google `hd` claim != `iiti.ac.in` for staff |
| `APP_ALREADY_SUBMITTED` | 409 | Second submit against submitted row |
| `APP_DRAFT_CONFLICT` | 409 | `saveDraft` on non-draft row |
| `APP_AD_DEADLINE_PASSED` | 422 | Submit after deadline |
| `APP_AD_INACTIVE` | 422 | Submit against inactive ad |
| `APP_STEP_INVALID` | 422 | Step rules failed |
| `FILE_MIME_REJECTED` | 422 | Upload wrong MIME |
| `FILE_TOO_LARGE` | 413 | Upload > cap |
| `FILE_KEY_NOT_ALLOWED` | 422 | Upload key not on whitelist |
| `HOD_DEPT_SCOPE_VIOLATION` | 403 | HOD accessed foreign dept |
| `ADMIN_SELF_DEMOTE_FORBIDDEN` | 403 | Admin tries to change own role |
| `USER_LAST_ADMIN` | 409 | Deleting/demoting last admin |
| `RATE_LIMITED` | 429 | Any other throttle |
| `NOT_FOUND` | 404 | Model not found or scope hides it |
| `FORBIDDEN` | 403 | Any other authorisation failure |
| `INTERNAL_ERROR` | 500 | Unhandled exception |

## How to add a new code

1. Add the `case` to `app/Support/ErrorCode.php`, plus its `httpStatus()` and
   `userMessage()` arms.
2. Add a row to the table above.
3. Add a Feature test that triggers it and asserts the JSON shape.
4. `throw new DomainException(ErrorCode::YOUR_CODE, $details)` from the
   controller/service — never `abort(422, 'string')`.
