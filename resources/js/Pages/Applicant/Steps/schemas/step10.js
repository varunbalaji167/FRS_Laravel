import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const refereeShape = (mandatory) =>
    z.object({
        name: mandatory ? z.string().trim().min(1, "Name is required.") : z.string().optional(),
        position: mandatory ? z.string().trim().min(1, "Position is required.") : z.string().optional(),
        association: mandatory ? z.string().trim().min(1, "Association is required.") : z.string().optional(),
        institute: mandatory ? z.string().trim().min(1, "Institute is required.") : z.string().optional(),
        email: mandatory
            ? z.string().trim().min(1, "Email is required.").regex(EMAIL_REGEX, "Invalid email format.")
            : z
                  .string()
                  .optional()
                  .refine((v) => !v || EMAIL_REGEX.test(v), "Invalid email format."),
        contact_code: z.string().optional(),
        contact_number: mandatory
            ? z.string().refine((v) => (v ?? "").replace(/\D/g, "").length === 10, "Phone must be exactly 10 digits.")
            : z
                  .string()
                  .optional()
                  .refine((v) => !v || v.replace(/\D/g, "").length === 10, "Phone must be exactly 10 digits."),
    });

// Mirrors app/Http/Requests/Applicant/Rules/StepRefereesRules.php — keep the
// two in sync (see docs/validation.md). Duplicate-email check across
// referees lives here (not on the server) since it's a cross-field
// convenience check, not a security boundary.
export default function step10Schema() {
    return z.object({
        referees: z
            .array(z.any())
            .min(3, "You must provide at least 3 referees.")
            .superRefine((referees, ctx) => {
                referees.forEach((referee, i) => {
                    const shape = refereeShape(i < 3);
                    const result = shape.safeParse(referee);
                    if (!result.success) {
                        for (const issue of result.error.issues) {
                            ctx.addIssue({ ...issue, path: [i, ...issue.path] });
                        }
                    }
                });

                const emails = referees.map((r) => (r?.email ?? "").trim().toLowerCase()).filter(Boolean);
                const duplicates = emails.filter((e, i) => emails.indexOf(e) !== i);
                if (duplicates.length > 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Referees must have distinct email addresses.",
                        path: [],
                    });
                }
            }),
    });
}
