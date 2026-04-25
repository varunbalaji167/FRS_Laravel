import { useState } from "react";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    User,
    Briefcase,
    GraduationCap,
    FileText,
    Save,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Building2,
    BookOpen,
    Award,
    Trophy,
    PenTool,
    UploadCloud,
    FileSpreadsheet,
    Users,
    Loader2,
} from "lucide-react";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { toast } from "sonner";

import Step1Position from "./Steps/Step1Position";
import Step2Personal from "./Steps/Step2Personal";
import Step3Education from "./Steps/Step3Education";
import Step4Employment from "./Steps/Step4Employment";
import Step5Research from "./Steps/Step5Research";
import Step6AdditionalInfo from "./Steps/Step6AdditionalInfo";
import Step7AwardsProjects from "./Steps/Step7AwardsProjects";
import Step8Statements from "./Steps/Step8Statements";
import Step9DetailedPubs from "./Steps/Step9DetailedPubs";
import Step10Referees from "./Steps/Step10Referees";
import Step11Documents from "./Steps/Step11Documents";

const STEPS = [
    { id: 1, title: "Position Details", icon: Building2 },
    { id: 2, title: "Personal Information", icon: User },
    { id: 3, title: "Education History", icon: GraduationCap },
    { id: 4, title: "Employment & Experience", icon: Briefcase },
    { id: 5, title: "Research & Publications", icon: BookOpen },
    { id: 6, title: "Additional Info", icon: Award },
    { id: 7, title: "Awards & Projects", icon: Trophy },
    { id: 8, title: "Statements & Plans", icon: PenTool },
    { id: 9, title: "Detailed Pubs", icon: FileSpreadsheet },
    { id: 10, title: "Referees", icon: Users },
    { id: 11, title: "Documents & Submit", icon: UploadCloud },
];

