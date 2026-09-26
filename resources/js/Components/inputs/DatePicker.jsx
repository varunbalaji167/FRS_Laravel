import { Input } from "@/Components/ui/input";
import FormField from "@/Components/inputs/FormField";

// Native date input with min/max clamping. A calendar-popover widget is a
// nice-to-have (Phase 5 UX pass) — the min/max constraint is the part that
// matters for validation and it works the same either way.
export default function DatePicker({ id, label, value, onChange, error, required, min, max, disabled }) {
    return (
        <FormField label={label} htmlFor={id} error={error} required={required}>
            <Input
                id={id}
                type="date"
                value={value ?? ""}
                min={min}
                max={max}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />
        </FormField>
    );
}
