import { describe, expect, it } from "vitest";
import step1Schema from "./step1";
import step2Schema from "./step2";
import step3Schema from "./step3";
import step4Schema from "./step4";
import step5Schema from "./step5";
import step6Schema from "./step6";
import step7Schema from "./step7";
import step8Schema from "./step8";
import step9Schema from "./step9";
import step10Schema from "./step10";
import step11Schema from "./step11";
import draftSchema from "./draft";

// One happy + one failing case per step, mirroring the server's
// Rules/Step{Name}Rules.php (see docs/validation.md) so client/server can't
// silently drift.

describe("step1Schema", () => {
    it("accepts a chosen department and grade", () => {
        expect(step1Schema().safeParse({ department: "Computer Science", grade: "Assistant Professor" }).success).toBe(
            true,
        );
    });

    it("rejects a missing department/grade", () => {
        expect(step1Schema().safeParse({ department: "", grade: "" }).success).toBe(false);
    });
});

describe("step2Schema", () => {
    const valid = {
        first_name: "Ada",
        last_name: "Lovelace",
        dob: "1990-01-01",
        gender: "Female",
        category: "UR",
        nationality: "Indian",
        email: "ada@example.com",
        phone: "9876543210",
    };

    it("accepts a fully valid personal-details slice", () => {
        expect(step2Schema().safeParse(valid).success).toBe(true);
    });

    it("rejects a malformed email and a short phone number", () => {
        const result = step2Schema().safeParse({ ...valid, email: "not-an-email", phone: "123" });
        expect(result.success).toBe(false);
    });
});

describe("step3Schema", () => {
    it("accepts a phd date_joining within [1950, currentYear]", () => {
        const result = step3Schema(2026).safeParse({
            phd: { university: "IIT Indore", department: "CSE", date_joining: "2015-01-01" },
        });
        expect(result.success).toBe(true);
    });

    it("rejects a phd date_joining before 1950", () => {
        const result = step3Schema(2026).safeParse({
            phd: { university: "IIT Indore", department: "CSE", date_joining: "1900-01-01" },
        });
        expect(result.success).toBe(false);
    });
});

describe("step4Schema", () => {
    const valid = {
        present: { position: "Lecturer", organization: "IIT Indore", date_joining: "2020-01-01" },
        has_three_years_exp: "Yes",
    };

    it("accepts a filled present-employment block", () => {
        expect(step4Schema().safeParse(valid).success).toBe(true);
    });

    it("rejects a missing has_three_years_exp answer", () => {
        expect(step4Schema().safeParse({ ...valid, has_three_years_exp: "" }).success).toBe(false);
    });
});

describe("step5Schema", () => {
    it("accepts a filled specialization block", () => {
        const result = step5Schema().safeParse({
            specialization: { area_of_specialization: "ML", current_area_of_research: "DL" },
        });
        expect(result.success).toBe(true);
    });

    it("rejects a blank current_area_of_research", () => {
        const result = step5Schema().safeParse({
            specialization: { area_of_specialization: "ML", current_area_of_research: "" },
        });
        expect(result.success).toBe(false);
    });
});

describe("step6Schema (no mandatory fields)", () => {
    it("accepts an empty slice", () => {
        expect(step6Schema().safeParse({}).success).toBe(true);
    });

    it("rejects a malformed google_scholar URL", () => {
        expect(step6Schema().safeParse({ google_scholar: "not-a-url" }).success).toBe(false);
    });
});

describe("step8Schema", () => {
    it("accepts both required statements", () => {
        expect(step8Schema().safeParse({ research_plan: "x", teaching_plan: "y" }).success).toBe(true);
    });

    it("rejects a missing teaching_plan", () => {
        expect(step8Schema().safeParse({ research_plan: "x", teaching_plan: "" }).success).toBe(false);
    });
});

describe("step10Schema", () => {
    const referee = (n) => ({
        name: `R${n}`,
        position: "Professor",
        association: "Advisor",
        institute: "IIT Indore",
        email: `r${n}@example.com`,
        contact_number: "9000000001",
    });

    it("accepts exactly 3 fully-filled, distinct referees", () => {
        const result = step10Schema().safeParse({ referees: [referee(1), referee(2), referee(3)] });
        expect(result.success).toBe(true);
    });

    it("rejects fewer than 3 referees", () => {
        expect(step10Schema().safeParse({ referees: [referee(1)] }).success).toBe(false);
    });

    it("rejects duplicate referee emails", () => {
        const dup = referee(1);
        const result = step10Schema().safeParse({ referees: [dup, dup, referee(3)] });
        expect(result.success).toBe(false);
    });
});

describe("step11Schema", () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });

    it("accepts declaration=true with all three required files", () => {
        const result = step11Schema().safeParse({
            declaration: true,
            documents: { phd_cert: file, ssc_cert: file, signature: file },
        });
        expect(result.success).toBe(true);
    });

    it("rejects a missing declaration", () => {
        const result = step11Schema().safeParse({
            declaration: false,
            documents: { phd_cert: file, ssc_cert: file, signature: file },
        });
        expect(result.success).toBe(false);
    });
});

describe("draftSchema (lax)", () => {
    it("accepts a completely empty payload", () => {
        expect(draftSchema().safeParse({}).success).toBe(true);
    });

    it("accepts partial, loosely-typed form_data", () => {
        expect(draftSchema().safeParse({ form_data: { anything: "goes" } }).success).toBe(true);
    });
});

describe("step7Schema / step9Schema (no mandatory fields)", () => {
    it("accept an empty slice", () => {
        expect(step7Schema().safeParse({}).success).toBe(true);
        expect(step9Schema().safeParse({}).success).toBe(true);
    });
});
