# Architecture

The Faculty Recruitment System (Laravel 12 + Inertia + React). This document is the
canonical reference for where code lives and how to add to it. See also
[docs/errors.md](errors.md), [docs/validation.md](validation.md), and
[docs/wizard-steps.md](wizard-steps.md).

## Folder & file layout

```
app/
├─ Http/
│  ├─ Controllers/
│  │  ├─ Applicant/          # applicant-facing (wizard, dashboard, export)
│  │  │  ├─ WizardController.php          # showApplyForm, saveDraft, validateStep, submitApplication
│  │  │  ├─ DashboardController.php       # index, myApplications, show
│  │  │  └─ ExportController.php          # exportPdf, exportExcel (delegates to DossierExporter)
│  │  ├─ Admin/              # admin-scoped
│  │  │  ├─ DashboardController.php       # aggregate counts (delegates to DashboardAggregator)
│  │  │  ├─ AdvertisementController.php   # index, create, store (update/destroy/toggleActive land when needed)
│  │  │  ├─ ApplicationController.php     # index, show, updateStatus, exportPdf, exportExcel
│  │  │  ├─ UserController.php            # users, storeUser, updateRole, destroyUser
│  │  │  └─ DepartmentController.php      # storeDepartment, destroyDepartment
│  │  ├─ Hod/                # HOD-scoped — reuses Admin/ApplicationController + Admin/DashboardController
│  │  │                      # via the `hod.` route group in routes/web.php; no separate controller class
│  │  │                      # unless HOD behaviour genuinely diverges from Admin's.
│  │  ├─ Auth/                # unchanged Breeze/Socialite controllers
│  │  ├─ Public/
│  │  │  └─ WelcomeController.php         # public landing page
│  │  ├─ ProfileController.php
│  │  └─ FileAccessController.php         # signed/authorised download for the private disk
│  ├─ Middleware/
│  │  ├─ CheckRole.php
│  │  ├─ EnsureEmailIsVerified.php        # `verified` alias; AUTH_UNVERIFIED_EMAIL for JSON callers
│  │  ├─ HandleInertiaRequests.php
│  │  └─ AttachRequestId.php              # ULID request id, X-Request-Id header; prepended globally
│  └─ Requests/
│     ├─ Applicant/
│     │  ├─ SaveDraftRequest.php          # lax
│     │  ├─ ValidateStepRequest.php       # strict per step
│     │  ├─ SubmitApplicationRequest.php  # strict all steps
│     │  └─ Rules/
│     │     ├─ StepPositionRules.php      # one file per step, static rules(int $currentYear): array
│     │     ├─ StepPersonalRules.php
│     │     └─ … (11 files total, see docs/wizard-steps.md)
│     ├─ Admin/
│     │  ├─ Ads/{Store,Update}AdvertisementRequest.php
│     │  ├─ Users/{Store,UpdateRole,StoreDepartment}Request.php
│     │  └─ Applications/UpdateStatusRequest.php
│     ├─ Auth/{Register,ResetPassword,PasswordResetLink,UpdatePassword}Request.php
│     └─ ProfileUpdateRequest.php
├─ Services/                 # concrete classes, no interfaces
│  ├─ Applications/
│  │  ├─ SubmissionService.php            # transaction, lock, state transition, queue dispatch
│  │  ├─ DraftService.php                 # draft merge + guard against non-draft overwrite
│  │  └─ DossierExporter.php              # PDF/Excel/CSV pipeline
│  ├─ Files/
│  │  └─ DossierFileStore.php             # private-disk read/write + signed URL helpers
│  ├─ Reporting/
│  │  └─ DashboardAggregator.php          # aggregate counts, cached
│  ├─ Referees/
│  │  └─ RefereeNotificationDispatcher.php # dedup + queue
│  └─ Auditing/
│     └─ AdminActionRecorder.php          # writes admin_actions rows
├─ Support/
│  └─ ErrorCode.php                       # backed string enum — canonical error codes
├─ Exceptions/
│  ├─ DomainException.php                 # carries ErrorCode, details, message
│  ├─ Handler.php                         # single render pipeline (wired into bootstrap/app.php)
│  └─ Reporter.php                        # structured log emission; also logs to the `slack`
│                                          # channel when LOG_SLACK_WEBHOOK_URL is set
├─ Jobs/
│  └─ GenerateApplicationPdfJob.php       # queued PDF gen
├─ Console/
│  └─ Commands/
│     └─ LogRetentionCommand.php          # prunes failed_jobs + rotated logs, scheduled
│                                          # nightly from routes/console.php
├─ Models/                   # unchanged, plus AdminAction.php
└─ Mail/                     # unchanged

resources/js/
├─ app.jsx                   # ErrorBoundary wraps <App> at the root
├─ Components/
│  ├─ ui/                    # Shadcn primitives (unchanged)
│  ├─ inputs/                # widget-first form controls
│  │  ├─ FormField.jsx       # label + control + inline error, aria-* wired
│  │  ├─ TextField.jsx, NumberField.jsx, TextareaField.jsx, DatePicker.jsx, PhoneField.jsx,
│  │  │  EmailField.jsx, SelectField.jsx, RadioField.jsx, ComboboxField.jsx, TagsField.jsx,
│  │  │  YearField.jsx, PercentField.jsx, FileField.jsx, SignaturePadField.jsx
│  ├─ applications/
│  │  └─ ApplicationDossier.jsx  # the full dossier view, shared by applicant/HOD/admin
│  ├─ ConfirmDialog.jsx      replaces window.confirm + toast-as-confirm
│  ├─ ErrorBoundary.jsx
│  ├─ ToastListener.jsx      # one summary toast per response
│  └─ skeletons/
│     ├─ CardSkeleton.jsx
│     └─ TableRowSkeleton.jsx
├─ Layouts/                  # unchanged
├─ Pages/
│  ├─ Applicant/
│  │  ├─ ApplyForm.jsx
│  │  └─ Steps/
│  │     ├─ Step{1..11}*.jsx
│  │     └─ schemas/         # one zod schema per step
│  ├─ Admin/, Hod/, Auth/, Profile/, Error.jsx
└─ lib/
   ├─ utils.js, dateUtils.js  # unchanged
   ├─ errors.js               # flattenServerErrors, formatErrorCode
   ├─ fileValidation.js       #
   ├─ useDebouncedAutosave.js #
   └─ useSectionArray.js      #

docs/
├─ architecture.md           # this file
├─ errors.md                 # the ErrorCode table + how to add a code
├─ validation.md             # the three-tier table + widget-first guide
├─ wizard-steps.md           # single canonical step list
├─ backups.md                # backup and restore procedures
├─ FRS_Maintenance.pdf
└─ FRS_Testing_Document.pdf
```

