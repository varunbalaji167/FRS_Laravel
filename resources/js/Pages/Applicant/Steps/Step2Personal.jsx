import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Copy } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { useEffect, useRef } from "react";

export default function Step2Personal({
    data,
    setData,
    updateFormData,
    localErrors = {},
}) {
    const p = data.form_data?.personal_details || {};

    // Grab the user and their nested master profile from Inertia
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const profile = user.applicant_profile || {};
    const initialized = useRef(false);
    useEffect(() => {
        // If the application draft is completely empty (no email), load from master profile
        if (!initialized.current && !p.email && user.email && setData) {
            const nameParts = (user.name || "").split(" ");

            // Extract ID Type and Number (e.g., from "AADHAR: 123456")
            let idType = "";
            let idNum = "";
            if (profile.id_proof && profile.id_proof.includes(":")) {
                const parts = profile.id_proof.split(":");
                idType = parts[0].trim();
                idNum = parts[1] ? parts[1].trim() : "";
            }

            // Bulk update the entire personal details section at once
            setData("form_data", {
                ...data.form_data,
                personal_details: {
                    ...(data.form_data?.personal_details || {}),
                    first_name: nameParts[0] || "",
                    last_name: nameParts.slice(1).join(" ") || "",
                    email: user.email || "",
                    fathers_name: profile.father_name || "",
                    dob: profile.date_of_birth || "",
                    gender: profile.gender || "",
                    marital_status: profile.marital_status || "",
                    category: profile.category || "",
                    nationality: profile.nationality || "Indian",
                    id_proof_type: idType,
                    id_proof_number: idNum,
                    alt_email: profile.alt_email || "",
                    phone: profile.phone || "",
                    alt_phone: profile.alt_phone || "",
                    corr_address: profile.corr_address || "",
                    corr_city: profile.corr_city || "",
                    corr_state: profile.corr_state || "",
                    corr_pincode: profile.corr_pincode || "",
                    corr_country: profile.corr_country || "India",
                    perm_address: profile.perm_address || "",
                    perm_city: profile.perm_city || "",
                    perm_state: profile.perm_state || "",
                    perm_pincode: profile.perm_pincode || "",
                    perm_country: profile.perm_country || "India",
                },
            });
            initialized.current = true;
        }
    }, [p.email, user, profile, data.form_data, setData]);

    // Copy Address Logic
    const copyAddress = () => {
        if (setData) {
            // Bulk update is safer for React state batching
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
        } else {
            // Fallback if setData somehow isn't passed
            const fields = ["address", "city", "state", "country", "pincode"];
            fields.forEach((field) => {
                updateFormData(
                    "personal_details",
                    `perm_${field}`,
                    p[`corr_${field}`] || "",
                );
            });
        }
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
                                <option value="AADHAR">AADHAR</option>
                                <option value="PAN">PAN</option>
                                <option value="PASSPORT">Passport</option>
                                <option value="VOTER_ID">Voter ID</option>
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
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyAddress}
                            className="text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            <Copy className="h-3 w-3 mr-1.5" /> Same as
                            Correspondence
                        </Button>
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
