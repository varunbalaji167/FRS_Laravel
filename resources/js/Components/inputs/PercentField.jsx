import NumberField from "@/Components/inputs/NumberField";

// Percentage — clamped to [0, 100], 0.01 step to match the current
// education-step percentage fields.
export default function PercentField({ id, label, value, onChange, error, required, disabled }) {
    return (
        <NumberField
            id={id}
            label={label}
            value={value}
            onChange={onChange}
            error={error}
            required={required}
            disabled={disabled}
            min={0}
            max={100}
            step={0.01}
        />
    );
}
