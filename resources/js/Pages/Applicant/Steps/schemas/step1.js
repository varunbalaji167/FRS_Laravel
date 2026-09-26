import { z } from "zod";

// Mirrors app/Http/Requests/Applicant/Rules/StepPositionRules.php — keep the
// two in sync (see docs/validation.md).
export default function step1Schema() {
    return z.object({
        department: z.string().min(1, "Department is required."),
        grade: z.string().min(1, "Grade is required."),
    });
}
