import { Input } from "@/Components/ui/input";
import FormField from "@/Components/inputs/FormField";

// Native date input with min/max clamping; a calendar popover would be
// nicer, but the clamp is the part validation depends on.
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
