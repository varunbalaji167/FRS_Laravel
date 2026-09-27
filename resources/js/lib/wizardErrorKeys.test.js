import { describe, expect, it } from "vitest";
import { toLegacyErrorKey, flattenZodError, serverKeyToStepPath, remapServerErrorKeys } from "./wizardErrorKeys";

describe("toLegacyErrorKey", () => {
    it("passes an unmapped path through as a dotted key", () => {
        expect(toLegacyErrorKey(3, ["phd", "university"])).toBe("phd.university");
        expect(toLegacyErrorKey(2, ["gender"])).toBe("gender");
        expect(toLegacyErrorKey(1, ["department"])).toBe("department");
    });

    it("remaps the step 4 employment special case", () => {
        expect(toLegacyErrorKey(4, ["has_three_years_exp"])).toBe("emp.has_three_years_exp");
    });

    it("remaps the step 5 specialization special cases", () => {
        expect(toLegacyErrorKey(5, ["specialization", "area_of_specialization"])).toBe("spec.area");
        expect(toLegacyErrorKey(5, ["specialization", "current_area_of_research"])).toBe("spec.current");
    });

    it("remaps the step 8 statements special cases", () => {
        expect(toLegacyErrorKey(8, ["research_plan"])).toBe("statements.research_plan");
        expect(toLegacyErrorKey(8, ["teaching_plan"])).toBe("statements.teaching_plan");
    });

    it("remaps a step 10 referee field to its indexed widget key", () => {
        expect(toLegacyErrorKey(10, ["referees", 0, "name"])).toBe("referee_0_name");
        expect(toLegacyErrorKey(10, ["referees", 2, "contact_number"])).toBe("referee_2_contact");
    });

    it("strips the documents/best_papers container for step 11", () => {
        expect(toLegacyErrorKey(11, ["documents", "phd_cert"])).toBe("phd_cert");
        expect(toLegacyErrorKey(11, ["best_papers", "best_paper_1"])).toBe("best_paper_1");
    });
});

describe("flattenZodError", () => {
    it("flattens issues through toLegacyErrorKey and adds the referees summary message", () => {
        const zodError = {
            issues: [
                { path: ["referees", 0, "name"], message: "Required" },
                { path: ["referees", 1, "email"], message: "Invalid" },
            ],
        };

        const flat = flattenZodError(10, zodError);

        expect(flat.referee_0_name).toBe("Required");
        expect(flat.referee_1_email).toBe("Invalid");
        expect(flat.referees).toBe("Please fill all required fields for at least 3 referees.");
    });
});

describe("serverKeyToStepPath", () => {
    it("resolves step 1 top-level fields", () => {
        expect(serverKeyToStepPath("department")).toEqual({ step: 1, path: ["department"] });
        expect(serverKeyToStepPath("grade")).toEqual({ step: 1, path: ["grade"] });
    });

    it("resolves a nested form_data field to its container-relative path", () => {
        expect(serverKeyToStepPath("form_data.education.phd.university")).toEqual({
            step: 3,
            path: ["phd", "university"],
        });
    });

    it("converts numeric path segments to numbers so the referee suffix map matches", () => {
        expect(serverKeyToStepPath("form_data.referees_section.referees.0.name")).toEqual({
            step: 10,
            path: ["referees", 0, "name"],
        });
    });

    it("resolves the step 11 declaration, documents and best_papers fields", () => {
        expect(serverKeyToStepPath("form_data.declaration")).toEqual({ step: 11, path: ["declaration"] });
        expect(serverKeyToStepPath("documents.phd_cert")).toEqual({ step: 11, path: ["documents", "phd_cert"] });
        expect(serverKeyToStepPath("best_papers.best_paper_1")).toEqual({
            step: 11,
            path: ["best_papers", "best_paper_1"],
        });
    });

    it("returns null for an unrecognised key", () => {
        expect(serverKeyToStepPath("something_unexpected")).toBeNull();
    });
});

describe("remapServerErrorKeys", () => {
    it("resolves every field to the exact key each Step*.jsx component reads", () => {
        // A shape a real final-submit 422 across several steps would produce.
        const serverErrors = {
            "form_data.personal_details.gender": "The selected gender is invalid.",
            "form_data.education.phd.university": "The field is required.",
            "form_data.employment.has_three_years_exp": "The field is required.",
            "form_data.research.specialization.area_of_specialization": "The field is required.",
            "form_data.statements.research_plan": "The field is required.",
            "form_data.referees_section.referees.0.email": "Invalid email format.",
            "form_data.declaration": "You must accept the declaration.",
            "documents.phd_cert": "The document is required.",
        };

        expect(remapServerErrorKeys(serverErrors)).toEqual({
            gender: "The selected gender is invalid.",
            "phd.university": "The field is required.",
            "emp.has_three_years_exp": "The field is required.",
            "spec.area": "The field is required.",
            "statements.research_plan": "The field is required.",
            referee_0_email: "Invalid email format.",
            declaration: "You must accept the declaration.",
            phd_cert: "The document is required.",
        });
    });

    it("keeps an unrecognised key unchanged rather than dropping the message", () => {
        expect(remapServerErrorKeys({ something_unexpected: "Oops." })).toEqual({
            something_unexpected: "Oops.",
        });
    });
});
