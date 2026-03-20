import { useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/Components/ui/card";
import {
    Calendar,
    Send,
    Loader2,
    FileText,
    Hash,
    UploadCloud,
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";

const DEPARTMENTS = [
    "Astronomy, Astrophysics and Space Engineering",
    "Chemical engineering",
    "Chemistry",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Humanities and Social Sciences",
    "Mathematics",
    "Mechanical Engineering",
    "Mehta Family School of Biosciences and Biomedical Engineering",
    "Mehta Family School of Sustainability",
    "Metallurgical Engineering and Materials Science",
    "Physics",
    "School of Innovation",
];

const GRADES = [
    "Assistant Professor Grade II",
    "Assistant Professor Grade I",
    "Associate Professor",
    "Professor",
];

export default function CreateJob() {
    const fileInputRef = useRef(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        reference_number: "",
        title: "",
        deadline: "",
        document: null,
        departments: {},
    });
    const handleDepartmentToggle = (dept) => {
        let updated = { ...data.departments };
        if (updated[dept]) {
            delete updated[dept];
        } else {
            updated[dept] = [];
        }
        setData("departments", updated);
    };

    const handleGradeToggle = (dept, grade) => {
        let updated = { ...data.departments };
        if (updated[dept].includes(grade)) {
            updated[dept] = updated[dept].filter((g) => g !== grade);
        } else {
            updated[dept].push(grade);
        }
        setData("departments", updated);
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors();

        const selectedDepts = Object.keys(data.departments);

        if (selectedDepts.length === 0) {
            setError("departments", "You must select at least one department.");
            return;
        }

        for (const dept of selectedDepts) {
            if (data.departments[dept].length === 0) {
                setError(
                    "departments",
                    `You checked "${dept}" but didn't select any grades for it!`,
                );
                return;
            }
        }

        post(route("admin.jobs.store"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                }
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Post Advertisement" />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <Card className="shadow-lg border-none ring-1 ring-slate-200 overflow-hidden">
                    <div className="bg-indigo-600 h-2 w-full"></div>
                    <CardHeader className="bg-white pb-8">
                        <CardTitle className="text-3xl font-serif text-slate-900">
                            Post Recruitment Advertisement
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-slate-500 mt-2">
                            Upload a consolidated recruitment PDF and select the
                            exact roles available for each department.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent className="space-y-8 pt-6 bg-slate-50/80 border-t border-slate-100">
                            {/* Row 1: Advt Number & Title */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="reference_number"
                                        className="font-bold text-slate-800"
                                    >
                                        Advertisement Number
                                    </Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="reference_number"
                                            value={data.reference_number}
                                            onChange={(e) =>
                                                setData(
                                                    "reference_number",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. IITI/FACREC/2025/DEC/08"
                                            className={`pl-10 bg-white border-slate-200 shadow-sm transition-colors ${errors.reference_number ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-600"}`}
                                        />
                                    </div>
                                    {errors.reference_number && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.reference_number}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="title"
                                        className="font-bold text-slate-800"
                                    >
                                        Display Title
                                    </Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            placeholder="e.g. Special Recruitment Drive for SC/ST"
                                            className={`pl-10 bg-white border-slate-200 shadow-sm transition-colors ${errors.title ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-600"}`}
                                        />
                                    </div>
                                    {errors.title && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Deadline & File Upload */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="deadline"
                                        className="font-bold text-slate-800"
                                    >
                                        Application Deadline
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={data.deadline}
                                            onChange={(e) =>
                                                setData(
                                                    "deadline",
                                                    e.target.value,
                                                )
                                            }
                                            className={`pl-10 bg-white border-slate-200 shadow-sm transition-colors ${errors.deadline ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-600"}`}
                                        />
                                    </div>
                                    {errors.deadline && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.deadline}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="document"
                                        className="font-bold text-slate-800"
                                    >
                                        Upload PDF Advertisement
                                    </Label>
                                    <div className="relative flex items-center">
                                        <UploadCloud className="absolute left-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="document"
                                            type="file"
                                            accept="application/pdf"
                                            ref={fileInputRef}
                                            onChange={(e) =>
                                                setData(
                                                    "document",
                                                    e.target.files[0],
                                                )
                                            }
                                            className={`pl-10 bg-white border-slate-200 shadow-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${errors.document ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        />
                                    </div>
                                    {errors.document && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.document}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: SMART Department & Grade Checkboxes */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <Label className="font-bold text-slate-800 text-lg">
                                    Applicable Departments & Roles
                                </Label>
                                <p className="text-sm text-slate-500">
                                    Select a department, then select the
                                    specific grades available for that
                                    department.
                                </p>

                                <div className="grid grid-cols-1 gap-4">
                                    {DEPARTMENTS.map((dept) => {
                                        const isSelected =
                                            data.departments.hasOwnProperty(
                                                dept,
                                            );
                                        return (
                                            <div
                                                key={dept}
                                                className={`border rounded-lg transition-all ${isSelected ? "border-indigo-500 bg-indigo-50/30 shadow-sm" : "border-slate-200 bg-white"}`}
                                            >
                                                {/* Department Toggle */}
                                                <label className="flex items-center gap-3 cursor-pointer p-4">
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 rounded border-2 border-slate-300 checked:bg-indigo-600 transition-all"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            handleDepartmentToggle(
                                                                dept,
                                                            )
                                                        }
                                                    />
                                                    <span
                                                        className={`font-bold ${isSelected ? "text-indigo-900" : "text-slate-700"}`}
                                                    >
                                                        {dept}
                                                    </span>
                                                </label>

                                                {/* Grades Sub-menu (Appears only when department is checked) */}
                                                {isSelected && (
                                                    <div className="px-12 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {GRADES.map((grade) => (
                                                            <label
                                                                key={grade}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                                                                    checked={data.departments[
                                                                        dept
                                                                    ].includes(
                                                                        grade,
                                                                    )}
                                                                    onChange={() =>
                                                                        handleGradeToggle(
                                                                            dept,
                                                                            grade,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="text-sm text-slate-600">
                                                                    {grade}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.departments && (
                                    <p className="text-sm font-medium text-red-500 mt-2">
                                        You must select at least one department
                                        and assign at least one grade to it.
                                    </p>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="bg-white border-t p-6 mt-0 flex justify-end gap-4 rounded-b-lg">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />{" "}
                                        Publish Advertisement
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AdminLayout>
    );
}
