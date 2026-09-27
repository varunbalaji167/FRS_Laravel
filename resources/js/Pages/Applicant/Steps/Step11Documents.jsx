import { Label } from "@/Components/ui/label";
import Checkbox from "@/Components/Checkbox";
import { AlertCircle, UploadCloud, PenTool } from "lucide-react";
import FileField from "@/Components/inputs/FileField";
import SignaturePadField from "@/Components/inputs/SignaturePadField";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const DOCUMENT_FIELDS = [
    { key: "phd_cert", label: "1. PHD Certificate", required: true },
    { key: "pg_cert", label: "2. PG Certificate" },
    { key: "ug_cert", label: "3. UG Certificate" },
    { key: "hsc_cert", label: "4. 12th/HSC/Diploma" },
    { key: "ssc_cert", label: "5. 10th/SSC Certificate", required: true },
    { key: "payslip", label: "6. Last three months payslip" },
    { key: "noc", label: "7. Undertaking/NOC" },
    { key: "post_phd_exp", label: "8. Post PhD Experience Certificate" },
    {
        key: "other_docs",
        label: "9. Any other relevant documents (Merged PDF)",
        className: "md:col-span-2",
    },
];

export default function Step11Documents({ data, setData, localErrors = {}, uploadProgress = null }) {
    const docs = data.documents || {};
    const bestPapers = data.best_papers || {};
    const declaration = data.form_data.declaration || false;

    const handleFileChange = (field, file, category = "documents") => {
        const currentDataTarget = category === "documents" ? docs : bestPapers;
        const newData = { ...currentDataTarget };
        if (file) {
            newData[field] = file;
        } else {
            delete newData[field];
        }
        setData(category, newData);
    };

    const handleDeclaration = (checked) => {
        setData("form_data", { ...data.form_data, declaration: checked });
    };

    const handleSignatureChange = (file) => {
        const newDocs = { ...docs };
        if (file) {
            newDocs.signature = file;
        } else {
            delete newDocs.signature;
        }
        setData("documents", newDocs);
    };

    const getFieldError = (field) => localErrors[field];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">10. Documents & Submit</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Upload your best papers, supporting certificates, and agree to the final declaration. Max file size:
                    10 MB per PDF.
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
                        return (
                            <FileField
                                key={num}
                                id={fieldKey}
                                label={`Best Paper ${num} (PDF)`}
                                value={bestPapers[fieldKey]}
                                onChange={(file) => handleFileChange(fieldKey, file, "best_papers")}
                                accept=".pdf"
                                maxSizeBytes={MAX_FILE_SIZE}
                                error={getFieldError(fieldKey)}
                                progress={bestPapers[fieldKey] ? uploadProgress : null}
                            />
                        );
                    })}
                </div>
            </div>

            {/* (B) Document Checklist */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 border-b pb-2">
                    <UploadCloud className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-lg text-slate-800">(B) Check List of the documents attached</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {DOCUMENT_FIELDS.map(({ key, label, required, className }) => (
                        <div key={key} className={className}>
                            <FileField
                                id={key}
                                label={label}
                                required={required}
                                value={docs[key]}
                                onChange={(file) => handleFileChange(key, file, "documents")}
                                accept=".pdf"
                                maxSizeBytes={MAX_FILE_SIZE}
                                error={getFieldError(key)}
                                progress={docs[key] ? uploadProgress : null}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Declaration & Signature */}
            <div className="space-y-6 bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <div>
                    <h4 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                        <PenTool className="h-5 w-5" /> 23. Final Declaration & Digital Signature
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
                            I hereby declare that I have carefully read and understood the instructions and particulars
                            mentioned in the advertisement and this application form. I further declare that all the
                            entries along with the attachments uploaded in this form are true to the best of my
                            knowledge and belief. <span className="text-red-500">*</span>
                        </Label>
                        {localErrors.declaration && (
                            <p className="text-sm font-bold text-red-600 flex items-center mt-2">
                                <AlertCircle className="h-4 w-4 mr-1" /> {localErrors.declaration}
                            </p>
                        )}
                    </div>
                </div>

                {/* Digital Signature Drawing Pad */}
                <div className="pt-6 border-t border-emerald-200/60 max-w-md">
                    <SignaturePadField
                        id="signature"
                        label="Draw your Signature"
                        required
                        hasValue={!!docs.signature}
                        onChange={handleSignatureChange}
                        error={getFieldError("signature")}
                    />
                </div>
            </div>
        </div>
    );
}
