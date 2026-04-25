import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Copy, Upload, User, Check } from "lucide-react";
import { useEffect, useState } from "react";

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
    const [imageError, setImageError] = useState("");
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageError("");
        if (file) {
            if (file.size > 2097152) {
                setImageError("Image size must be less than 2MB.");
                return;
            }
            setPreview(URL.createObjectURL(file));
            updateFormData("personal_details", "profile_image", file);
        }
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
                    <div>
                        <Label
                            htmlFor="profile_image"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                            <span className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg shadow-sm text-sm">
                                <Upload className="h-4 w-4" />
                                Upload Photo
                            </span>
                            <Input
                                id="profile_image"
                                type="file"
                                className="sr-only"
                                accept="image/jpeg, image/png, image/jpg"
                                onChange={handleImageChange}
                            />
                        </Label>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            JPG, PNG up to 2MB.
                        </p>

                        {(imageError || localErrors.profile_image) && (
                            <p className="mt-1 text-sm text-red-600 font-medium">
                                {imageError || localErrors.profile_image}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Name & Family
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={p.first_name || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "first_name",
                                    e.target.value,
                                )
                            }
                            className={
                                localErrors.first_name ? "border-red-500" : ""
                            }
                        />
                        {localErrors.first_name && (
                            <p className="text-xs text-red-500">
                                {localErrors.first_name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Middle Name</Label>
                        <Input
                            value={p.middle_name || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "middle_name",
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={p.last_name || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "last_name",
                                    e.target.value,
                                )
                            }
                            className={
                                localErrors.last_name ? "border-red-500" : ""
                            }
                        />
                        {localErrors.last_name && (
                            <p className="text-xs text-red-500">
                                {localErrors.last_name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label>Father's Name</Label>
                        <Input
                            value={p.fathers_name || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "fathers_name",
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Demographics & Identity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>
                            Date of Birth{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={p.dob || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "dob",
                                    e.target.value,
                                )
                            }
                            className={localErrors.dob ? "border-red-500" : ""}
                        />
                        {localErrors.dob && (
                            <p className="text-xs text-red-500">
                                {localErrors.dob}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Gender <span className="text-red-500">*</span>
                        </Label>
                        <select
                            value={p.gender || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "gender",
                                    e.target.value,
                                )
                            }
                            className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${localErrors.gender ? "border-red-500" : "border-slate-200"}`}
                        >
                            <option value="" disabled>
                                Select...
                            </option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Transgender">Transgender</option>
                            <option value="Prefer not to say">
                                Prefer not to say
                            </option>
                        </select>
                        {localErrors.gender && (
                            <p className="text-xs text-red-500">
                                {localErrors.gender}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Marital Status</Label>
                        <select
                            value={p.marital_status || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "marital_status",
                                    e.target.value,
                                )
                            }
                            className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="" disabled>
                                Select...
                            </option>
                            <option value="Unmarried">Unmarried</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Category <span className="text-red-500">*</span>
                        </Label>
                        <select
                            value={p.category || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "category",
                                    e.target.value,
                                )
                            }
                            className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${localErrors.category ? "border-red-500" : "border-slate-200"}`}
                        >
                            <option value="" disabled>
                                Select...
                            </option>
                            <option value="UR">UR (Unreserved)</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="EWS">EWS</option>
                        </select>
                        {localErrors.category && (
                            <p className="text-xs text-red-500">
                                {localErrors.category}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Nationality <span className="text-red-500">*</span>
                        </Label>
                        <select
                            value={p.nationality || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "nationality",
                                    e.target.value,
                                )
                            }
                            className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${localErrors.nationality ? "border-red-500" : "border-slate-200"}`}
                        >
                            <option value="" disabled>
                                Select...
                            </option>
                            <option value="Indian">Indian</option>
                            <option value="OCI">OCI</option>
                            <option value="Foreign National">
                                Foreign National
                            </option>
                        </select>
                        {localErrors.nationality && (
                            <p className="text-xs text-red-500">
                                {localErrors.nationality}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>ID Proof Type & Number</Label>
                        <div className="flex gap-2">
                            <select
                                value={p.id_proof_type || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "id_proof_type",
                                        e.target.value,
                                    )
                                }
                                className="flex h-11 w-1/3 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="" disabled>
                                    Type
                                </option>
                                <option value="Aadhar">Aadhar</option>
                                <option value="PAN">PAN</option>
                                <option value="Passport">Passport</option>
                                <option value="Voter ID">Voter ID</option>
                                <option value="Driving License">
                                    Driving License
                                </option>
                            </select>
                            <Input
                                value={p.id_proof_number || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "id_proof_number",
                                        e.target.value,
                                    )
                                }
                                placeholder="ID Number"
                                className="w-2/3"
                            />
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
                        <div className="space-y-2">
                            <Label>Street Address</Label>
                            <textarea
                                value={p.corr_address || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "corr_address",
                                        e.target.value,
                                    )
                                }
                                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[80px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City/District</Label>
                                <Input
                                    value={p.corr_city || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "corr_city",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State/Province</Label>
                                <Input
                                    value={p.corr_state || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "corr_state",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input
                                    value={p.corr_country || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "corr_country",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>PIN Code</Label>
                                <Input
                                    value={p.corr_pincode || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "corr_pincode",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
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
                        <div className="space-y-2">
                            <Label>Street Address</Label>
                            <textarea
                                value={p.perm_address || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "perm_address",
                                        e.target.value,
                                    )
                                }
                                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[80px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City/District</Label>
                                <Input
                                    value={p.perm_city || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "perm_city",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State/Province</Label>
                                <Input
                                    value={p.perm_state || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "perm_state",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input
                                    value={p.perm_country || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "perm_country",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>PIN Code</Label>
                                <Input
                                    value={p.perm_pincode || ""}
                                    onChange={(e) =>
                                        updateFormData(
                                            "personal_details",
                                            "perm_pincode",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Contact Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>
                            Primary E-mail{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="email"
                            value={p.email || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "email",
                                    e.target.value,
                                )
                            }
                            className={
                                localErrors.email ? "border-red-500" : ""
                            }
                        />
                        {localErrors.email && (
                            <p className="text-xs text-red-500">
                                {localErrors.email}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Alternate E-mail</Label>
                        <Input
                            type="email"
                            value={p.alt_email || ""}
                            onChange={(e) =>
                                updateFormData(
                                    "personal_details",
                                    "alt_email",
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Primary Mobile{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={p.phone_code || "+91"}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "phone_code",
                                        e.target.value.replace(/[^\d+]/g, ""),
                                    )
                                }
                                className="w-20 text-center px-1 bg-slate-50"
                                maxLength={5}
                            />
                            <Input
                                type="tel"
                                value={p.phone || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "phone",
                                        e.target.value.replace(/\D/g, ""),
                                    )
                                }
                                className={`flex-1 ${localErrors.phone ? "border-red-500" : ""}`}
                                maxLength={10}
                            />
                        </div>
                        {localErrors.phone && (
                            <p className="text-xs text-red-500">
                                {localErrors.phone}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Alternate Mobile</Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={p.alt_phone_code || "+91"}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "alt_phone_code",
                                        e.target.value.replace(/[^\d+]/g, ""),
                                    )
                                }
                                className="w-20 text-center px-1 bg-slate-50"
                                maxLength={5}
                            />
                            <Input
                                type="tel"
                                value={p.alt_phone || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "personal_details",
                                        "alt_phone",
                                        e.target.value.replace(/\D/g, ""),
                                    )
                                }
                                className="flex-1"
                                maxLength={10}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
