// Client counterpart of docs/errors.md. `flattenServerErrors` normalises
// every shape the backend can currently send into one flat
// { flatKey: message } object so a step component can look a field's error
// up by its own dot-notation key without caring which tier produced it:
//   - the Phase 3 DomainException contract: { code, details: { fields } }
//   - a plain Laravel ValidationException JSON body: { message, errors }
//   - Inertia's page.props.errors bag: { field: "message" | ["message"] }
export function flattenServerErrors(errors) {
    if (! errors || typeof errors !== "object") return {};

    const bag = errors.details?.fields ?? errors.errors ?? errors;
    const flat = {};

    for (const [key, value] of Object.entries(bag)) {
        if (Array.isArray(value)) {
            flat[key] = value[0];
        } else if (typeof value === "string") {
            flat[key] = value;
        }
    }

    return flat;
}

const FRIENDLY_MESSAGES = {
    VALIDATION_FAILED: "Please fix the highlighted fields and try again.",
    AUTH_INVALID_CREDENTIALS: "Incorrect email or password.",
    AUTH_UNVERIFIED_EMAIL: "Please verify your email address to continue.",
    AUTH_DOMAIN_NOT_ALLOWED: "This portal requires an iiti.ac.in email address.",
    AUTH_ROLE_MISMATCH: "Your account role does not match this portal.",
    AUTH_RATE_LIMITED: "Too many attempts. Please try again later.",
    RATE_LIMITED: "Too many attempts. Please try again later.",
    OAUTH_STATE_INVALID: "Your sign-in session expired. Please try again.",
    OAUTH_ACCOUNT_LINK_REQUIRED: "An account with this email already exists. Please link it first.",
    OAUTH_HD_MISMATCH: "Please sign in with your iiti.ac.in Google account.",
    APP_ALREADY_SUBMITTED: "This application has already been submitted.",
    APP_DRAFT_CONFLICT: "This draft can no longer be edited.",
    APP_AD_DEADLINE_PASSED: "The deadline for this advertisement has passed.",
    APP_AD_INACTIVE: "This advertisement is no longer accepting applications.",
    APP_STEP_INVALID: "Please fix the highlighted fields on this step.",
    FILE_MIME_REJECTED: "That file type is not accepted.",
    FILE_TOO_LARGE: "That file is too large.",
    FILE_KEY_NOT_ALLOWED: "That upload slot is not recognised.",
    HOD_DEPT_SCOPE_VIOLATION: "You do not have access to this department.",
    ADMIN_SELF_DEMOTE_FORBIDDEN: "You cannot change your own admin role.",
    USER_LAST_ADMIN: "At least one admin account must remain.",
    NOT_FOUND: "The requested resource was not found.",
    FORBIDDEN: "You are not authorised to perform this action.",
    INTERNAL_ERROR: "Something went wrong. Please try again.",
};

export function formatErrorCode(code, fallback = "Something went wrong. Please try again.") {
    return FRIENDLY_MESSAGES[code] ?? fallback;
}
