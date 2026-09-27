import FormField from "@/Components/inputs/FormField";
import { cn } from "@/lib/utils";

// Small closed set rendered as a radiogroup instead of a dropdown.
export default function RadioField({ id, label, value, onChange, error, required, options = [], disabled }) {
    const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

    return (
        <FormField label={label} htmlFor={id} error={error} required={required}>
            <div role="radiogroup" aria-labelledby={label ? id : undefined} className="flex flex-wrap gap-4">
                {normalized.map((opt) => (
                    <label
                        key={opt.value}
                        className={cn("flex items-center gap-2 text-sm text-gray-700", disabled && "opacity-50")}
                    >
                        <input
                            type="radio"
                            name={id}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                            disabled={disabled}
                            aria-invalid={!!error}
                            className="h-4 w-4"
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
        </FormField>
    );
}
