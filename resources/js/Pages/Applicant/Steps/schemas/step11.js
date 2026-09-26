import { z } from "zod";

const requiredFile = (msg) =>
    z.any().refine((v) => v instanceof File || (typeof v === "string" && v.length > 0), msg);
const optionalFile = z.any().optional();

// Mirrors app/Http/Requests/Applicant/Rules/StepDocumentsRules.php — keep the
// two in sync (see docs/validation.md). Validates the flat `documents`/
// `best_papers`/`declaration` slice ApplyForm.jsx actually sends (not nested
// under form_data, except declaration).
export default function step11Schema() {
    return z.object({
        declaration: z.literal(true, {
            errorMap: () => ({ message: "You must agree to the final declaration." }),
        }),
        documents: z.object({
            phd_cert: requiredFile("PhD Certificate is required."),
            ssc_cert: requiredFile("10th/SSC Certificate is required."),
            signature: requiredFile("Digital signature is required."),
            pg_cert: optionalFile,
            ug_cert: optionalFile,
            hsc_cert: optionalFile,
            payslip: optionalFile,
            noc: optionalFile,
            post_phd_exp: optionalFile,
            other_docs: optionalFile,
        }),
        best_papers: z.record(z.string(), optionalFile).optional(),
    });
}
