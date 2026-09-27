import FormField from "@/Components/inputs/FormField";
import { cn } from "@/lib/utils";

// Closed-set dropdown. `options` is an array of strings or {value,label}.
export default function SelectField({
    id,
    label,
    value,
    onChange,
    error,
    required,
    options = [],
    placeholder = "Select...",
    disabled,
}) {
    const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

    return (
        <FormField label={label} htmlFor={id} error={error} required={required}>
            <select
                id={id}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                )}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {normalized.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </FormField>
    );
}
