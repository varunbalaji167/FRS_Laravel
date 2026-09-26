// TODO(Phase 5): spinner constrained to [1950, currentYear].
export default function YearField(props) {
    return <input type="number" min={1950} max={new Date().getFullYear()} {...props} />;
}
