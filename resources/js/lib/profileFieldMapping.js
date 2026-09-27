// The applicant master profile and the wizard's Step 2 used to offer
// different option sets for the same two fields (profile: gender "Other",
// category "General"; wizard: no "Other", category "UR" instead of
// "General"). A value the profile allowed but the wizard's Rule::in
// rejects passed the client-side schema (a non-empty string) yet failed the
// server's step-validate probe, with nothing on the screen to say why. These
// normalize a profile's legacy value to its nearest wizard-accepted one
// whenever it's pulled into the application (initial load and "Copy from
// Profile"). See docs/validation.md and StepPersonalRules.php.
const GENDER_MAP = { Other: "Prefer not to say" };
const CATEGORY_MAP = { General: "UR" };

export function normalizeProfileGender(value) {
    return GENDER_MAP[value] ?? value ?? "";
}

export function normalizeProfileCategory(value) {
    return CATEGORY_MAP[value] ?? value ?? "";
}
