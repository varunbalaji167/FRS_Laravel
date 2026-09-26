// TODO(Phase 5): closed-set dropdown (Shadcn Select) per docs/validation.md.
export default function SelectField({ options = [], ...props }) {
    return (
        <select {...props}>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