// Email regex used consistently across frontend validations
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ApplyForm({
    advertisement,
    existingDraft,
    existingDepartment,
    existingGrade,
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const profile = user.applicant_profile || {};

    const [currentStep, setCurrentStep] = useState(
        existingDraft?.current_step ? Number(existingDraft.current_step) : 1,
    );
    const [localErrors, setLocalErrors] = useState({});
    // Tracks when a quiet background draft-save is in flight
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const idParts = (profile.id_proof || "").split(":");

    const { data, setData, post, processing, errors } = useForm({
        department: existingDepartment || "",
        grade: existingGrade || "",
        documents: {},
        best_papers: {},
        form_data: existingDraft || {
            current_step: 1,
            personal_details: {
                profile_image: profile.photo_path || "",
                first_name: (user.name || "").split(" ")[0] || "",
                last_name:
                    (user.name || "").split(" ").slice(1).join(" ") || "",
                email: user.email || "",
                fathers_name: profile.father_name || "",
                dob: profile.date_of_birth || "",
                gender: profile.gender || "",
                marital_status: profile.marital_status || "",
                category: profile.category || "",
                nationality: profile.nationality || "Indian",
                id_proof_type: idParts[0]?.trim() || "",
                id_proof_number: idParts[1]?.trim() || "",
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
            education: {},
            employment: {},
            research: {},
            additional_info: {},
            awards_projects: {},
            statements: {},
            detailed_pubs: {},
            referees_section: {},
        },
    });

    const combinedErrors = { ...errors, ...localErrors };

    const updateFormData = (section, field, value) => {
        setData("form_data", {
            ...data.form_data,
            [section]: {
                ...data.form_data[section],
                [field]: value,
            },
        });
    };

    // -------------------------------------------------------------------
    // DRAFT SAVE — no validation required; tracks loading state
    // -------------------------------------------------------------------
    const saveDraftQuietly = (showToast = false, stepToSave = currentStep) => {
        const payload = {
            department: data.department,
            grade: data.grade,
            form_data: { ...data.form_data, current_step: stepToSave },
        };

        setIsSavingDraft(true);
        router.post(route("applicant.draft", advertisement.id), payload, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setData("form_data", payload.form_data);
                if (showToast)
                    toast.success(
                        "Draft saved successfully! You can safely leave and return later.",
                    );
            },
            onError: () => {
                toast.error("Failed to save draft. Please check your inputs.");
            },
            onFinish: () => setIsSavingDraft(false),
        });
    };

    // -------------------------------------------------------------------
    // FRONTEND VALIDATION GATEKEEPER
    // -------------------------------------------------------------------
    const validateStep = (step) => {
        let isValid = true;
        let newErrors = {};

        if (step === 1) {
            if (!data.department) {
                newErrors.department = "Required";
                isValid = false;
            }
            if (!data.grade) {
                newErrors.grade = "Required";
                isValid = false;
            }
        }

        if (step === 2) {
            const p = data.form_data.personal_details || {};
            if (!p.first_name?.trim()) {
                newErrors.first_name = "First name is required";
                isValid = false;
            }
            if (!p.last_name?.trim()) {
                newErrors.last_name = "Last name is required";
                isValid = false;
            }
            if (!p.dob) {
                newErrors.dob = "Date of birth is required";
                isValid = false;
            }
            if (!p.gender) {
                newErrors.gender = "Gender is required";
                isValid = false;
            }
            if (!p.category) {
                newErrors.category = "Category is required";
                isValid = false;
            }
            if (!p.nationality) {
                newErrors.nationality = "Nationality is required";
                isValid = false;
            }
            if (!p.email?.trim()) {
                newErrors.email = "Email is required";
                isValid = false;
            } else if (!EMAIL_REGEX.test(p.email.trim())) {
                newErrors.email = "Invalid email format";
                isValid = false;
            }
            if (p.alt_email?.trim() && !EMAIL_REGEX.test(p.alt_email.trim())) {
                newErrors.alt_email = "Invalid alternate email format";
                isValid = false;
            }
            if (!p.phone || String(p.phone).replace(/\D/g, "").length < 10) {
                newErrors.phone = "10-digit phone number required";
                isValid = false;
            }
        }

        if (step === 3) {
            const phd = data.form_data.education?.phd || {};

            if (!phd.university?.trim()) {
                newErrors["phd.university"] = "University is required";
                isValid = false;
            }

            if (!phd.department?.trim()) {
                newErrors["phd.department"] = "Department is required";
                isValid = false;
            }
            if (!phd.date_joining) {
                newErrors["phd.date_joining"] = "Date of joining is required";
                isValid = false;
            } else {
                const joiningDate = new Date(phd.date_joining);
                const currentYear = new Date().getFullYear();

                if (
                    isNaN(joiningDate.getTime()) ||
                    joiningDate.getFullYear() < 1950 ||
                    joiningDate.getFullYear() > currentYear
                ) {
                    newErrors["phd.date_joining"] = "Enter a valid date";
                    isValid = false;
                }
            }
        }

        if (step === 4) {
            const emp = data.form_data.employment || {};
            const present = emp.present || {};

            if (!present.position?.trim()) {
                newErrors["present.position"] = "Position is required";
                isValid = false;
            }
            if (!present.organization?.trim()) {
                newErrors["present.organization"] = "Organization is required";
                isValid = false;
            }
            if (!present.date_joining) {
                newErrors["present.date_joining"] =
                    "Date of joining is required";
                isValid = false;
            }

            if (!emp.has_three_years_exp) {
                newErrors["emp.has_three_years_exp"] =
                    "Please select Yes or No";
                isValid = false;
            }
        }

        if (step === 5) {
            const res = data.form_data.research || {};
            const spec = res.specialization || {};

            if (!spec.area_of_specialization?.trim()) {
                newErrors["spec.area"] = "Area of Specialization is required";
                isValid = false;
            }
            if (!spec.current_area_of_research?.trim()) {
                newErrors["spec.current"] =
                    "Current Area of Research is required";
                isValid = false;
            }
        }

        if (step === 8) {
            const statements = data.form_data.statements || {};
            if (!statements.research_plan?.trim()) {
                newErrors["statements.research_plan"] =
                    "Research contribution & future plans are required";
                isValid = false;
            }
            if (!statements.teaching_plan?.trim()) {
                newErrors["statements.teaching_plan"] =
                    "Teaching contribution & future plans are required";
                isValid = false;
            }
        }

        if (step === 10) {
            const refs = data.form_data.referees_section?.referees || [];

            if (refs.length < 3) {
                newErrors["referees"] = "You must provide at least 3 referees.";
                isValid = false;
            } else {
                for (let i = 0; i < refs.length; i++) {
                    const r = refs[i];
                    const isMandatory = i < 3;

                    if (isMandatory && !r.name?.trim()) {
                        newErrors[`referee_${i}_name`] = "Name is required";
                        isValid = false;
                    }
                    if (isMandatory && !r.position?.trim()) {
                        newErrors[`referee_${i}_position`] =
                            "Position is required";
                        isValid = false;
                    }
                    if (isMandatory && !r.association?.trim()) {
                        newErrors[`referee_${i}_association`] =
                            "Association is required";
                        isValid = false;
                    }
                    if (isMandatory && !r.institute?.trim()) {
                        newErrors[`referee_${i}_institute`] =
                            "Institute is required";
                        isValid = false;
                    }
                    if (isMandatory && !r.email?.trim()) {
                        newErrors[`referee_${i}_email`] = "Email is required";
                        isValid = false;
                    } else if (
                        r.email?.trim() &&
                        !EMAIL_REGEX.test(r.email.trim())
                    ) {
                        newErrors[`referee_${i}_email`] =
                            "Invalid email format";
                        isValid = false;
                    }
                    if (isMandatory && !r.contact_number) {
                        newErrors[`referee_${i}_contact`] =
                            "Contact number is required";
                        isValid = false;
                    } else if (
                        r.contact_number &&
                        String(r.contact_number).replace(/\D/g, "").length !==
                            10
                    ) {
                        newErrors[`referee_${i}_contact`] =
                            "Phone must be exactly 10 digits";
                        isValid = false;
                    }
                }

                if (!isValid && !newErrors["referees"]) {
                    newErrors["referees"] =
                        "Please fill all required fields for at least 3 referees.";
                }
            }
        }

        if (step === 11) {
            if (!data.form_data.declaration) {
                newErrors.declaration =
                    "You must agree to the final declaration before submitting.";
                isValid = false;
            }
            const docs = data.documents || {};
            if (!docs.phd_cert) {
                newErrors.phd_cert = "PhD Certificate is required";
                isValid = false;
            }
            if (!docs.ssc_cert) {
                newErrors.ssc_cert = "10th/SSC Certificate is required";
                isValid = false;
            }
            if (!docs.signature) {
                newErrors.signature = "Digital signature is required";
                isValid = false;
            }
        }

        setLocalErrors(newErrors);
        if (!isValid)
            toast.error("Please fill all required fields before proceeding.");
        return isValid;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;

        setLocalErrors({});
        const nextStep = Math.min(currentStep + 1, STEPS.length);
        setCurrentStep(nextStep);
        saveDraftQuietly(false, nextStep);
    };

    const handlePrev = () => {
        setLocalErrors({});
        const prevStep = Math.max(currentStep - 1, 1);
        setCurrentStep(prevStep);
        saveDraftQuietly(false, prevStep);
    };

    // -------------------------------------------------------------------
    // FINAL SUBMIT
    // -------------------------------------------------------------------
    const submitFinal = (e) => {
        e.preventDefault();

        if (!validateStep(11)) return;

        post(route("applicant.store", advertisement.id), {
            forceFormData: true,
            onError: () => {
                toast.error(
                    "Submission failed! Please check the highlighted fields.",
                );
            },
        });
    };

    const isBusy = isSavingDraft || processing;

    // Use combinedErrors instead of localErrors for all steps
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1Position
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                        advertisement={advertisement}
                    />
                );
            case 2:
                return (
                    <Step2Personal
                        data={data}
                        setData={setData}
                        updateFormData={updateFormData}
                        localErrors={combinedErrors}
                        profile={profile}
                        user={user}
                    />
                );
            case 3:
                return (
                    <Step3Education
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 4:
                return (
                    <Step4Employment
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 5:
                return (
                    <Step5Research
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 6:
                return (
                    <Step6AdditionalInfo
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 7:
                return (
                    <Step7AwardsProjects
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 8:
                return (
                    <Step8Statements
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 9:
                return (
                    <Step9DetailedPubs
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 10:
                return (
                    <Step10Referees
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            case 11:
                return (
                    <Step11Documents
                        data={data}
                        setData={setData}
                        localErrors={combinedErrors}
                    />
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in">
                        <FileText className="h-16 w-16 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">
                            More sections coming soon!
                        </h3>
                    </div>
                );
        }
    };

    return (
        <ApplicantLayout>
            <Head title={`Apply - ${advertisement.reference_number}`} />

            <div className="bg-slate-900 py-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-2">
                        Ref: {advertisement.reference_number}
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-white sm:text-3xl">
                        Application Wizard
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64 shrink-0">
                        <div className="sticky top-8 space-y-2">
                            {STEPS.map((step) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => {
                                            if (
                                                step.id > currentStep &&
                                                !validateStep(currentStep)
                                            )
                                                return;
                                            setLocalErrors({});
                                            setCurrentStep(step.id);
                                            saveDraftQuietly(false, step.id);
                                        }}
                                        disabled={
                                            isBusy ||
                                            (!isActive &&
                                                !isCompleted &&
                                                step.id > currentStep)
                                        }
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                            isActive
                                                ? "bg-blue-600 text-white shadow-md"
                                                : isCompleted
                                                  ? "bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200"
                                                  : "bg-slate-50 text-slate-400 cursor-not-allowed"
                                        }`}
                                    >
                                        <step.icon
                                            className={`h-5 w-5 ${isActive ? "text-white" : isCompleted ? "text-blue-600" : "text-slate-400"}`}
                                        />
                                        <span
                                            className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-700"}`}
                                        >
                                            {step.title}
                                        </span>
                                        {isCompleted && (
                                            <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1">
                        <Card className="shadow-lg border-none ring-1 ring-slate-200">
                            <CardContent className="p-8 min-h-[400px]">
                                {renderCurrentStep()}
                            </CardContent>

                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between rounded-b-lg">
                                <div>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            saveDraftQuietly(true, currentStep)
                                        }
                                        disabled={isBusy}
                                        className="font-bold text-slate-600 border-slate-300 hover:bg-slate-100"
                                    >
                                        {isSavingDraft ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                                Saving…
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />{" "}
                                                Save Draft & Exit
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex gap-3">
                                    {currentStep > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={handlePrev}
                                            disabled={isBusy}
                                            className="font-bold"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />{" "}
                                            Previous
                                        </Button>
                                    )}
                                    {currentStep < STEPS.length ? (
                                        <Button
                                            onClick={handleNext}
                                            disabled={isBusy}
                                            className="bg-blue-600 text-white font-bold hover:bg-blue-700"
                                        >
                                            {isSavingDraft ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                                    Saving…
                                                </>
                                            ) : (
                                                <>
                                                    Save & Continue{" "}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={submitFinal}
                                            disabled={isBusy}
                                            className="bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                                    Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    Submit Final Application{" "}
                                                    <CheckCircle2 className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </ApplicantLayout>
    );
}
