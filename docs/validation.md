# Validation conventions

See [docs/architecture.md](architecture.md) for where these classes live and
[docs/wizard-steps.md](wizard-steps.md) for the step list.

Three tiers; both client (zod) and server (FormRequest) enforce each. This is
the invariant every later phase composes from — do not add a fourth tier or a
one-off validation path.

| Tier | Endpoint | Server FormRequest | Client schema | What runs |
|---|---|---|---|---|
| **Draft (lax)** | `POST /apply/{ad}/draft` | `SaveDraftRequest` | `Steps/schemas/draft.js` | Types + sizes only. No required checks. Files: MIME + size. Strip `form_data.uploaded_documents` from input. |
| **Step (strict, per-step)** | `POST /apply/{ad}/step/{n}/validate` | `ValidateStepRequest` composing `Rules/Step{Name}Rules.php` | `Steps/schemas/step{n}.js` | Full rules for step `n`. Called from the wizard's Next button. Returns `{ ok: true }` or `422 { code:'APP_STEP_INVALID', details:{ fields:{…} } }`. |
| **Submit (strict, all)** | `POST /apply/{ad}/submit` | `SubmitApplicationRequest` composing all 11 `Rules/*` | Steps composed on client before dispatch | Full nested `form_data`. `authorize()` enforces `is_active` (computed from `deadline` — see `Advertisement::isActive()`), and refuses re-submit. |

Rule composition is the invariant: both `ValidateStepRequest` and
`SubmitApplicationRequest` compose from the same `Rules/Step{Name}Rules.php`
files, so step-transition and final-submit can't drift.

## Widget-first client philosophy

- Enumerated values (gender, category, marital status, nationality, referee
  association type, ID-proof type, degree, grade) → `SelectField` or
  `RadioField`.
- Dates → `DatePicker` with `min`/`max`.
- Phone → `PhoneField` (country-code select + national number, digits-only
  mask).
- Institutions / cities / departments → `ComboboxField` backed by an in-app
  list; fallback "Other" with a mild warning.
- Numbers → `NumberField` with clamp; years → `YearField` (spinner in
  `[1950, currentYear]`).
- Files → `FileField` with mime+size accept, progress, remove.
- Free text is a last resort; every textarea has a character counter.

Result: users see almost no "invalid format" errors because widgets prevent
the shape from being wrong in the first place.

The profile's Personal fieldset uses the same widgets and value sets as the
wizard's Step 2; the Professional fieldset is orthogonal.

## Picking a widget for a new field

1. Is the set of valid values closed and small? → `SelectField` /
   `RadioField`.
2. Is it a date? → `DatePicker`.
3. Is it a phone number? → `PhoneField`.
4. Is it drawn from a large-but-known list (university, city, department)? →
   `ComboboxField`.
5. Is it a bounded number (percentage, year, count)? → `PercentField` /
   `YearField` / `NumberField`.
6. Is it a file? → `FileField` (or `SignaturePadField` for the signature).
7. Otherwise → `TextField` or `TextareaField`, as a last resort.

If none of the above fit, extend `Components/inputs/` first — don't roll a
raw `<input>` in a step component.
