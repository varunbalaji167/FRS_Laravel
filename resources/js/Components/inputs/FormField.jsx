import { Label } from "@/Components/ui/label";

// Layout wrapper every widget in this folder renders through: label + control
// + inline error, aria-* wired so the control just needs `aria-describedby`.
export default function FormField({ label, error, htmlFor, required, children, hint }) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <Label htmlFor={htmlFor} className="text-gray-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-600">*</span>}
                </Label>
            )}
            {children}
            {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
            {error && (
                <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
