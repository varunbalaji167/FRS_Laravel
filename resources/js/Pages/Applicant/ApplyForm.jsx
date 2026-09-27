import { useEffect, useState } from "react";
import axios from "axios";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { flattenServerErrors } from "@/lib/errors";
import useDebouncedAutosave from "@/lib/useDebouncedAutosave";
import useBeforeUnloadGuard from "@/lib/useBeforeUnloadGuard";
import step1Schema from "./Steps/schemas/step1";
import step2Schema from "./Steps/schemas/step2";
import step3Schema from "./Steps/schemas/step3";
import step4Schema from "./Steps/schemas/step4";
import step5Schema from "./Steps/schemas/step5";
import step6Schema from "./Steps/schemas/step6";
import step7Schema from "./Steps/schemas/step7";
import step8Schema from "./Steps/schemas/step8";
import step9Schema from "./Steps/schemas/step9";
import step10Schema from "./Steps/schemas/step10";
import step11Schema from "./Steps/schemas/step11";
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

// One zod schema per step (see Steps/schemas/) — kept in sync with the
// server's Rules/Step{Name}Rules.php per docs/validation.md.
const STEP_SCHEMAS = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
    5: step5Schema,
    6: step6Schema,
    7: step7Schema,
    8: step8Schema,
    9: step9Schema,
    10: step10Schema,
    11: step11Schema,
};

// A handful of step schema field paths don't match the error keys the step
// components have always displayed against (chosen before the schemas
// existed) — remap those so inline errors keep landing on the right widget.
function toLegacyErrorKey(step, path) {
    const key = path.join(".");

    if (step === 4 && key === "has_three_years_exp") return "emp.has_three_years_exp";
    if (step === 5 && key === "specialization.area_of_specialization") return "spec.area";
    if (step === 5 && key === "specialization.current_area_of_research") return "spec.current";
    if (step === 8 && key === "research_plan") return "statements.research_plan";
    if (step === 8 && key === "teaching_plan") return "statements.teaching_plan";
    if (step === 10 && path[0] === "referees" && typeof path[1] === "number") {
        const suffix = { name: "name", position: "position", association: "association", institute: "institute", email: "email", contact_number: "contact" }[path[2]];
        if (suffix) return `referee_${path[1]}_${suffix}`;
    }
    if (step === 11 && path[0] === "documents") return path[1];

    return key;
}

function flattenZodError(step, zodError) {
    const out = {};
    for (const issue of zodError.issues) {
        out[toLegacyErrorKey(step, issue.path)] = issue.message;
    }
    if (step === 10 && Object.keys(out).some((k) => k.startsWith("referee_")) && !out.referees) {
        out.referees = "Please fill all required fields for at least 3 referees.";
    }
    return out;
}

function stripFiles(value) {
    if (value instanceof File) return undefined;
    if (Array.isArray(value)) return value.map(stripFiles);
    if (value && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            const stripped = stripFiles(v);
            if (stripped !== undefined) out[k] = stripped;
        }
        return out;
    }
    return value;
}

