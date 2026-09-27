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
│  │  │  └─ ExportController.php          # exportPdf, exportExcel (delegates to DossierExporter, Phase 4)
│  │  ├─ Admin/              # admin-scoped
│  │  │  ├─ DashboardController.php       # aggregate counts (delegates to DashboardAggregator, Phase 8)
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
│  │  ├─ HandleInertiaRequests.php
│  │  └─ AttachRequestId.php              # generates a ULID request id, X-Request-Id header
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
│     ├─ Auth/RegisterRequest.php
│     └─ ProfileUpdateRequest.php
├─ Services/                 # concrete classes, no interfaces
│  ├─ Applications/
│  │  ├─ SubmissionService.php            # transaction, lock, state transition, queue dispatch (Phase 4)
│  │  ├─ DraftService.php                 # draft merge + guard against non-draft overwrite (Phase 4)
│  │  └─ DossierExporter.php              # PDF/Excel/CSV pipeline (Phase 4)
│  ├─ Files/
│  │  └─ DossierFileStore.php             # private-disk read/write + signed URL helpers
│  ├─ Reporting/
│  │  └─ DashboardAggregator.php          # aggregate counts, cached (Phase 8)
│  ├─ Referees/
│  │  └─ RefereeNotificationDispatcher.php # dedup + queue (Phase 4)
│  └─ Auditing/
│     └─ AdminActionRecorder.php          # writes admin_actions rows (Phase 6)
├─ Support/
│  └─ ErrorCode.php                       # backed string enum — canonical error codes
├─ Exceptions/
│  ├─ DomainException.php                 # carries ErrorCode, details, message
│  ├─ Handler.php                         # single render pipeline (wired into bootstrap/app.php in Phase 3)
│  └─ Reporter.php                        # structured log emission; also logs to the `slack`
│                                          # channel when LOG_SLACK_WEBHOOK_URL is set (Phase 6)
├─ Jobs/
│  └─ GenerateApplicationPdfJob.php       # queued PDF gen (Phase 4)
├─ Console/
│  └─ Commands/
│     └─ LogRetentionCommand.php          # prunes failed_jobs + rotated logs, scheduled
│                                          # nightly from routes/console.php (Phase 6)
├─ Models/                   # unchanged, plus AdminAction.php (Phase 6)
└─ Mail/                     # unchanged

resources/js/
├─ app.jsx                   # ErrorBoundary wraps <App> from Phase 3 onward
├─ Components/
│  ├─ ui/                    # Shadcn primitives (unchanged)
│  ├─ inputs/                # widget-first form controls (real implementations land in Phase 5)
│  │  ├─ FormField.jsx       # label + control + inline error, aria-* wired
│  │  ├─ TextField.jsx, NumberField.jsx, TextareaField.jsx, DatePicker.jsx, PhoneField.jsx,
│  │  │  EmailField.jsx, SelectField.jsx, RadioField.jsx, ComboboxField.jsx, TagsField.jsx,
│  │  │  YearField.jsx, PercentField.jsx, FileField.jsx, SignaturePadField.jsx
│  ├─ ConfirmDialog.jsx      # Phase 5: replaces window.confirm + toast-as-confirm
│  ├─ ErrorBoundary.jsx
│  ├─ ToastListener.jsx      # one summary toast per response (Phase 3)
│  └─ skeletons/
│     ├─ CardSkeleton.jsx
│     └─ TableRowSkeleton.jsx
├─ Layouts/                  # unchanged
├─ Pages/
│  ├─ Applicant/
│  │  ├─ ApplyForm.jsx
│  │  └─ Steps/
│  │     ├─ Step{1..11}*.jsx
│  │     └─ schemas/         # one zod schema per step (Phase 2)
│  ├─ Admin/, Hod/, Auth/, Profile/, Error.jsx
└─ lib/
   ├─ utils.js, dateUtils.js  # unchanged
   ├─ errors.js               # flattenServerErrors, formatErrorCode (Phase 3)
   ├─ fileValidation.js       # (Phase 2)
   ├─ useDebouncedAutosave.js # (Phase 5)
   └─ useSectionArray.js      # (Phase 5)

docs/
├─ architecture.md           # this file
├─ errors.md                 # the ErrorCode table + how to add a code
├─ validation.md             # the three-tier table + widget-first guide
├─ wizard-steps.md           # single canonical step list
├─ backups.md                # written in Phase 9
├─ FRS_Maintenance.pdf
└─ FRS_Testing_Document.pdf
```

## File-placement rules a contributor can follow without asking

1. **A new HTTP endpoint** → new controller method in the role-appropriate folder
   (`Applicant/`, `Admin/`, `Hod/`, `Public/`). Never mix roles in one controller.
2. **A controller method starts with input validation** → the rules live in a
   FormRequest under `app/Http/Requests/{role}/`. Naming: `{Verb}{Noun}Request`
   (e.g. `StoreAdvertisementRequest`). No inline `$request->validate()` in new code.
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

## Guiding principles

- **Small PRs, one topic each.**
- **Prevent bad input, don't reject it.** Widgets first, validation second.
- **Server is the security boundary.** Every client-side rule also lives on
  the server.
- **Three validation tiers** — see [docs/validation.md](validation.md).
- **No new abstractions unless duplication already exists.**
- **No REST/JSON API layer.** Inertia is the transport; the error contract is
  a stable `code` string (see [docs/errors.md](errors.md)).
