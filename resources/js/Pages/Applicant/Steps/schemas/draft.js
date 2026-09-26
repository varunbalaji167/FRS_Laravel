import { z } from "zod";

// Draft tier — lax. Types and sizes only, no required checks; mirrors
// app/Http/Requests/Applicant/SaveDraftRequest.php. Used by
// useDebouncedAutosave (Phase 5) before firing the autosave POST.
export default function draftSchema() {
    return z.object({
        department: z.string().optional(),
        grade: z.string().optional(),
        form_data: z.record(z.string(), z.any()).optional(),
    });
}
