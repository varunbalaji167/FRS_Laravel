// TODO(Phase 5): clamped 0-100 numeric control per docs/validation.md.
export default function PercentField(props) {
    return <input type="number" min={0} max={100} {...props} />;
}
