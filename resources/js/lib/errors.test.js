import { describe, expect, it } from "vitest";
import { flattenServerErrors, formatErrorCode } from "./errors";

describe("flattenServerErrors", () => {
    it("flattens the Phase 3 DomainException contract (details.fields)", () => {
        const flat = flattenServerErrors({
            code: "APP_STEP_INVALID",
            details: { fields: { "form_data.personal_details.email": ["Invalid email format."] } },
        });

        expect(flat).toEqual({ "form_data.personal_details.email": "Invalid email format." });
    });

    it("flattens a plain Laravel ValidationException JSON body", () => {
        const flat = flattenServerErrors({
            message: "The given data was invalid.",
            errors: { department: ["Department is required."], grade: ["Grade is required."] },
        });

        expect(flat).toEqual({
            department: "Department is required.",
            grade: "Grade is required.",
        });
    });

    it("passes through an already-flat Inertia errors bag", () => {
        const flat = flattenServerErrors({ first_name: "First name is required." });

        expect(flat).toEqual({ first_name: "First name is required." });
    });

    it("returns an empty object for null/undefined input", () => {
        expect(flattenServerErrors(null)).toEqual({});
        expect(flattenServerErrors(undefined)).toEqual({});
    });

    it("surfaces a field-less DomainException's own message under _global, not its raw code", () => {
        const flat = flattenServerErrors({
            code: "RATE_LIMITED",
            message: "Too many attempts. Please try again later.",
            details: {},
            request_id: "abc-123",
        });

        expect(flat).toEqual({ _global: "Too many attempts. Please try again later." });
    });

    it("falls back to the friendly message when a field-less DomainException has no message", () => {
        const flat = flattenServerErrors({ code: "FORBIDDEN" });

        expect(flat).toEqual({ _global: "You are not authorised to perform this action." });
    });
});

describe("formatErrorCode", () => {
    it("returns the friendly message for a known code", () => {
        expect(formatErrorCode("APP_AD_DEADLINE_PASSED")).toBe("The deadline for this advertisement has passed.");
    });

    it("falls back for an unknown code", () => {
        expect(formatErrorCode("SOMETHING_NEW", "fallback message")).toBe("fallback message");
    });
});
