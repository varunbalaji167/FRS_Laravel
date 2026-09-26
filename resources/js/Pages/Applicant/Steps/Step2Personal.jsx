import { Button } from "@/Components/ui/button";
import { Copy, User, Check } from "lucide-react";
import { useEffect, useState } from "react";
import TextField from "@/Components/inputs/TextField";
import EmailField from "@/Components/inputs/EmailField";
import DatePicker from "@/Components/inputs/DatePicker";
import SelectField from "@/Components/inputs/SelectField";
import TextareaField from "@/Components/inputs/TextareaField";
import PhoneField from "@/Components/inputs/PhoneField";
import FileField from "@/Components/inputs/FileField";

const GENDER_OPTIONS = ["Male", "Female", "Transgender", "Prefer not to say"];
const MARITAL_STATUS_OPTIONS = ["Unmarried", "Married", "Divorced", "Widowed"];
const CATEGORY_OPTIONS = [
    { value: "UR", label: "UR (Unreserved)" },
    { value: "OBC", label: "OBC" },
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" },
    { value: "EWS", label: "EWS" },
];
const NATIONALITY_OPTIONS = ["Indian", "OCI", "Foreign National"];
const ID_PROOF_TYPE_OPTIONS = ["Aadhar", "PAN", "Passport", "Voter ID", "Driving License"];

