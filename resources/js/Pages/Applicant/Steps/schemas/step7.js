import { z } from "zod";

// Mirrors app/Http/Requests/Applicant/Rules/StepAwardsProjectsRules.php — no
// mandatory fields today (see docs/wizard-steps.md).
export default function step7Schema() {
    return z.object({
        awards: z.array(z.any()).optional(),
        phd_supervision: z.array(z.any()).optional(),
        pg_supervision: z.array(z.any()).optional(),
        ug_supervision: z.array(z.any()).optional(),
        sponsored_projects: z.array(z.any()).optional(),
        consultancy_projects: z.array(z.any()).optional(),
    });
}