## File-placement rules a contributor can follow without asking

1. **A new HTTP endpoint** → new controller method in the role-appropriate folder
   (`Applicant/`, `Admin/`, `Hod/`, `Public/`). Never mix roles in one controller.
2. **A controller method starts with input validation** → the rules live in a
   FormRequest under `app/Http/Requests/{role}/`. Naming: `{Verb}{Noun}Request`
   (e.g. `StoreAdvertisementRequest`). No inline `$request->validate()` —
   `Feature\Boot\ConventionsInPlaceTest` enforces this.
3. **Two controllers doing the same thing** → extract into
   `app/Services/{domain}/`. One concrete class per file. Constructor injection
   only. No repositories, no interfaces.
4. **A background operation** → `app/Jobs/{Verb}{Noun}Job.php` with
   `implements ShouldQueue` and `$tries`, `$backoff`, `$timeout`, `failed()` set.
5. **A new business-rule failure** → new `ErrorCode` enum case + throw
   `DomainException`. Never return `abort(422, 'string')` from a controller.
6. **A new form step** → new `Step{N}{Name}.jsx` + `Steps/schemas/step{N}.js` +
   a `Rules/Step{Name}Rules.php` on the server. Update `docs/wizard-steps.md`.
7. **A new form field** → pick a widget from `Components/inputs/`, don't roll a
   raw `<Input>`. If no widget fits, extend the widget set first.
8. **A new user-visible error path** → add the `ErrorCode` to `docs/errors.md`
   and add a Feature test that triggers it.
   `Feature\Errors\ErrorCodeCoverageTest` fails the build otherwise.
9. **The same page for two roles** → one component under
   `Components/{domain}/`, parameterised by layout and route, rendered by thin
   per-role pages. See `ApplicationDossier.jsx`.

## Configuration read at boot

`config:cache` skips `.env` loading, so anything read with `env()` outside a
`config/` file silently becomes its default on a deployed box. Two consequences
worth knowing:

- `TRUSTED_PROXIES` lives in `config/app.php` and is applied by
  `AppServiceProvider::boot()` via `TrustProxies::at()`, not in
  `bootstrap/app.php`. Reading it at bootstrap time would fall back to `'*'`
  under `config:cache` and let any client spoof its IP.
- The password policy is defined once in `AppServiceProvider::boot()` with
  `Password::defaults()`, so register, reset and change can't drift apart.

## Guiding principles

- **Small PRs, one topic each.**
- **Prevent bad input, don't reject it.** Widgets first, validation second.
- **Server is the security boundary.** Every client-side rule also lives on
  the server.
- **Three validation tiers** — see [docs/validation.md](validation.md).
- **No new abstractions unless duplication already exists.**
- **No REST/JSON API layer.** Inertia is the transport; the error contract is
  a stable `code` string (see [docs/errors.md](errors.md)).
