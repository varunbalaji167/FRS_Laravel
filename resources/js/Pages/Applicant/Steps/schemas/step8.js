import { z } from "zod";

// Mirrors app/Http/Requests/Applicant/Rules/StepStatementsRules.php — keep
// the two in sync (see docs/validation.md).
export default function step8Schema() {
    return z.object({
        research_plan: z.string().trim().min(1, "Research contribution & future plans are required."),
        teaching_plan: z.string().trim().min(1, "Teaching contribution & future plans are required."),
        professional_service: z.string().optional(),
        other_info: z.string().optional(),
    });
}
