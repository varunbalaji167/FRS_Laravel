import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import FormField from "@/Components/inputs/FormField";

function dataURLtoFile(dataUrl, filename) {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return new File([bytes], filename, { type: mime });
}

// Draw-a-signature pad — converts the canvas to a PNG File on every stroke so
// the parent can treat it exactly like any other file field.
export default function SignaturePadField({ id, label, onChange, error, required, hasValue, disabled }) {
    const padRef = useRef(null);

    const commit = () => {
        const pad = padRef.current;
        if (!pad || pad.isEmpty()) {
            onChange(null);
            return;
        }
        // Encode the full canvas, not getTrimmedCanvas(): the trim step
        // (trim-canvas) throws IndexSizeError when a stroke's bounding box
        // computes a 0 width/height, and because this runs in the onEnd
        // handler the throw is swallowed — the drawn signature is silently
        // never captured, so validation keeps reporting it as missing.
        const dataUrl = pad.toDataURL("image/png");
        onChange(dataURLtoFile(dataUrl, "signature.png"));
    };

    const clear = () => {
        padRef.current?.clear();
        onChange(null);
    };

    return (
        <FormField label={label} htmlFor={id} error={error} required={required}>
            <div className="rounded-md border border-input">
                <SignatureCanvas
                    ref={padRef}
                    penColor="black"
                    canvasProps={{ id, className: "w-full h-32", "aria-invalid": !!error }}
                    onEnd={commit}
                    clearOnResize={false}
                />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{hasValue ? "Signature captured." : "Draw your signature above."}</span>
                {!disabled && (
                    <button type="button" onClick={clear} className="text-primary underline">
                        Clear
                    </button>
                )}
            </div>
        </FormField>
    );
}
