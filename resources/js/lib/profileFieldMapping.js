// Normalises legacy profile values (`Other`, `General`) to the wizard's
// canonical option set. Applied on initial load and Copy-from-Profile.
const GENDER_MAP = { Other: "Prefer not to say" };
const CATEGORY_MAP = { General: "UR" };

export function normalizeProfileGender(value) {
    return GENDER_MAP[value] ?? value ?? "";
}

export function normalizeProfileCategory(value) {
    return CATEGORY_MAP[value] ?? value ?? "";
}
