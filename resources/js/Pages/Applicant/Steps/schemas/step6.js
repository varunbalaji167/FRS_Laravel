import { z } from "zod";

// Mirrors app/Http/Requests/Applicant/Rules/StepAdditionalInfoRules.php — no
// mandatory fields today (see docs/wizard-steps.md), so this is a lax
// pass-through kept for shape consistency with the other step schemas.
export default function step6Schema() {
    return z.object({
        patents: z.array(z.any()).optional(),
        books: z.array(z.any()).optional(),
        book_chapters: z.array(z.any()).optional(),
        google_scholar: z
            .string()
            .optional()
            .refine((v) => ! v || /^https?:\/\//.test(v), "Enter a valid URL."),
        societies: z.array(z.any()).optional(),
        training: z.array(z.any()).optional(),
    });
}
