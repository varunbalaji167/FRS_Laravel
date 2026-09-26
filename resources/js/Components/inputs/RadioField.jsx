// TODO(Phase 5): radio-group widget per docs/validation.md.
export default function RadioField({ options = [], name, ...props }) {
    return (
        <div role="radiogroup">
            {options.map((opt) => (
                <label key={opt.value}>
                    <input type="radio" name={name} value={opt.value} {...props} />
                    {opt.label}
                </label>
            ))}
        </div>
    );
}
