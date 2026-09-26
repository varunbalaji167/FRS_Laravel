import { z } from "zod";

// Mirrors app/Http/Requests/Applicant/Rules/StepDetailedPubsRules.php — no
// mandatory fields today (see docs/wizard-steps.md).
export default function step9Schema() {
    return z.object({
        journals: z.array(z.any()).optional(),
        conferences: z.array(z.any()).optional(),
    });
}
