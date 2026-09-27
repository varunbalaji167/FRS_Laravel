import { useRef, useState } from "react";
import { UploadCloud, X, FileText } from "lucide-react";
import FormField from "@/Components/inputs/FormField";
import { validateFile, formatBytes } from "@/lib/fileValidation";
import { cn } from "@/lib/utils";

// Drag+drop file picker with mime/size accept, an optional upload-progress
// bar (0-100, driven by the caller's Inertia `onProgress`), and a remove
// button.
export default function FileField({
    id,
    label,
    value,
    onChange,
    error,
    required,
    accept,
    maxSizeBytes,
    progress,
    disabled,
}) {
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState(null);
    const inputRef = useRef(null);

    const effectiveError = error ?? localError;
    const fileName = value instanceof File ? value.name : typeof value === "string" ? value.split("/").pop() : null;

    const accept1 = (file) => {
        const msg = validateFile(file, { accept, maxSizeBytes });
        if (msg) {
            setLocalError(msg);
            return;
        }
        setLocalError(null);
        onChange(file);
    };

    return (
        <FormField
            label={label}
            htmlFor={id}
            error={effectiveError}
            required={required}
            hint={maxSizeBytes ? `Max ${formatBytes(maxSizeBytes)}${accept ? ` · ${accept}` : ""}` : accept}
        >
            {fileName ? (
                <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="flex-1 truncate">{fileName}</span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange(null);
                                setLocalError(null);
                                if (inputRef.current) inputRef.current.value = "";
                            }}
                            aria-label="Remove file"
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ) : (
                <label
                    htmlFor={id}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (!disabled) accept1(e.dataTransfer.files?.[0]);
                    }}
                    className={cn(
                        "flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 border-dashed border-input px-3 py-4 text-sm text-gray-500 hover:border-gray-400",
                        dragOver && "border-primary bg-accent",
                        disabled && "cursor-not-allowed opacity-50",
                    )}
                >
                    <UploadCloud className="h-5 w-5" />
                    <span>Drag & drop, or click to choose a file</span>
                    <input
                        ref={inputRef}
                        id={id}
                        type="file"
                        accept={accept}
                        disabled={disabled}
                        className="hidden"
                        onChange={(e) => accept1(e.target.files?.[0])}
                        aria-invalid={!!effectiveError}
                        aria-describedby={effectiveError ? `${id}-error` : undefined}
                    />
                </label>
            )}
            {typeof progress === "number" && progress > 0 && progress < 100 && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
            )}
        </FormField>
    );
}
