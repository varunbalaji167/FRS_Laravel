import { z } from "zod";

// Mirrors StepEducationRules.php — keep the two in sync. Only the PhD block
// is mandatory; PG/UG/School are lax arrays.
export default function step3Schema(currentYear = new Date().getFullYear()) {
    return z.object({
        phd: z
            .object({
                university: z.string().trim().min(1, "University is required."),
                department: z.string().trim().min(1, "Department is required."),
                supervisor: z.string().optional(),
                date_joining: z
                    .string()
                    .min(1, "Date of joining is required.")
                    .refine((v) => {
                        if (Number.isNaN(Date.parse(v))) return false;
                        const year = Number(v.slice(0, 4));
                        return year >= 1950 && year <= currentYear;
                    }, "Enter a valid date between 1950 and the current year."),
                date_defence: z.string().optional(),
                date_award: z.string().optional(),
                title: z.string().optional(),
            })
            .default({}),
        pg: z.array(z.any()).optional(),
        ug: z.array(z.any()).optional(),
        school: z.array(z.any()).optional(),
    });
}
