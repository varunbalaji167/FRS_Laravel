import { useState } from "react";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import FormField from "@/Components/inputs/FormField";
import { cn } from "@/lib/utils";

// Searchable dropdown backed by an in-app list (universities, cities,
// departments). Falls back to the typed value ("Other") with a mild warning
// when it doesn't match anything in `options`.
export default function ComboboxField({
    id,
    label,
    value,
    onChange,
    error,
    required,
    options = [],
    placeholder,
    disabled,
}) {
    const [query, setQuery] = useState("");

    const filtered = query === "" ? options : options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));

    const isOther = value && !options.includes(value);

    return (
        <FormField
            label={label}
            htmlFor={id}
            error={error}
            required={required}
            hint={isOther ? `"${value}" is not in our list — double check the spelling.` : undefined}
        >
            <Combobox value={value ?? ""} onChange={(v) => v !== null && onChange(v)} disabled={disabled}>
                <div className="relative">
                    <ComboboxInput
                        id={id}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        )}
                        displayValue={(v) => v ?? ""}
                        placeholder={placeholder}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                    />
                    <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
                        {filtered.map((opt) => (
                            <ComboboxOption
                                key={opt}
                                value={opt}
                                className="cursor-pointer px-3 py-2 text-sm data-[focus]:bg-accent"
                            >
                                {opt}
                            </ComboboxOption>
                        ))}
                        {query !== "" && !options.includes(query) && (
                            <ComboboxOption
                                value={query}
                                className="cursor-pointer border-t border-input px-3 py-2 text-sm italic text-gray-600 data-[focus]:bg-accent"
                            >
                                Use &quot;{query}&quot; (Other)
                            </ComboboxOption>
                        )}
                    </ComboboxOptions>
                </div>
            </Combobox>
        </FormField>
    );
}
