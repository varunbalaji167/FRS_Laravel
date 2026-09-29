import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { Copy, Loader2, Upload, User, Check } from "lucide-react";
import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Kept in sync with Step2Personal's dropdown options
const ID_PROOF_TYPES = ["Aadhar", "PAN", "Passport", "Voter ID", "Driving License"];
const NATIONALITY_OPTIONS = ["Indian", "OCI", "Foreign National"];

export default function BasicProfileForm({ user, className = "" }) {
    const profile = user.applicant_profile || {};
    const [isAddressCopied, setIsAddressCopied] = useState(false);

    // One-time fallback: split `user.name` into first/middle/last when the
    // profile doesn't have them yet (e.g. a profile created before this field
    // split existed).
    const nameFallback = (() => {
        if (profile.first_name || profile.middle_name || profile.last_name) {
            return {
                first_name: profile.first_name || "",
                middle_name: profile.middle_name || "",
                last_name: profile.last_name || "",
            };
        }

        const parts = (user.name || "").trim().split(/\s+/).filter(Boolean);

        return {
            first_name: parts[0] || "",
            middle_name: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
            last_name: parts.length > 1 ? parts[parts.length - 1] : "",
        };
    })();

    const [preview, setPreview] = useState(
        profile.photo_path ? route("files.show", { path: profile.photo_path }) : null,
    );
    const [imageError, setImageError] = useState("");
    const [frontendErrors, setFrontendErrors] = useState({});

    const { data, setData, post, errors, processing, isDirty } = useForm({
        _method: "patch",

        // Profile Image
        profile_image: null,

        // Core Identity
        name: user.name || "",
        email: user.email || "",

        // Personal
        first_name: nameFallback.first_name,
        middle_name: nameFallback.middle_name,
        last_name: nameFallback.last_name,
        fathers_name: profile.fathers_name || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        marital_status: profile.marital_status || "",
        category: profile.category || "",
        nationality: profile.nationality || "Indian",
        id_proof_type: profile.id_proof_type || "",
        id_proof_number: profile.id_proof_number || "",

        // Contact — split code + number to mirror Step2Personal exactly
        phone_code: profile.phone_code || "+91",
        phone: profile.phone || "",
        alt_phone_code: profile.alt_phone_code || "+91",
        alt_phone: profile.alt_phone || "",
        alt_email: profile.alt_email || "",

        // Correspondence Address
        corr_address: profile.corr_address || "",
        corr_city: profile.corr_city || "",
        corr_state: profile.corr_state || "",
        corr_pincode: profile.corr_pincode || "",
        corr_country: profile.corr_country || "India",

        // Permanent Address
        perm_address: profile.perm_address || "",
        perm_city: profile.perm_city || "",
        perm_state: profile.perm_state || "",
        perm_pincode: profile.perm_pincode || "",
        perm_country: profile.perm_country || "India",

        // Professional Details — separate fieldset, does not participate in
        // the wizard's copy-from-profile.
        designation: profile.designation || "",
        affiliation: profile.affiliation || "",
        google_scholar_url: profile.google_scholar_url || "",
        orcid_url: profile.orcid_url || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
    });

    const allErrors = { ...errors, ...frontendErrors };

    // ── Helpers ─────────────────────────────────────────────────────────────

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageError("");
        if (file) {
            if (file.size > 2097152) {
                setImageError("Image size must be less than 2MB.");
                e.target.value = "";
                return;
            }
            setData("profile_image", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const copyAddress = () => {
        setData((cur) => ({
            ...cur,
            perm_address: cur.corr_address,
            perm_city: cur.corr_city,
            perm_state: cur.corr_state,
            perm_pincode: cur.corr_pincode,
            perm_country: cur.corr_country,
        }));

        // Show visual feedback for 2 seconds
        setIsAddressCopied(true);
        setTimeout(() => setIsAddressCopied(false), 2000);
    };

    // Clear a single frontend error key the moment the user edits that field
    const clearErr = (key) => {
        if (frontendErrors[key]) {
            setFrontendErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    // ── Frontend validation ──────────────────────────────────────────────────
    const validate = () => {
        const errs = {};

        if (data.alt_email?.trim() && !EMAIL_REGEX.test(data.alt_email.trim())) {
            errs.alt_email = "Invalid email format";
        }

        const phone = String(data.phone || "").replace(/\D/g, "");
        if (phone && phone.length !== 10) {
            errs.phone = "Must be exactly 10 digits";
        }

        const altPhone = String(data.alt_phone || "").replace(/\D/g, "");
        if (altPhone && altPhone.length !== 10) {
            errs.alt_phone = "Must be exactly 10 digits";
        }

        if (data.phone_code && !/^\+\d{1,4}$/.test(data.phone_code.trim())) {
            errs.phone_code = "Format: +91";
        }
        if (data.alt_phone_code && !/^\+\d{1,4}$/.test(data.alt_phone_code.trim())) {
            errs.alt_phone_code = "Format: +91";
        }

        // Type and number must both be present or both absent
        if (data.id_proof_type && !data.id_proof_number.trim()) {
            errs.id_proof_number = "Please enter the ID number";
        }
        if (data.id_proof_number.trim() && !data.id_proof_type) {
            errs.id_proof_type = "Please select an ID type";
        }

        setFrontendErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        post(route("profile.update"), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const inputClass =
        "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm";

    const isSaveDisabled = processing || (!isDirty && !data.profile_image) || !!imageError;

    return (
        <section className={className}>
            <header className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Master Profile</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Keep this core information up to date. It will be used to automatically pre-fill your future IIT
                    Indore job applications.
                </p>
            </header>

            <form
                onSubmit={submit}
                className="space-y-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                encType="multipart/form-data"
            >
                {/* ── 0. Profile Picture ─────────────────────────────────────────── */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">Profile Picture</h3>
                    <div className="mt-4 flex items-center gap-x-6">
                        <div className="h-24 w-24 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Profile Preview" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-12 w-12 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="profile_image"
                                className="relative cursor-pointer font-semibold text-blue-600 hover:text-blue-500"
                            >
                                <span className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg shadow-sm text-sm bg-white">
                                    <Upload className="h-4 w-4" />
                                    Upload Image
                                </span>
                                <input
                                    id="profile_image"
                                    name="profile_image"
                                    type="file"
                                    className="sr-only"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleImageChange}
                                />
                            </label>
                            <p className="mt-2 text-xs text-slate-500">JPG, PNG up to 2MB.</p>
                            {(imageError || allErrors.profile_image) && (
                                <p className="mt-1 text-sm text-red-600">{imageError || allErrors.profile_image}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 1. Personal Details ────────────────────────────────────────── */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">
                        1. Personal Details
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="first_name" value="First Name" />
                            <TextInput
                                id="first_name"
                                className={inputClass}
                                value={data.first_name}
                                onChange={(e) => setData("first_name", e.target.value)}
                                required
                            />
                            <InputError message={allErrors.first_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="middle_name" value="Middle Name" />
                            <TextInput
                                id="middle_name"
                                className={inputClass}
                                value={data.middle_name}
                                onChange={(e) => setData("middle_name", e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="last_name" value="Last Name" />
                            <TextInput
                                id="last_name"
                                className={inputClass}
                                value={data.last_name}
                                onChange={(e) => setData("last_name", e.target.value)}
                                required
                            />
                            <InputError message={allErrors.last_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput
                                id="name"
                                className={inputClass}
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                            />
                            <InputError message={allErrors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="fathers_name" value="Father's Name" />
                            <TextInput
                                id="fathers_name"
                                className={inputClass}
                                value={data.fathers_name}
                                onChange={(e) => setData("fathers_name", e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="dob" value="Date of Birth" />
                            <TextInput
                                id="dob"
                                type="date"
                                className={inputClass}
                                value={data.dob}
                                onChange={(e) => setData("dob", e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="gender" value="Gender" />
                            <select
                                id="gender"
                                className={inputClass}
                                value={data.gender}
                                onChange={(e) => setData("gender", e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="marital_status" value="Marital Status" />
                            <select
                                id="marital_status"
                                className={inputClass}
                                value={data.marital_status}
                                onChange={(e) => setData("marital_status", e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Unmarried">Unmarried</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="category" value="Category" />
                            <select
                                id="category"
                                className={inputClass}
                                value={data.category}
                                onChange={(e) => setData("category", e.target.value)}
                            >
                                <option value="">Select Category</option>
                                <option value="UR">UR (Unreserved)</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="EWS">EWS</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="nationality" value="Nationality" />
                            <select
                                id="nationality"
                                className={inputClass}
                                value={data.nationality}
                                onChange={(e) => setData("nationality", e.target.value)}
                            >
                                {NATIONALITY_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ID Proof — type + number stored as two independent fields */}
                        <div className="sm:col-span-2">
                            <InputLabel value="ID Proof" />
                            <div className="flex gap-2 mt-1">
                                <select
                                    className={`w-44 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${allErrors.id_proof_type ? "border-red-500" : ""}`}
                                    value={data.id_proof_type}
                                    onChange={(e) => {
                                        setData("id_proof_type", e.target.value);
                                        clearErr("id_proof_type");
                                    }}
                                >
                                    <option value="">— Select Type —</option>
                                    {ID_PROOF_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <TextInput
                                    className={`flex-1 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${allErrors.id_proof_number ? "border-red-500" : ""}`}
                                    value={data.id_proof_number}
                                    placeholder="ID number"
                                    onChange={(e) => {
                                        setData("id_proof_number", e.target.value);
                                        clearErr("id_proof_number");
                                    }}
                                />
                            </div>
                            {(allErrors.id_proof_type || allErrors.id_proof_number) && (
                                <p className="mt-1 text-sm text-red-600">
                                    {allErrors.id_proof_type || allErrors.id_proof_number}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 2. Contact Information ─────────────────────────────────────── */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">
                        2. Contact Information
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        {/* Primary Email — read-only */}
                        <div>
                            <InputLabel htmlFor="email" value="Primary Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className={`${inputClass} bg-slate-50 text-slate-500`}
                                value={data.email}
                                disabled
                            />
                            <p className="mt-1 text-xs text-slate-400">
                                This is your login email. Change it under Account Settings.
                            </p>
                        </div>

                        {/* Alternate Email */}
                        <div>
                            <InputLabel htmlFor="alt_email" value="Alternate Email" />
                            <TextInput
                                id="alt_email"
                                type="email"
                                className={`${inputClass} ${allErrors.alt_email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                                value={data.alt_email}
                                placeholder="optional@email.com"
                                onChange={(e) => {
                                    setData("alt_email", e.target.value);
                                    clearErr("alt_email");
                                }}
                            />
                            <InputError message={allErrors.alt_email} className="mt-1" />
                        </div>

                        {/* Primary Mobile — code + number */}
                        <div>
                            <InputLabel htmlFor="phone" value="Primary Mobile" />
                            <div className="flex gap-2 mt-1">
                                <TextInput
                                    type="text"
                                    className={`w-20 text-center px-1 bg-slate-50 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${allErrors.phone_code ? "border-red-500" : ""}`}
                                    value={data.phone_code}
                                    maxLength={5}
                                    placeholder="+91"
                                    onChange={(e) => {
                                        setData("phone_code", e.target.value.replace(/[^\d+]/g, ""));
                                        clearErr("phone_code");
                                    }}
                                />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    className={`flex-1 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${allErrors.phone ? "border-red-500" : ""}`}
                                    value={data.phone}
                                    maxLength={10}
                                    placeholder="10-digit number"
                                    onChange={(e) => {
                                        setData("phone", e.target.value.replace(/\D/g, ""));
                                        clearErr("phone");
                                    }}
                                />
                            </div>
                            {(allErrors.phone_code || allErrors.phone) && (
                                <p className="mt-1 text-sm text-red-600">{allErrors.phone_code || allErrors.phone}</p>
                            )}
                        </div>

                        {/* Alternate Mobile — code + number */}
                        <div>
                            <InputLabel htmlFor="alt_phone" value="Alternate Mobile" />
                            <div className="flex gap-2 mt-1">
                                <TextInput
                                    type="text"
                                    className={`w-20 text-center px-1 bg-slate-50 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${allErrors.alt_phone_code ? "border-red-500" : ""}`}
                                    value={data.alt_phone_code}
                                    maxLength={5}
                                    placeholder="+91"
                                    onChange={(e) => {
                                        setData("alt_phone_code", e.target.value.replace(/[^\d+]/g, ""));
                                        clearErr("alt_phone_code");
                                    }}
                                />
                                <TextInput
                                    id="alt_phone"
                                    type="tel"
                                    className={`flex-1 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${allErrors.alt_phone ? "border-red-500" : ""}`}
                                    value={data.alt_phone}
                                    maxLength={10}
                                    placeholder="optional"
                                    onChange={(e) => {
                                        setData("alt_phone", e.target.value.replace(/\D/g, ""));
                                        clearErr("alt_phone");
                                    }}
                                />
                            </div>
                            {(allErrors.alt_phone_code || allErrors.alt_phone) && (
                                <p className="mt-1 text-sm text-red-600">
                                    {allErrors.alt_phone_code || allErrors.alt_phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 3. Addresses ───────────────────────────────────────────────── */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">3. Addresses</h3>
                    <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        {/* Correspondence */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="font-semibold text-slate-800">Correspondence Address</h4>
                            <div>
                                <InputLabel htmlFor="corr_address" value="Street Address" />
                                <TextInput
                                    id="corr_address"
                                    className={inputClass}
                                    value={data.corr_address}
                                    onChange={(e) => setData("corr_address", e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="corr_city" value="City" />
                                    <TextInput
                                        id="corr_city"
                                        className={inputClass}
                                        value={data.corr_city}
                                        onChange={(e) => setData("corr_city", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="corr_state" value="State" />
                                    <TextInput
                                        id="corr_state"
                                        className={inputClass}
                                        value={data.corr_state}
                                        onChange={(e) => setData("corr_state", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="corr_pincode" value="Pincode" />
                                    <TextInput
                                        id="corr_pincode"
                                        className={inputClass}
                                        value={data.corr_pincode}
                                        onChange={(e) => setData("corr_pincode", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="corr_country" value="Country" />
                                    <TextInput
                                        id="corr_country"
                                        className={inputClass}
                                        value={data.corr_country}
                                        onChange={(e) => setData("corr_country", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Permanent */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-slate-800">Permanent Address</h4>
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
                                            <Copy className="h-3 w-3 mr-1.5" /> Same as Correspondence
                                        </>
                                    )}
                                </button>
                            </div>
                            <div>
                                <InputLabel htmlFor="perm_address" value="Street Address" />
                                <TextInput
                                    id="perm_address"
                                    className={inputClass}
                                    value={data.perm_address}
                                    onChange={(e) => setData("perm_address", e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="perm_city" value="City" />
                                    <TextInput
                                        id="perm_city"
                                        className={inputClass}
                                        value={data.perm_city}
                                        onChange={(e) => setData("perm_city", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="perm_state" value="State" />
                                    <TextInput
                                        id="perm_state"
                                        className={inputClass}
                                        value={data.perm_state}
                                        onChange={(e) => setData("perm_state", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="perm_pincode" value="Pincode" />
                                    <TextInput
                                        id="perm_pincode"
                                        className={inputClass}
                                        value={data.perm_pincode}
                                        onChange={(e) => setData("perm_pincode", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="perm_country" value="Country" />
                                    <TextInput
                                        id="perm_country"
                                        className={inputClass}
                                        value={data.perm_country}
                                        onChange={(e) => setData("perm_country", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 4. Professional Information ────────────────────────────────── */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">
                        4. Professional Information
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 italic">
                        These fields do not carry over to the application wizard&apos;s Step 2.
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="designation" value="Designation" />
                            <TextInput
                                id="designation"
                                className={inputClass}
                                value={data.designation}
                                onChange={(e) => setData("designation", e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="affiliation" value="Affiliation" />
                            <TextInput
                                id="affiliation"
                                className={inputClass}
                                value={data.affiliation}
                                onChange={(e) => setData("affiliation", e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="google_scholar_url" value="Google Scholar URL" />
                            <TextInput
                                id="google_scholar_url"
                                type="url"
                                className={inputClass}
                                value={data.google_scholar_url}
                                onChange={(e) => setData("google_scholar_url", e.target.value)}
                                placeholder="https://scholar.google.com/..."
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="orcid_url" value="ORCID URL" />
                            <TextInput
                                id="orcid_url"
                                type="url"
                                className={inputClass}
                                value={data.orcid_url}
                                onChange={(e) => setData("orcid_url", e.target.value)}
                                placeholder="https://orcid.org/..."
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="linkedin_url" value="LinkedIn URL" />
                            <TextInput
                                id="linkedin_url"
                                type="url"
                                className={inputClass}
                                value={data.linkedin_url}
                                onChange={(e) => setData("linkedin_url", e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="github_url" value="GitHub URL" />
                            <TextInput
                                id="github_url"
                                type="url"
                                className={inputClass}
                                value={data.github_url}
                                onChange={(e) => setData("github_url", e.target.value)}
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* ── Save Action ────────────────────────────────────────────────── */}
                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton
                        className={`inline-flex items-center gap-2 transition-opacity ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        disabled={isSaveDisabled}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save Profile"
                        )}
                    </PrimaryButton>

                    {!isDirty && !data.profile_image && (
                        <p className="text-xs text-slate-400 italic">No unsaved changes</p>
                    )}
                </div>
            </form>
        </section>
    );
}
