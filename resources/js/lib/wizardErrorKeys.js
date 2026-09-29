// Maps zod issue paths and server field names to the flat key each Step*.jsx
// component reads on its `localErrors` prop, so client and server failures on
// the same field always highlight the same widget.

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

// Server prefix → step, mirroring Rules/Step{Name}Rules.php field naming.
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

// Server errors use full rule paths (e.g. `form_data.education.phd.university`)
// but widgets look up container-relative keys (e.g. `phd.university`). Without
// this remap the mismatch is silent — the toast fires but no field highlights.
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
