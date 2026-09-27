import { describe, expect, it } from "vitest";
import { normalizeProfileGender, normalizeProfileCategory } from "./profileFieldMapping";

describe("normalizeProfileGender", () => {
    it("maps the retired 'Other' option to the wizard's accepted value", () => {
        expect(normalizeProfileGender("Other")).toBe("Prefer not to say");
    });

    it("passes an already-canonical value through unchanged", () => {
        expect(normalizeProfileGender("Female")).toBe("Female");
    });

    it("returns an empty string for a missing value", () => {
        expect(normalizeProfileGender(undefined)).toBe("");
        expect(normalizeProfileGender(null)).toBe("");
    });
});

describe("normalizeProfileCategory", () => {
    it("maps the retired 'General' option to the wizard's accepted value", () => {
        expect(normalizeProfileCategory("General")).toBe("UR");
    });

    it("passes an already-canonical value through unchanged", () => {
        expect(normalizeProfileCategory("OBC")).toBe("OBC");
    });

    it("returns an empty string for a missing value", () => {
        expect(normalizeProfileCategory(undefined)).toBe("");
    });
});
