import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/Components/ui/input";
import FormField from "@/Components/inputs/FormField";

// Chip/tag input — Enter or comma commits the current text as a tag.
export default function TagsField({ id, label, value = [], onChange, error, required, placeholder, disabled }) {
    const [draft, setDraft] = useState("");

    const commit = () => {
        const tag = draft.trim();
        if (tag && ! value.includes(tag)) {
            onChange([...value, tag]);
        }
        setDraft("");
    };

    const remove = (tag) => onChange(value.filter((t) => t !== tag));

    return (
        <FormField label={label} htmlFor={id} error={error} required={required}>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-input p-2">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-sm"
                    >
                        {tag}
                        {! disabled && (
                            <button
                                type="button"
                                onClick={() => remove(tag)}
                                aria-label={`Remove ${tag}`}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </span>
                ))}
                <Input
                    id={id}
                    type="text"
                    value={draft}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            commit();
                        } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
                            remove(value[value.length - 1]);
                        }
                    }}
                    onBlur={commit}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="h-7 flex-1 border-none p-0 shadow-none focus-visible:ring-0"
                />
            </div>
        </FormField>
    );
}
