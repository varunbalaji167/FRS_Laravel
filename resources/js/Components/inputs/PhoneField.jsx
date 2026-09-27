import { Input } from "@/Components/ui/input";
import FormField from "@/Components/inputs/FormField";

// Country-code + national number, digits-only mask on both. `code`/`number`
// are plain strings; `onCodeChange`/`onChange` each receive the new string.
export default function PhoneField({ id, label, code, onCodeChange, value, onChange, error, required, disabled }) {
    const maskDigits = (raw, maxLength) => raw.replace(/\D/g, "").slice(0, maxLength);
    const maskCode = (raw) => raw.replace(/[^\d+]/g, "").slice(0, 5);

    return (
        <FormField label={label} htmlFor={id} error={error} required={required}>
            <div className="flex gap-2">
                <Input
                    id={`${id}-code`}
                    type="text"
                    inputMode="tel"
                    className="w-20"
                    value={code ?? "+91"}
                    onChange={(e) => onCodeChange?.(maskCode(e.target.value))}
                    disabled={disabled}
                    aria-label={`${label ?? "Phone"} country code`}
                />
                <Input
                    id={id}
                    type="tel"
                    inputMode="numeric"
                    value={value ?? ""}
                    onChange={(e) => onChange(maskDigits(e.target.value, 10))}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="flex-1"
                />
            </div>
        </FormField>
    );
}
