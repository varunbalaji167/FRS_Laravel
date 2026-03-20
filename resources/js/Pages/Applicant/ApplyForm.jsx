import { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
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
} from "lucide-react";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import ToastListener from "@/Components/ToastListener";
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
export default function ApplyForm({
    advertisement,
    existingDraft,
    existingDepartment,
    existingGrade,
}) {
    const [currentStep, setCurrentStep] = useState(
        existingDraft?.current_step || 1,
    );
    const [localErrors, setLocalErrors] = useState({});

    const { data, setData, post, processing, errors } = useForm({
        department: existingDepartment || "",
        grade: existingGrade || "",
        documents: {},
        form_data: existingDraft || {
            current_step: 1,
            personal_details: {
                first_name: "",
                last_name: "",
                dob: "",
                gender: "",
                phone: "",
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

    const updateFormData = (section, field, value) => {
        setData((prevData) => ({
            ...prevData,
            form_data: {
                ...prevData.form_data,
                [section]: {
                    ...prevData.form_data[section],
                    [field]: value,
                },
            },
        }));
    };

    const saveDraftQuietly = (showToast = false, stepToSave = currentStep) => {
        const payload = {
            department: data.department,
            grade: data.grade,
            form_data: { ...data.form_data, current_step: stepToSave },
        };

        router.post(route("applicant.draft", advertisement.id), payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setData("form_data", payload.form_data);
                if (showToast)
                    toast.success(
                        "Draft saved successfully! You can safely leave and return later.",
                    );
            },
        });
    };

    // --- THE GATEKEEPER ---
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
            if (!p.first_name) {
                newErrors.first_name = "Required";
                isValid = false;
            }
            if (!p.last_name) {
                newErrors.last_name = "Required";
                isValid = false;
            }
            if (!p.dob) {
                newErrors.dob = "Required";
                isValid = false;
            }
            if (!p.gender) {
                newErrors.gender = "Required";
                isValid = false;
            }
            if (!p.category) {
                newErrors.category = "Required";
                isValid = false;
            }
            if (!p.nationality) {
                newErrors.nationality = "Required";
                isValid = false;
            }
            if (!p.email) {
                newErrors.email = "Required";
                isValid = false;
            }
            if (!p.phone || p.phone.length < 10) {
                newErrors.phone = "10-digit number required";
                isValid = false;
            }
        }

        if (step === 3) {
            const phd = data.form_data.education?.phd || {};
            if (!phd.university) {
                newErrors["phd.university"] = "Required";
                isValid = false;
            }
            if (!phd.department) {
                newErrors["phd.department"] = "Required";
                isValid = false;
            }
            if (!phd.year_joining) {
                newErrors["phd.year_joining"] = "Required";
                isValid = false;
            }
        }

        if (step === 4) {
            const emp = data.form_data.employment || {};
            const present = emp.present || {};

            if (!present.position) {
                newErrors["present.position"] = "Required";
                isValid = false;
            }
            if (!present.organization) {
                newErrors["present.organization"] = "Required";
                isValid = false;
            }
            if (!present.date_joining) {
                newErrors["present.date_joining"] = "Required";
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

            if (!spec.area_of_specialization) {
                newErrors["spec.area"] = "Area of Specialization is required";
                isValid = false;
            }
            if (!spec.current_area_of_research) {
                newErrors["spec.current"] =
                    "Current Area of Research is required";
                isValid = false;
            }
        }

        if (step === 8) {
            const statements = data.form_data.statements || {};
            if (
                !statements.research_plan ||
                statements.research_plan.trim().length === 0
            ) {
                newErrors["statements.research_plan"] =
                    "Research plan is required.";
                isValid = false;
            }
            if (
                !statements.teaching_plan ||
                statements.teaching_plan.trim().length === 0
            ) {
                newErrors["statements.teaching_plan"] =
                    "Teaching plan is required.";
                isValid = false;
            }
        }
        if (step === 10) {
            const refs = data.form_data.referees_section?.referees || [];
            if (refs.length < 3) {
                newErrors["referees"] = "You must provide at least 3 referees.";
                isValid = false;
            } else {
                // Ensure the first 3 referees have all mandatory fields filled
                for (let i = 0; i < 3; i++) {
                    const r = refs[i];
                    if (
                        !r.name ||
                        !r.position ||
                        !r.association ||
                        !r.institute ||
                        !r.email
                    ) {
                        newErrors[`referee_${i}_name`] = "Missing fields";
                        newErrors["referees"] =
                            "Please fill all required fields for the first 3 referees.";
                        isValid = false;
                    }
                }
            }
        }

        setLocalErrors(newErrors);
        if (!isValid)
            toast.error("Please fill all required fields before proceeding.");
        return isValid;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return; // Block moving forward if invalid!
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

    const submitFinal = (e) => {
        e.preventDefault();

        // Final Declaration Check
        if (!data.form_data.declaration) {
            setLocalErrors({
                declaration:
                    "You must agree to the final declaration before submitting.",
            });
            toast.error("Please agree to the final declaration.");
            return;
        }

        // Post the form. Inertia automatically converts data.documents files into a FormData payload!
        post(route("applicant.store", advertisement.id));
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1Position
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                        advertisement={advertisement}
                    />
                );
            case 2:
                return (
                    <Step2Personal
                        data={data}
                        setData={setData}
                        updateFormData={updateFormData}
                        localErrors={localErrors}
                    />
                );
            case 3:
                return (
                    <Step3Education
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
            case 4:
                return (
                    <Step4Employment
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
            case 5:
                return (
                    <Step5Research
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
            case 6:
                return (
                    <Step6AdditionalInfo
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
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
            case 7:
                return (
                    <Step7AwardsProjects
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
            case 8:
                return (
                    <Step8Statements
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
            case 9:
                return (
                    <Step9DetailedPubs
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
            case 10:
                return (
                    <Step10Referees
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
            case 11:
                return (
                    <Step11Documents
                        data={data}
                        setData={setData}
                        localErrors={localErrors}
                    />
                );
        }
    };

    return (
        <ApplicantLayout>
            <ToastListener />
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
                                            setCurrentStep(step.id);
                                            saveDraftQuietly(false, step.id);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                            isActive
                                                ? "bg-blue-600 text-white shadow-md"
                                                : isCompleted
                                                  ? "bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200"
                                                  : "bg-slate-50 text-slate-400 cursor-not-allowed"
                                        }`}
                                        disabled={
                                            !isActive &&
                                            !isCompleted &&
                                            step.id > currentStep
                                        }
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
                                        className="font-bold text-slate-600 border-slate-300 hover:bg-slate-100"
                                    >
                                        <Save className="mr-2 h-4 w-4" /> Save
                                        Draft & Exit
                                    </Button>
                                </div>
                                <div className="flex gap-3">
                                    {currentStep > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={handlePrev}
                                            className="font-bold"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />{" "}
                                            Previous
                                        </Button>
                                    )}
                                    {currentStep < STEPS.length ? (
                                        <Button
                                            onClick={handleNext}
                                            className="bg-blue-600 text-white font-bold hover:bg-blue-700"
                                        >
                                            Save & Continue{" "}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={submitFinal}
                                            disabled={processing}
                                            className="bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                                        >
                                            Submit Final Application{" "}
                                            <CheckCircle2 className="ml-2 h-4 w-4" />
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
