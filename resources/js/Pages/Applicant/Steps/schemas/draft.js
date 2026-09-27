import { z } from "zod";

// Draft tier — types and sizes only, mirroring SaveDraftRequest.php.
// Used by useDebouncedAutosave before firing the autosave POST.
export default function draftSchema() {
    return z.object({
        department: z.string().optional(),
        grade: z.string().optional(),
        form_data: z.record(z.string(), z.any()).optional(),
    });
}
