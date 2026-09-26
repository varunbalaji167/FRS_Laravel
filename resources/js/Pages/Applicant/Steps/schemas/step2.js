import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailField = (msg) =>
    z.string().trim().min(1, msg).regex(EMAIL_REGEX, "Invalid email format.");
const optionalEmail = z
    .string()
    .trim()
    .optional()
    .refine((v) => ! v || EMAIL_REGEX.test(v), "Invalid email format.");

// Mirrors app/Http/Requests/Applicant/Rules/StepPersonalRules.php — keep the
// two in sync (see docs/validation.md).
export default function step2Schema() {
    return z.object({
        first_name: z.string().trim().min(1, "First name is required."),
        middle_name: z.string().optional(),
        last_name: z.string().trim().min(1, "Last name is required."),
        fathers_name: z.string().optional(),
        dob: z.string().min(1, "Date of birth is required.").refine((v) => ! Number.isNaN(Date.parse(v)), "Invalid date of birth."),
        gender: z.string().min(1, "Gender is required."),
        marital_status: z.string().optional(),
        category: z.string().min(1, "Category is required."),
        nationality: z.string().min(1, "Nationality is required."),
        id_proof_type: z.string().optional(),
        id_proof_number: z.string().optional(),
        corr_address: z.string().optional(),
        corr_city: z.string().optional(),
        corr_state: z.string().optional(),
        corr_country: z.string().optional(),
        corr_pincode: z.string().optional(),
        perm_address: z.string().optional(),
        perm_city: z.string().optional(),
        perm_state: z.string().optional(),
        perm_country: z.string().optional(),
        perm_pincode: z.string().optional(),
        email: emailField("Email is required."),
        alt_email: optionalEmail,
        phone_code: z.string().optional(),
        phone: z.string().refine((v) => (v ?? "").replace(/\D/g, "").length === 10, "10-digit phone number required."),
        alt_phone_code: z.string().optional(),
        alt_phone: z.string().optional(),
    });
}
