import { z } from "zod";

// Mirrors app/Http/Requests/Applicant/Rules/StepEmploymentRules.php — keep
// the two in sync (see docs/validation.md).
export default function step4Schema() {
    return z.object({
        present: z.object({
            position: z.string().trim().min(1, "Position is required."),
            organization: z.string().trim().min(1, "Organization is required."),
            date_joining: z
                .string()
                .min(1, "Date of joining is required.")
                .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date."),
            date_leaving: z.string().optional(),
        }),
        has_three_years_exp: z.string().min(1, "Please select Yes or No."),
        history: z.array(z.any()).optional(),
        teaching: z.array(z.any()).optional(),
        research: z.array(z.any()).optional(),
        industrial: z.array(z.any()).optional(),
    });
}
