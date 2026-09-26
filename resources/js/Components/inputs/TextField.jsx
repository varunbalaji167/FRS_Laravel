import { Input } from "@/Components/ui/input";
import FormField from "@/Components/inputs/FormField";

export default function TextField({
    id, label, value, onChange, error, required, placeholder, maxLength, disabled, hint, className,
}) {
    return (
        <FormField label={label} htmlFor={id} error={error} required={required} hint={hint}>
            <Input
                id={id}
                type="text"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={className}
            />
        </FormField>
    );
}
