// Maps both a client-side zod issue path and a server-side field name to the
// flat key each Step*.jsx component actually looks up on its `localErrors`
// prop. The two need separate entry points (a zod path is already an array;
// a server field name is a dotted string mirroring Rules/Step{Name}Rules.php)
// but both funnel through the same per-step remap table below, so a client
// and a server failure on the same field always land on the same widget.

// Some schema paths don't match the error keys the step components display
// against, so remap those to keep inline errors on the right widget.
export function toLegacyErrorKey(step, path) {
    const key = path.join(".");

    if (step === 4 && key === "has_three_years_exp") return "emp.has_three_years_exp";
    if (step === 5 && key === "specialization.area_of_specialization") return "spec.area";
    if (step === 5 && key === "specialization.current_area_of_research") return "spec.current";
    if (step === 8 && key === "research_plan") return "statements.research_plan";
    if (step === 8 && key === "teaching_plan") return "statements.teaching_plan";
    if (step === 10 && path[0] === "referees" && typeof path[1] === "number") {
        const suffix = {
            name: "name",
            position: "position",
            association: "association",
            institute: "institute",
            email: "email",
            contact_number: "contact",
        }[path[2]];
        if (suffix) return `referee_${path[1]}_${suffix}`;
    }
    if (step === 11 && (path[0] === "documents" || path[0] === "best_papers")) return path[1];

    return key;
}

export function flattenZodError(step, zodError) {
    const out = {};
    for (const issue of zodError.issues) {
        out[toLegacyErrorKey(step, issue.path)] = issue.message;
    }
    if (step === 10 && Object.keys(out).some((k) => k.startsWith("referee_")) && !out.referees) {
        out.referees = "Please fill all required fields for at least 3 referees.";
    }
    return out;
}

// Maps a server field name's own prefix to the step whose Rules class owns
// it, mirroring Rules/Step{Name}Rules.php's field naming exactly.
const SERVER_CONTAINER_TO_STEP = {
    "form_data.personal_details.": 2,
    "form_data.education.": 3,
    "form_data.employment.": 4,
    "form_data.research.": 5,
    "form_data.additional_info.": 6,
    "form_data.awards_projects.": 7,
    "form_data.statements.": 8,
    "form_data.detailed_pubs.": 9,
    "form_data.referees_section.": 10,
};

// The server (both the axios step-validate probe and a final-submit
// validation failure) keys a field error by its full rule path, e.g.
// "form_data.education.phd.university" — but every Step*.jsx component
// looks up its own container-relative key, e.g. "phd.university" (see
// toLegacyErrorKey above). Without this remap the mismatch is silent: the
// summary toast fires but no field is ever actually highlighted, which
// looks exactly like the form ignoring already-filled-in values.
export function serverKeyToStepPath(dottedKey) {
    if (dottedKey === "department" || dottedKey === "grade") return { step: 1, path: [dottedKey] };
    if (dottedKey === "form_data.declaration") return { step: 11, path: ["declaration"] };
    if (dottedKey.startsWith("documents.") || dottedKey.startsWith("best_papers.")) {
        return { step: 11, path: dottedKey.split(".") };
    }

    for (const [prefix, step] of Object.entries(SERVER_CONTAINER_TO_STEP)) {
        if (dottedKey.startsWith(prefix)) {
            const path = dottedKey
                .slice(prefix.length)
                .split(".")
                .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));

            return { step, path };
        }
    }

    return null;
}

export function remapServerErrorKeys(flatErrors) {
    const out = {};
    for (const [key, message] of Object.entries(flatErrors)) {
        const resolved = serverKeyToStepPath(key);
        out[resolved ? toLegacyErrorKey(resolved.step, resolved.path) : key] = message;
    }
    return out;
}
