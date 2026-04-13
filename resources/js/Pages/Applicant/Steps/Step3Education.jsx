import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

export default function Step3Education({ data, setData, localErrors = {} }) {
    const edu = data.form_data.education || {};
    const phd = edu.phd || {
        university: "",
        department: "",
        supervisor: "",
        year_joining: "",
        date_defence: "",
        date_award: "",
        title: "",
    };
    const pg = edu.pg || [];
    const ug = edu.ug || [];
    const school =
        edu.school && edu.school.length > 0
            ? edu.school.map((item, index) => ({
                  ...item,
                  level:
                      item.level || (index === 0 ? "12th/HSC/Diploma" : "10th"),
              }))
            : [
                  {
                      level: "12th/HSC/Diploma",
                      school: "",
                      year_passing: "",
                      percentage: "",
                      division: "",
                  },
                  {
                      level: "10th",
                      school: "",
                      year_passing: "",
                      percentage: "",
                      division: "",
                  },
              ];
    const updateEduSection = (section, newValue) =>
        setData("form_data", {
            ...data.form_data,
            education: { ...edu, [section]: newValue },
        });
    const handlePhdChange = (field, value) =>
        updateEduSection("phd", { ...phd, [field]: value });

    const handleArrayChange = (section, index, field, value) => {
        const sourceArray = section === "school" ? school : edu[section] || [];

        const arr = [...sourceArray];
        arr[index] = { ...arr[index], [field]: value };

        updateEduSection(section, arr);
    };

    const addArrayItem = (section, template) =>
        updateEduSection(section, [...(edu[section] || []), template]);

    const removeArrayItem = (section, index) => {
        const arr = [...(edu[section] || [])];
        arr.splice(index, 1);
        updateEduSection(section, arr);
    };

    const renderDegreeRow = (section, index, item) => {
        // Calculate max months dynamically based on the inclusive years
        let maxMonths = "";
        const yJ = parseInt(item.year_joining);
        const yG = parseInt(item.year_graduation);

        if (!isNaN(yJ) && !isNaN(yG) && yG >= yJ) {
            maxMonths = (yG - yJ + 1) * 12; // e.g. (2025 - 2023 + 1) * 12 = 36
        }

        // Auto-clamp the duration if they type a number higher than the calculated max
        const handleDurationChange = (e) => {
            let val = e.target.value;
            if (maxMonths !== "" && parseInt(val) > maxMonths) {
                val = maxMonths.toString();
            }
            handleArrayChange(section, index, "duration", val);
        };

        return (
            <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border border-slate-200 rounded-lg relative mt-2 shadow-sm"
            >
                <div className="absolute top-2 right-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(section, index)}
                        className="text-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                        value={item.degree || ""}
                        onChange={(e) =>
                            handleArrayChange(
                                section,
                                index,
                                "degree",
                                e.target.value,
                            )
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label>University/Institute</Label>
                    <Input
                        value={item.university || ""}
                        onChange={(e) =>
                            handleArrayChange(
                                section,
                                index,
                                "university",
                                e.target.value,
                            )
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label>Subjects</Label>
                    <Input
                        value={item.subjects || ""}
                        onChange={(e) =>
                            handleArrayChange(
                                section,
                                index,
                                "subjects",
                                e.target.value,
                            )
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label>Year of Joining</Label>
                    <Input
                        value={item.year_joining || ""}
                        onChange={(e) =>
                            handleArrayChange(
                                section,
                                index,
                                "year_joining",
                                e.target.value,
                            )
                        }
                        type="number"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Year of Graduation</Label>
                    <Input
                        value={item.year_graduation || ""}
                        onChange={(e) =>
                            handleArrayChange(
                                section,
                                index,
                                "year_graduation",
                                e.target.value,
                            )
                        }
                        type="number"
                    />
                </div>

                {/* NEW FIELD: Duration */}
                <div className="flex flex-col justify-end h-full">
                    <div className="flex justify-between items-end mb-2 min-h-[20px]">
                        <Label>Duration (Months)</Label>
                        {maxMonths && (
                            <span className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                                Max: {maxMonths}
                            </span>
                        )}
                    </div>
                    <Input
                        value={item.duration || ""}
                        onChange={handleDurationChange}
                        type="number"
                        min="0"
                        max={maxMonths || undefined}
                        placeholder={
                            maxMonths ? `e.g. ${maxMonths}` : "e.g. 24"
                        }
                    />
                </div>

                {/* Percentage/CGPA */}
                <div className="flex flex-col justify-end h-full">
                    <div className="flex items-end mb-2 min-h-[20px]">
                        <Label>Percentage/CGPA</Label>
                    </div>
                    <Input
                        value={item.percentage || ""}
                        onChange={(e) =>
                            handleArrayChange(
                                section,
                                index,
                                "percentage",
                                e.target.value,
                            )
                        }
                    />
                </div>

                {/* Division/Class */}
                <div className="flex flex-col justify-end h-full">
                    <div className="flex items-end mb-2 min-h-[20px]">
                        <Label>Division/Class</Label>
                    </div>
                    <Input
                        value={item.division || ""}
                        onChange={(e) =>
                            handleArrayChange(
                                section,
                                index,
                                "division",
                                e.target.value,
                            )
                        }
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">
                    2. Educational Qualifications
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Please provide your complete academic history precisely as
                    requested.
                </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800">
                    (A) Ph.D. Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>
                            University <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={phd.university}
                            onChange={(e) =>
                                handlePhdChange("university", e.target.value)
                            }
                            className={
                                localErrors["phd.university"]
                                    ? "border-red-500"
                                    : ""
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Department <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={phd.department}
                            onChange={(e) =>
                                handlePhdChange("department", e.target.value)
                            }
                            className={
                                localErrors["phd.department"]
                                    ? "border-red-500"
                                    : ""
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Name of Supervisor</Label>
                        <Input
                            value={phd.supervisor}
                            onChange={(e) =>
                                handlePhdChange("supervisor", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Year of Joining{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            value={phd.year_joining}
                            onChange={(e) =>
                                handlePhdChange("year_joining", e.target.value)
                            }
                            className={
                                localErrors["phd.year_joining"]
                                    ? "border-red-500"
                                    : ""
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Defence</Label>
                        <Input
                            type="date"
                            value={phd.date_defence}
                            onChange={(e) =>
                                handlePhdChange("date_defence", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Award</Label>
                        <Input
                            type="date"
                            value={phd.date_award}
                            onChange={(e) =>
                                handlePhdChange("date_award", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label>Title of the Ph.D. Thesis</Label>
                        <Input
                            value={phd.title}
                            onChange={(e) =>
                                handlePhdChange("title", e.target.value)
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (B) Academic Details - PG
                    </h4>
                    {/* Updated Template to include duration */}
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("pg", {
                                degree: "",
                                university: "",
                                subjects: "",
                                year_joining: "",
                                year_graduation: "",
                                duration: "",
                                percentage: "",
                                division: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add PG
                    </Button>
                </div>
                {pg.map((item, idx) => renderDegreeRow("pg", idx, item))}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (C) Academic Details - UG
                    </h4>
                    {/* Updated Template to include duration */}
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("ug", {
                                degree: "",
                                university: "",
                                subjects: "",
                                year_joining: "",
                                year_graduation: "",
                                duration: "",
                                percentage: "",
                                division: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add UG
                    </Button>
                </div>
                {ug.map((item, idx) => renderDegreeRow("ug", idx, item))}
            </div>

            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800">
                    (D) Academic Details - School
                </h4>
                {school.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm mt-2"
                    >
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Input
                                value={item.level}
                                disabled
                                className="bg-slate-50 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>School</Label>
                            <Input
                                value={item.school}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "school",
                                        index,
                                        "school",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Year of Passing</Label>
                            <Input
                                type="number"
                                value={item.year_passing}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "school",
                                        index,
                                        "year_passing",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Percentage/CGPA</Label>
                            <Input
                                value={item.percentage}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "school",
                                        index,
                                        "percentage",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Division</Label>
                            <Input
                                value={item.division}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "school",
                                        index,
                                        "division",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