export default function ApplyForm({
    advertisement,
    existingDraft,
    existingDepartment,
    existingGrade,
    applicantProfile,
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const profile = applicantProfile || {};

    const [currentStep, setCurrentStep] = useState(
        existingDraft?.current_step ? Number(existingDraft.current_step) : 1,
    );
    const [localErrors, setLocalErrors] = useState({});
    // Tracks when a quiet background draft-save is in flight
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    // When the last successful draft-save (manual or autosave) completed
    const [lastSavedAt, setLastSavedAt] = useState(null);
    // 0-100 while the final multipart submit is uploading
    const [uploadProgress, setUploadProgress] = useState(null);

    const idParts = (profile.id_proof || "").split(":");

    const { data, setData, post, processing, errors, isDirty } = useForm({
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

    // The slice of `data` each step's zod schema validates against — matches
    // each schema's own shape (see Steps/schemas/step{n}.js).
    const dataForStep = (step) => {
        const fd = data.form_data || {};
        switch (step) {
            case 1:
                return { department: data.department, grade: data.grade };
            case 2:
                return fd.personal_details || {};
            case 3:
                return fd.education || {};
            case 4:
                return fd.employment || {};
            case 5:
                return fd.research || {};
            case 6:
                return fd.additional_info || {};
            case 7:
                return fd.awards_projects || {};
            case 8:
                return fd.statements || {};
            case 9:
                return fd.detailed_pubs || {};
            case 10:
                return fd.referees_section || {};
            case 11:
                return {
                    declaration: !!fd.declaration,
                    documents: data.documents || {},
                    best_papers: data.best_papers || {},
                };
            default:
                return {};
        }
    };

    // The real request body for POST /apply/{ad}/step/{n}/validate — nested
    // under `form_data.<container>` to match ValidateStepRequest's rules.
    // File fields are stripped (see stripFiles) since this is a lightweight
    // JSON probe, not a multipart upload; the final submit still validates
    // files for real.
    const payloadForStep = (step) => {
        const fd = data.form_data || {};
        switch (step) {
            case 1:
                return { department: data.department, grade: data.grade };
            case 2:
                return { form_data: { personal_details: stripFiles(fd.personal_details || {}) } };
            case 3:
                return { form_data: { education: fd.education || {} } };
            case 4:
                return { form_data: { employment: fd.employment || {} } };
            case 5:
                return { form_data: { research: fd.research || {} } };
            case 6:
                return { form_data: { additional_info: fd.additional_info || {} } };
            case 7:
                return { form_data: { awards_projects: fd.awards_projects || {} } };
            case 8:
                return { form_data: { statements: fd.statements || {} } };
            case 9:
                return { form_data: { detailed_pubs: fd.detailed_pubs || {} } };
            case 10:
                return { form_data: { referees_section: fd.referees_section || {} } };
            default:
                return {};
        }
    };

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
                setLastSavedAt(Date.now());
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
    // AUTOSAVE — 2s after the user stops typing anywhere in the form,
    // quietly persist the draft. Any pending save is flushed on unmount so a
    // quick navigate-away doesn't drop the last few keystrokes.
    // -------------------------------------------------------------------
    useDebouncedAutosave(data.form_data, () => saveDraftQuietly(false, currentStep), {
        delay: 2000,
    });

    // Warn before an accidental tab-close/refresh while unsaved edits exist.
    useBeforeUnloadGuard(isDirty);

    const [, forceTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => forceTick((n) => n + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const savedAgoLabel = (() => {
        if (!lastSavedAt) return null;
        const seconds = Math.max(0, Math.round((Date.now() - lastSavedAt) / 1000));
        if (seconds < 5) return "Saved just now";
        if (seconds < 60) return `Saved ${seconds}s ago`;
        const minutes = Math.round(seconds / 60);
        return `Saved ${minutes} min${minutes === 1 ? "" : "s"} ago`;
    })();

    // -------------------------------------------------------------------
    // VALIDATION GATEKEEPER — client zod schema first (immediate UX), then
    // the server's per-step tier (the actual security boundary; see
    // docs/validation.md). Step 11 skips the server probe — its files can't
    // be JSON-serialised for a lightweight check, and the real submit
    // request that immediately follows validates them for real.
    // -------------------------------------------------------------------
    const validateStep = async (step) => {
        const schemaFactory = STEP_SCHEMAS[step];
        if (!schemaFactory) return true;

        const currentYear = new Date().getFullYear();
        const localResult = schemaFactory(currentYear).safeParse(dataForStep(step));

        if (!localResult.success) {
            setLocalErrors(flattenZodError(step, localResult.error));
            toast.error("Please fill all required fields before proceeding.");
            return false;
        }

        setLocalErrors({});

        if (step === 11) return true;

        try {
            await axios.post(
                route("applicant.step.validate", { advertisement: advertisement.id, n: step }),
                payloadForStep(step),
            );
            return true;
        } catch (err) {
            if (! err.response) throw err;
            setLocalErrors(flattenServerErrors(err.response.data));
            toast.error("Please fix the highlighted fields before proceeding.");
            return false;
        }
    };

    const handleNext = async () => {
        if (!(await validateStep(currentStep))) return;

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
    const submitFinal = async (e) => {
        e.preventDefault();

        if (!(await validateStep(11))) return;

        post(route("applicant.store", advertisement.id), {
            forceFormData: true,
            onProgress: (event) => {
                if (event?.percentage != null) setUploadProgress(event.percentage);
            },
            onError: () => {
                toast.error(
                    "Submission failed! Please check the highlighted fields.",
                );
            },
            onFinish: () => setUploadProgress(null),
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
                        uploadProgress={uploadProgress}
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
                        <nav aria-label="Application steps" className="sticky top-8 space-y-2">
                            {STEPS.map((step) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <button
                                        key={step.id}
                                        aria-current={isActive ? "step" : undefined}
                                        onClick={async () => {
                                            if (
                                                step.id > currentStep &&
                                                !(await validateStep(currentStep))
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
                        </nav>
                    </div>

                    <div className="flex-1">
                        {/* Step-summary chips — compact overview above the fold,
                            most useful on mobile where the sidebar nav is hidden. */}
                        <div className="mb-4 flex flex-wrap gap-1.5" aria-hidden="true">
                            {STEPS.map((step) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                return (
                                    <span
                                        key={step.id}
                                        className={`h-1.5 flex-1 min-w-[8px] rounded-full ${
                                            isActive
                                                ? "bg-blue-600"
                                                : isCompleted
                                                  ? "bg-emerald-400"
                                                  : "bg-slate-200"
                                        }`}
                                        title={step.title}
                                    />
                                );
                            })}
                        </div>

                        <Card className="shadow-lg border-none ring-1 ring-slate-200">
                            <CardContent className="p-8 min-h-[400px]">
                                {renderCurrentStep()}
                            </CardContent>

                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between rounded-b-lg">
                                <div className="space-y-1.5">
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
                                    <p className="text-xs text-slate-400 pl-1">
                                        {isSavingDraft
                                            ? "Auto-saving…"
                                            : savedAgoLabel || "Not saved yet"}
                                        {" · "}Step {currentStep} of {STEPS.length}
                                        {" · "}
                                        {Math.round((currentStep / STEPS.length) * 100)}% complete
                                    </p>
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
