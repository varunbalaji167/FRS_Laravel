import { Input } from "@/Components/ui/input";
import FormField from "@/Components/inputs/FormField";

// Clamped number input — clamps on blur so a partially-typed value isn't
// fought while the applicant is still typing.
export default function NumberField({
    id, label, value, onChange, error, required, min, max, step = 1, placeholder, disabled, hint,
}) {
    const clamp = (raw) => {
        if (raw === "" || raw === null || raw === undefined) return "";
        let n = Number(raw);
        if (Number.isNaN(n)) return "";
        if (min !== undefined) n = Math.max(min, n);
        if (max !== undefined) n = Math.min(max, n);
        return n;
    };

    return (
        <FormField label={label} htmlFor={id} error={error} required={required} hint={hint}>
            <Input
                id={id}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                step={step}
                value={value ?? ""}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={(e) => onChange(clamp(e.target.value))}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />
        </FormField>
    );
}