export default function Step2Personal({
    data,
    setData,
    updateFormData,
    localErrors = {},
    profile = {},
    user = {},
}) {
    const p = data.form_data?.personal_details || {};
    const [preview, setPreview] = useState(null);
    const [isProfileCopied, setIsProfileCopied] = useState(false);
    const [isAddressCopied, setIsAddressCopied] = useState(false);

    // Set initial preview based on parent data
    useEffect(() => {
        if (p.profile_image instanceof File) {
            setPreview(URL.createObjectURL(p.profile_image));
        } else if (typeof p.profile_image === "string" && p.profile_image) {
            // Check if it's already a full path or needs prefix
            const path = p.profile_image.startsWith("http")
                ? p.profile_image
                : `/storage/${p.profile_image}`;
            setPreview(path);
        } else {
            setPreview(null);
        }
    }, [p.profile_image]);

    // Copy Address Logic
    const copyAddress = () => {
        setData("form_data", {
            ...data.form_data,
            personal_details: {
                ...p,
                perm_address: p.corr_address || "",
                perm_city: p.corr_city || "",
                perm_state: p.corr_state || "",
                perm_country: p.corr_country || "",
                perm_pincode: p.corr_pincode || "",
            },
        });
        setIsAddressCopied(true);
        setTimeout(() => setIsAddressCopied(false), 2000);
    };

    const handleImageChange = (file) => {
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
        updateFormData("personal_details", "profile_image", file);
    };

    const copyFromProfile = () => {
        const idParts = (profile.id_proof || "").split(":");
        const parsedIdType = idParts[0]?.trim() || "";
        const parsedIdNum = idParts.slice(1).join(":").trim();
        setData("form_data", {
            ...data.form_data,
            personal_details: {
                ...p, // keep any fields not in profile
                profile_image: profile.photo_path || p.profile_image || "",
                first_name:
                    (user.name || "").split(" ")[0] || p.first_name || "",
                last_name:
                    (user.name || "").split(" ").slice(1).join(" ") ||
                    p.last_name ||
                    "",
                email: user.email || p.email || "",
                fathers_name: profile.father_name || p.fathers_name || "",
                dob: profile.date_of_birth || p.dob || "",
                gender: profile.gender || p.gender || "",
                marital_status:
                    profile.marital_status || p.marital_status || "",
                category: profile.category || p.category || "",
                nationality: profile.nationality || p.nationality || "Indian",
                id_proof_type: parsedIdType || p.id_proof_type || "",
                id_proof_number: parsedIdNum || p.id_proof_number || "",
                alt_email: profile.alt_email || p.alt_email || "",
                phone: profile.phone || p.phone || "",
                alt_phone: profile.alt_phone || p.alt_phone || "",
                phone_code: profile.phone_code || p.phone_code || "+91",
                alt_phone_code:
                    profile.alt_phone_code || p.alt_phone_code || "+91",
                corr_address: profile.corr_address || p.corr_address || "",
                corr_city: profile.corr_city || p.corr_city || "",
                corr_state: profile.corr_state || p.corr_state || "",
                corr_pincode: profile.corr_pincode || p.corr_pincode || "",
                corr_country: profile.corr_country || p.corr_country || "India",
                perm_address: profile.perm_address || p.perm_address || "",
                perm_city: profile.perm_city || p.perm_city || "",
                perm_state: profile.perm_state || p.perm_state || "",
                perm_pincode: profile.perm_pincode || p.perm_pincode || "",
                perm_country: profile.perm_country || p.perm_country || "India",
            },
        });
        setIsProfileCopied(true);
        setTimeout(() => setIsProfileCopied(false), 2000);
    };

    const setField = (field, value) =>
        updateFormData("personal_details", field, value);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">
                    1. Personal Details
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Please provide your complete demographic and contact
                    information.
                </p>
            </div>
            {/* Profile sync banner */}
            <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-700">
                    Updated your profile recently? Sync those changes into this
                    application.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyFromProfile}
                    className={`shrink-0 ml-4 transition-colors ${
                        isProfileCopied
                            ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                            : "border-blue-300 text-blue-700 hover:bg-blue-100"
                    }`}
                >
                    {isProfileCopied ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy from Profile
                        </>
                    )}
                </Button>
            </div>
            {/* Application Profile Picture Section */}
            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Application Photo
                </h4>
                <div className="flex items-center gap-x-6">
                    <div className="h-24 w-24 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden object-cover">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Profile Preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-12 w-12 text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1 max-w-sm">
                        <FileField
                            id="profile_image"
                            value={p.profile_image}
                            onChange={handleImageChange}
                            accept="image/jpeg,image/png,image/jpg"
                            maxSizeBytes={2097152}
                            error={localErrors.profile_image}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Name & Family
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TextField
                        id="first_name"
                        label="First Name"
                        required
                        value={p.first_name}
                        onChange={(v) => setField("first_name", v)}
                        error={localErrors.first_name}
                    />
                    <TextField
                        id="middle_name"
                        label="Middle Name"
                        value={p.middle_name}
                        onChange={(v) => setField("middle_name", v)}
                    />
                    <TextField
                        id="last_name"
                        label="Last Name"
                        required
                        value={p.last_name}
                        onChange={(v) => setField("last_name", v)}
                        error={localErrors.last_name}
                    />
                    <div className="md:col-span-3">
                        <TextField
                            id="fathers_name"
                            label="Father's Name"
                            value={p.fathers_name}
                            onChange={(v) => setField("fathers_name", v)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Demographics & Identity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DatePicker
                        id="dob"
                        label="Date of Birth"
                        required
                        value={p.dob}
                        onChange={(v) => setField("dob", v)}
                        error={localErrors.dob}
                    />
                    <SelectField
                        id="gender"
                        label="Gender"
                        required
                        value={p.gender}
                        onChange={(v) => setField("gender", v)}
                        options={GENDER_OPTIONS}
                        error={localErrors.gender}
                    />
                    <SelectField
                        id="marital_status"
                        label="Marital Status"
                        value={p.marital_status}
                        onChange={(v) => setField("marital_status", v)}
                        options={MARITAL_STATUS_OPTIONS}
                    />
                    <SelectField
                        id="category"
                        label="Category"
                        required
                        value={p.category}
                        onChange={(v) => setField("category", v)}
                        options={CATEGORY_OPTIONS}
                        error={localErrors.category}
                    />
                    <SelectField
                        id="nationality"
                        label="Nationality"
                        required
                        value={p.nationality}
                        onChange={(v) => setField("nationality", v)}
                        options={NATIONALITY_OPTIONS}
                        error={localErrors.nationality}
                    />
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 items-start">
                            <div className="col-span-1">
                                <SelectField
                                    id="id_proof_type"
                                    label="ID Proof Type & Number"
                                    value={p.id_proof_type}
                                    onChange={(v) => setField("id_proof_type", v)}
                                    options={ID_PROOF_TYPE_OPTIONS}
                                    placeholder="Type"
                                />
                            </div>
                            <div className="col-span-2">
                                <TextField
                                    id="id_proof_number"
                                    label={" "}
                                    value={p.id_proof_number}
                                    onChange={(v) => setField("id_proof_number", v)}
                                    placeholder="ID Number"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-lg text-slate-800">
                        Correspondence Address
                    </h4>
                    <div className="space-y-4">
                        <TextareaField
                            id="corr_address"
                            label="Street Address"
                            value={p.corr_address}
                            onChange={(v) => setField("corr_address", v)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                id="corr_city"
                                label="City/District"
                                value={p.corr_city}
                                onChange={(v) => setField("corr_city", v)}
                            />
                            <TextField
                                id="corr_state"
                                label="State/Province"
                                value={p.corr_state}
                                onChange={(v) => setField("corr_state", v)}
                            />
                            <TextField
                                id="corr_country"
                                label="Country"
                                value={p.corr_country}
                                onChange={(v) => setField("corr_country", v)}
                            />
                            <TextField
                                id="corr_pincode"
                                label="PIN Code"
                                value={p.corr_pincode}
                                onChange={(v) => setField("corr_pincode", v)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100 relative">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-lg text-slate-800">
                            Permanent Address
                        </h4>
                        <button
                            type="button"
                            onClick={copyAddress}
                            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition ${
                                isAddressCopied
                                    ? "text-green-700 bg-green-100/50 hover:bg-green-100"
                                    : "text-blue-700 hover:text-blue-900 bg-blue-100/50 hover:bg-blue-100"
                            }`}
                        >
                            {isAddressCopied ? (
                                <>
                                    <Check className="h-3 w-3 mr-1.5" /> Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3 w-3 mr-1.5" /> Same as
                                    Correspondence
                                </>
                            )}
                        </button>
                    </div>
                    <div className="space-y-4">
                        <TextareaField
                            id="perm_address"
                            label="Street Address"
                            value={p.perm_address}
                            onChange={(v) => setField("perm_address", v)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                id="perm_city"
                                label="City/District"
                                value={p.perm_city}
                                onChange={(v) => setField("perm_city", v)}
                            />
                            <TextField
                                id="perm_state"
                                label="State/Province"
                                value={p.perm_state}
                                onChange={(v) => setField("perm_state", v)}
                            />
                            <TextField
                                id="perm_country"
                                label="Country"
                                value={p.perm_country}
                                onChange={(v) => setField("perm_country", v)}
                            />
                            <TextField
                                id="perm_pincode"
                                label="PIN Code"
                                value={p.perm_pincode}
                                onChange={(v) => setField("perm_pincode", v)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Contact Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EmailField
                        id="email"
                        label="Primary E-mail"
                        required
                        value={p.email}
                        onChange={(v) => setField("email", v)}
                        error={localErrors.email}
                    />
                    <EmailField
                        id="alt_email"
                        label="Alternate E-mail"
                        value={p.alt_email}
                        onChange={(v) => setField("alt_email", v)}
                    />
                    <PhoneField
                        id="phone"
                        label="Primary Mobile"
                        required
                        code={p.phone_code}
                        onCodeChange={(v) => setField("phone_code", v)}
                        value={p.phone}
                        onChange={(v) => setField("phone", v)}
                        error={localErrors.phone}
                    />
                    <PhoneField
                        id="alt_phone"
                        label="Alternate Mobile"
                        code={p.alt_phone_code}
                        onCodeChange={(v) => setField("alt_phone_code", v)}
                        value={p.alt_phone}
                        onChange={(v) => setField("alt_phone", v)}
                    />
                </div>
            </div>
        </div>
    );
}
