import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

export default function Step7AwardsProjects({
    data,
    setData,
    localErrors = {},
}) {
    const ap = data.form_data.awards_projects || {};
    const awards = ap.awards || [];
    const phd_supervision = ap.phd_supervision || [];
    const pg_supervision = ap.pg_supervision || [];
    const ug_supervision = ap.ug_supervision || [];
    const sponsored_projects = ap.sponsored_projects || [];
    const consultancy_projects = ap.consultancy_projects || [];

    const updateApSection = (section, newValue) => {
        setData("form_data", {
            ...data.form_data,
            awards_projects: { ...ap, [section]: newValue },
        });
    };

    const handleArrayChange = (section, index, field, value) => {
        const currentArray = [...(ap[section] || [])];
        currentArray[index] = { ...currentArray[index], [field]: value };
        updateApSection(section, currentArray);
    };

    const addArrayItem = (section, template) => {
        const currentArray = [...(ap[section] || [])];
        currentArray.push(template);
        updateApSection(section, currentArray);
    };

    const removeArrayItem = (section, index) => {
        const currentArray = [...(ap[section] || [])];
        currentArray.splice(index, 1);
        updateApSection(section, currentArray);
    };

    // Generic Row for PhD, Master's, and Bachelor's Supervision
    const renderSupervisionRow = (section, item, idx) => (
        <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 pl-12 bg-white border rounded-lg relative mt-2 shadow-sm"
        >
            {/* Visual Serial Number */}
            <div className="absolute top-4 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                {idx + 1}
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem(section, idx)}
                className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2 md:col-span-2">
                <Label>Name of Student/Scholar</Label>
                <Input
                    value={item.student_name || ""}
                    onChange={(e) =>
                        handleArrayChange(
                            section,
                            idx,
                            "student_name",
                            e.target.value,
                        )
                    }
                />
            </div>
            <div className="space-y-2 md:col-span-2 pr-8">
                <Label>Title of the Thesis/Project</Label>
                <Input
                    value={item.title || ""}
                    onChange={(e) =>
                        handleArrayChange(section, idx, "title", e.target.value)
                    }
                />
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <Input
                    value={item.role || ""}
                    onChange={(e) =>
                        handleArrayChange(section, idx, "role", e.target.value)
                    }
                    placeholder="e.g. Supervisor"
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Ongoing / Completed</Label>
                <Input
                    value={item.status || ""}
                    onChange={(e) =>
                        handleArrayChange(
                            section,
                            idx,
                            "status",
                            e.target.value,
                        )
                    }
                />
            </div>
            <div className="space-y-2 md:col-span-3">
                <Label>Ongoing Since / Year of Completion</Label>
                <Input
                    value={item.year || ""}
                    onChange={(e) =>
                        handleArrayChange(section, idx, "year", e.target.value)
                    }
                />
            </div>
        </div>
    );

    // Generic Row for Sponsored and Consultancy Projects
    const renderProjectRow = (section, item, idx) => (
        <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 pl-12 bg-white border rounded-lg relative mt-2 shadow-sm"
        >
            {/* Visual Serial Number */}
            <div className="absolute top-4 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                {idx + 1}
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem(section, idx)}
                className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2 md:col-span-2">
                <Label>Sponsoring Agency</Label>
                <Input
                    value={item.agency || ""}
                    onChange={(e) =>
                        handleArrayChange(
                            section,
                            idx,
                            "agency",
                            e.target.value,
                        )
                    }
                />
            </div>
            <div className="space-y-2 md:col-span-3 pr-8">
                <Label>Title of the Project</Label>
                <Input
                    value={item.title || ""}
                    onChange={(e) =>
                        handleArrayChange(section, idx, "title", e.target.value)
                    }
                />
            </div>
            <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                    value={item.amount || ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        // Allows only digits and a single decimal point
                        if (/^\d*\.?\d*$/.test(val)) {
                            handleArrayChange(section, idx, "amount", val);
                        }
                    }}
                    placeholder="₹"
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Period (From - To)</Label>
                <Input
                    value={item.period || ""}
                    onChange={(e) =>
                        handleArrayChange(
                            section,
                            idx,
                            "period",
                            e.target.value,
                        )
                    }
                    placeholder="e.g. 2021 - 2024"
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Role</Label>
                <Input
                    value={item.role || ""}
                    onChange={(e) =>
                        handleArrayChange(section, idx, "role", e.target.value)
                    }
                    placeholder="e.g. PI, Co-PI"
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Status</Label>
                <Input
                    value={item.status || ""}
                    onChange={(e) =>
                        handleArrayChange(
                            section,
                            idx,
                            "status",
                            e.target.value,
                        )
                    }
                    placeholder="Ongoing / Completed"
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                {/* Main Header with correct sequential numbering */}
                <h3 className="text-2xl font-bold text-slate-900">
                    6. Awards, Supervision & Projects
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Provide details of recognitions, student guidance, and
                    funded research.
                </p>
            </div>

            {/* (A) Awards and Recognitions */}
            <div className="space-y-4 bg-amber-50 p-5 rounded-xl border border-amber-100">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                    <h4 className="font-bold text-lg text-amber-900">
                        (A) Award(s) and Recognition(s)
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("awards", {
                                name: "",
                                awarded_by: "",
                                year: "",
                            })
                        }
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Award
                    </Button>
                </div>
                {awards.map((item, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 pl-12 bg-white border border-amber-100 rounded-lg relative mt-2 shadow-sm"
                    >
                        <div className="absolute top-4 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                            {idx + 1}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("awards", idx)}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Name of the Award</Label>
                            <Input
                                value={item.name || ""}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "awards",
                                        idx,
                                        "name",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2 pr-8">
                            <Label>Awarded By</Label>
                            <Input
                                value={item.awarded_by || ""}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "awards",
                                        idx,
                                        "awarded_by",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Input
                                type="number"
                                value={item.year || ""}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "awards",
                                        idx,
                                        "year",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* (B) Research Supervision */}
            <div className="space-y-6">
                <h4 className="font-bold text-xl text-slate-800 border-b pb-2">
                    (B) Research Supervision
                </h4>

                {/* (i) PhD */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-slate-700">
                            (i) PhD Thesis Supervision
                        </h5>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                addArrayItem("phd_supervision", {
                                    student_name: "",
                                    title: "",
                                    role: "",
                                    status: "",
                                    year: "",
                                })
                            }
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add PhD
                        </Button>
                    </div>
                    {phd_supervision.map((item, idx) =>
                        renderSupervisionRow("phd_supervision", item, idx),
                    )}
                </div>

                {/* (ii) Masters */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-slate-700">
                            (ii) M.Tech/M.E./Master's Thesis Supervision
                        </h5>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                addArrayItem("pg_supervision", {
                                    student_name: "",
                                    title: "",
                                    role: "",
                                    status: "",
                                    year: "",
                                })
                            }
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Master's
                        </Button>
                    </div>
                    {pg_supervision.map((item, idx) =>
                        renderSupervisionRow("pg_supervision", item, idx),
                    )}
                </div>

                {/* (iii) Bachelors */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-slate-700">
                            (iii) B.Tech/B.E./Bachelor's Project Supervision
                        </h5>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                addArrayItem("ug_supervision", {
                                    student_name: "",
                                    title: "",
                                    role: "",
                                    status: "",
                                    year: "",
                                })
                            }
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add
                            Bachelor's
                        </Button>
                    </div>
                    {ug_supervision.map((item, idx) =>
                        renderSupervisionRow("ug_supervision", item, idx),
                    )}
                </div>
            </div>

            {/* (C) Sponsored Projects / Consultancy Details */}
            <div className="space-y-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-xl text-slate-800 border-b border-slate-200 pb-2">
                    (C) Sponsored Projects / Consultancy Details
                </h4>

                {/* (i) Sponsored Projects */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-slate-700">
                            (i) Sponsored Projects
                        </h5>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                addArrayItem("sponsored_projects", {
                                    agency: "",
                                    title: "",
                                    amount: "",
                                    period: "",
                                    role: "",
                                    status: "",
                                })
                            }
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                        </Button>
                    </div>
                    {sponsored_projects.map((item, idx) =>
                        renderProjectRow("sponsored_projects", item, idx),
                    )}
                </div>

                {/* (ii) Consultancy Projects */}
                <div className="space-y-2 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-slate-700">
                            (ii) Consultancy Projects
                        </h5>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                addArrayItem("consultancy_projects", {
                                    agency: "",
                                    title: "",
                                    amount: "",
                                    period: "",
                                    role: "",
                                    status: "",
                                })
                            }
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add
                            Consultancy
                        </Button>
                    </div>
                    {consultancy_projects.map((item, idx) =>
                        renderProjectRow("consultancy_projects", item, idx),
                    )}
                </div>
            </div>
        </div>
    );
}
