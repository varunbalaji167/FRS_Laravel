import { z } from "zod";

// Mirrors app/Http/Requests/Applicant/Rules/StepResearchRules.php — keep the
// two in sync (see docs/validation.md).
export default function step5Schema() {
    return z.object({
        specialization: z
            .object({
                area_of_specialization: z.string().trim().min(1, "Area of Specialization is required."),
                current_area_of_research: z.string().trim().min(1, "Current Area of Research is required."),
            })
            .default({}),
        summary: z.record(z.string(), z.any()).optional(),
        publications: z.array(z.any()).max(10, "You can list at most 10 publications.").optional(),
    });
}
