// TODO(Phase 5): label + control + inline error, aria-* wired per docs/validation.md.
export default function FormField({ label, error, htmlFor, children }) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            {children}
            {error && (
                <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
