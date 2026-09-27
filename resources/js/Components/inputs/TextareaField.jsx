import FormField from "@/Components/inputs/FormField";
import { cn } from "@/lib/utils";

// Free text is a last resort per docs/validation.md — every textarea carries
// a live character counter so the applicant sees a limit before hitting it.
export default function TextareaField({
    id,
    label,
    value,
    onChange,
    error,
    required,
    placeholder,
    maxLength,
    rows = 4,
    disabled,
}) {
    const length = (value ?? "").length;

    return (
        <FormField
            label={label}
            htmlFor={id}
            error={error}
            required={required}
            hint={maxLength ? `${length}/${maxLength}` : undefined}
        >
            <textarea
                id={id}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(
                    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                )}
            />
        </FormField>
    );
}
