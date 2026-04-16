import { useState, useRef } from "react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import Checkbox from "@/Components/Checkbox";
import { AlertCircle, UploadCloud, PenTool, Eraser, Check } from "lucide-react";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";

// Helper function to convert base64 image data into a File object
function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export default function Step11Documents({ data, setData, localErrors = {} }) {
    const docs = data.documents || {};
    const bestPapers = data.best_papers || {};
    const declaration = data.form_data.declaration || false;

    const sigCanvas = useRef(null);
    const [fileSizeErrors, setFileSizeErrors] = useState({});

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const handleFileChange = (field, e, fieldName, category = "documents") => {
        const file = e.target.files[0];
        const currentDataTarget = category === "documents" ? docs : bestPapers;

        if (!file) {
            const newData = { ...currentDataTarget };
            delete newData[field];
            setData(category, newData);

            setFileSizeErrors((prev) => {
                const newErrs = { ...prev };
                delete newErrs[field];
                return newErrs;
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            const errorMsg = "File must be smaller than 10 MB.";
            toast.error(`${fieldName} Validation Error: ${errorMsg}`);

            setFileSizeErrors((prev) => ({
                ...prev,
                [field]: errorMsg,
            }));

            const newData = { ...currentDataTarget };
            delete newData[field];
            setData(category, newData);

            e.target.value = "";
            return;
        }

        setFileSizeErrors((prev) => {
            const newErrs = { ...prev };
            delete newErrs[field];
            return newErrs;
        });

        setData(category, { ...currentDataTarget, [field]: file });
    };

    const handleDeclaration = (checked) => {
        setData("form_data", { ...data.form_data, declaration: checked });
    };

    // --- Signature Pad Logic ---
    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        const newDocs = { ...docs };
        delete newDocs.signature;
        setData("documents", newDocs);

        // Clear any specific backend/frontend errors for the signature when they try again
        if (localErrors.signature) {
            delete localErrors.signature;
        }
    };

    const saveSignature = () => {
        if (sigCanvas.current.isEmpty()) {
            toast.error("Please draw your signature before saving.");
            return;
        }

        // Changed getTrimmedCanvas() to getCanvas() to fix the Vite bug
        const dataURL = sigCanvas.current.getCanvas().toDataURL("image/png");

        // Convert string to an actual File object, just like a standard upload
        const file = dataURLtoFile(dataURL, "digital_signature.png");

        // Save to state
        setData("documents", { ...docs, signature: file });
        toast.success("Digital signature captured successfully!");

        // Clear local error if it existed
        setFileSizeErrors((prev) => {
            const newErrs = { ...prev };
            delete newErrs.signature;
            return newErrs;
        });
    };

    const getFieldError = (field) => {
        return localErrors[field] || fileSizeErrors[field];
    };

    const FieldErrorMessage = ({ error }) => {
        if (!error) return null;
        return (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {error}
            </p>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">
                    10. Documents & Submit
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Upload your best papers, supporting certificates, and agree
                    to the final declaration. Max file size: 10 MB per PDF.
                </p>
            </div>

            {/* (A) Best Papers */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    (A) Reprints of at most 5 Best Research Papers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const fieldKey = `best_paper_${num}`;
                        const error = getFieldError(fieldKey);

                        return (
                            <div key={num} className="space-y-2">
                                <Label>Best Paper {num} (PDF)</Label>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) =>
                                        handleFileChange(
                                            fieldKey,
                                            e,
                                            `Best Paper ${num}`,
                                            "best_papers",
                                        )
                                    }
                                    className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${error ? "border-red-500" : ""}`}
                                />
                                <FieldErrorMessage error={error} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* (B) Document Checklist */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 border-b pb-2">
                    <UploadCloud className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-lg text-slate-800">
                        (B) Check List of the documents attached
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>
                            1. PHD Certificate{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange(
                                    "phd_cert",
                                    e,
                                    "PhD Certificate",
                                )
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("phd_cert") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage error={getFieldError("phd_cert")} />
                    </div>

                    <div className="space-y-2">
                        <Label>2. PG Certificate</Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange("pg_cert", e, "PG Certificate")
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("pg_cert") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage error={getFieldError("pg_cert")} />
                    </div>

                    <div className="space-y-2">
                        <Label>3. UG Certificate</Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange("ug_cert", e, "UG Certificate")
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("ug_cert") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage error={getFieldError("ug_cert")} />
                    </div>

                    <div className="space-y-2">
                        <Label>4. 12th/HSC/Diploma</Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange(
                                    "hsc_cert",
                                    e,
                                    "12th/HSC/Diploma",
                                )
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("hsc_cert") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage error={getFieldError("hsc_cert")} />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            5. 10th/SSC Certificate{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange(
                                    "ssc_cert",
                                    e,
                                    "10th/SSC Certificate",
                                )
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("ssc_cert") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage error={getFieldError("ssc_cert")} />
                    </div>

                    <div className="space-y-2">
                        <Label>6. Last three months payslip</Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange("payslip", e, "Payslip")
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("payslip") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage error={getFieldError("payslip")} />
                    </div>

                    <div className="space-y-2">
                        <Label>7. Undertaking/NOC</Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange("noc", e, "Undertaking/NOC")
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("noc") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage error={getFieldError("noc")} />
                    </div>

                    <div className="space-y-2">
                        <Label>8. Post PhD Experience Certificate</Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange(
                                    "post_phd_exp",
                                    e,
                                    "Post PhD Experience",
                                )
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("post_phd_exp") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage
                            error={getFieldError("post_phd_exp")}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>
                            9. Any other relevant documents (Merged PDF)
                        </Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange(
                                    "other_docs",
                                    e,
                                    "Other relevant documents",
                                )
                            }
                            className={`bg-white file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 cursor-pointer ${getFieldError("other_docs") ? "border-red-500" : ""}`}
                        />
                        <FieldErrorMessage
                            error={getFieldError("other_docs")}
                        />
                    </div>
                </div>
            </div>

            {/* Final Declaration & Signature */}
            <div className="space-y-6 bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <div>
                    <h4 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                        <PenTool className="h-5 w-5" /> 23. Final Declaration &
                        Digital Signature
                    </h4>
                </div>

                <div className="flex items-start space-x-3">
                    <Checkbox
                        id="declaration"
                        name="declaration"
                        checked={declaration}
                        onChange={(e) => handleDeclaration(e.target.checked)}
                        className={`mt-1 h-5 w-5 ${localErrors.declaration ? "border-red-500 ring-2 ring-red-200" : ""}`}
                    />
                    <div className="space-y-1">
                        <Label
                            htmlFor="declaration"
                            className="text-sm font-semibold text-slate-800 leading-relaxed cursor-pointer"
                        >
                            I hereby declare that I have carefully read and
                            understood the instructions and particulars
                            mentioned in the advertisement and this application
                            form. I further declare that all the entries along
                            with the attachments uploaded in this form are true
                            to the best of my knowledge and belief.{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        {localErrors.declaration && (
                            <p className="text-sm font-bold text-red-600 flex items-center mt-2">
                                <AlertCircle className="h-4 w-4 mr-1" />{" "}
                                {localErrors.declaration}
                            </p>
                        )}
                    </div>
                </div>

                {/* Digital Signature Drawing Pad */}
                <div className="pt-6 border-t border-emerald-200/60">
                    <Label className="text-sm font-bold text-slate-800 mb-2 block">
                        Draw your Signature{" "}
                        <span className="text-red-500">*</span>
                    </Label>

                    <div
                        className={`relative bg-white border-2 border-dashed rounded-lg max-w-md overflow-hidden ${getFieldError("signature") ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                    >
                        {/* If signature is already saved, show the saved image instead of the active canvas to prevent accidental overwrites */}
                        {docs.signature ? (
                            <div className="h-48 w-full flex flex-col items-center justify-center p-4">
                                <img
                                    src={URL.createObjectURL(docs.signature)}
                                    alt="Saved Signature"
                                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                                />
                                <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                    <Check className="h-3 w-3" /> Saved
                                </div>
                            </div>
                        ) : (
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{
                                    className:
                                        "h-48 w-full cursor-crosshair touch-none",
                                }}
                            />
                        )}
                    </div>

                    <FieldErrorMessage error={getFieldError("signature")} />

                    <div className="flex gap-3 mt-3">
                        {!docs.signature ? (
                            <>
                                <Button
                                    type="button"
                                    onClick={saveSignature}
                                    variant="default"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    size="sm"
                                >
                                    <Check className="h-4 w-4 mr-1" /> Confirm
                                    Signature
                                </Button>
                                <Button
                                    type="button"
                                    onClick={clearSignature}
                                    variant="outline"
                                    size="sm"
                                    className="text-slate-600"
                                >
                                    <Eraser className="h-4 w-4 mr-1" /> Clear
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                onClick={clearSignature}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Eraser className="h-4 w-4 mr-1" /> Redraw
                                Signature
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
