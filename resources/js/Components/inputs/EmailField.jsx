import { Input } from "@/Components/ui/input";
import FormField from "@/Components/inputs/FormField";

export default function EmailField({ id, label, value, onChange, error, required, placeholder, disabled, hint }) {
    return (
        <FormField label={label} htmlFor={id} error={error} required={required} hint={hint}>
            <Input
                id={id}
                type="email"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />
        </FormField>
    );
}
