import NumberField from "@/Components/inputs/NumberField";

// Year — spinner constrained to [1950, currentYear], matching every
// year-bound field on the server (see docs/validation.md).
export default function YearField({ id, label, value, onChange, error, required, disabled }) {
    const currentYear = new Date().getFullYear();

    return (
        <NumberField
            id={id}
            label={label}
            value={value}
            onChange={onChange}
            error={error}
            required={required}
            disabled={disabled}
            min={1950}
            max={currentYear}
            step={1}
        />
    );
}
