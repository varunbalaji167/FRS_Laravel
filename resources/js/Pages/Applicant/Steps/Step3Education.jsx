import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { calculateDuration } from "@/lib/dateUtils";

export default function Step3Education({ data, setData, localErrors = {} }) {
    const edu = data.form_data.education || {};
    const phd = edu.phd || {
        university: "",
        department: "",
        supervisor: "",
        date_joining: "",
        date_defence: "",
        date_award: "",
        title: "",
        duration: "",
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

    // Get today's date string in YYYY-MM-DD format for the 'max' attribute
    const todayStr = new Date().toISOString().split("T")[0];

    const updateEduSection = (section, newValue) =>
        setData("form_data", {
            ...data.form_data,
            education: { ...edu, [section]: newValue },
        });

    const handlePhdChange = (field, value) => {
        // Prevent manual entry of future dates
        if (field.startsWith("date_") && value > todayStr) return;

        const updatedPhd = { ...phd, [field]: value };

        // Auto-calculate duration for PhD (From Joining -> Award, or Defence if Award is empty)
        if (["date_joining", "date_defence", "date_award"].includes(field)) {
            const endDate = updatedPhd.date_defence || updatedPhd.date_award;
            updatedPhd.duration = calculateDuration(
                updatedPhd.date_joining,
                endDate,
            );
        }

        updateEduSection("phd", updatedPhd);
    };

    const handleArrayChange = (section, index, field, value) => {
        // Prevent manual entry of future dates (applies to dates, skips year fields for school)
        if (field.startsWith("date_") && value > todayStr) return;

        const sourceArray = section === "school" ? school : edu[section] || [];
        const arr = [...sourceArray];
        const updatedItem = { ...arr[index], [field]: value };

        // Auto-calculate duration for UG/PG if dates change
        if (field === "date_joining" || field === "date_graduation") {
            updatedItem.duration = calculateDuration(
                updatedItem.date_joining,
                updatedItem.date_graduation,
            );
        }

        arr[index] = updatedItem;
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
        return (
            <div
                key={index}
                className="relative p-4 pt-12 bg-white border border-slate-200 rounded-lg mt-3 shadow-sm group"
            >
                <div className="absolute top-2 right-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeArrayItem(section, index)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
                        <Label>Date of Joining</Label>
                        <Input
                            type="date"
                            max={todayStr}
                            value={item.date_joining || ""}
                            onChange={(e) =>
                                handleArrayChange(
                                    section,
                                    index,
                                    "date_joining",
                                    e.target.value,
                                )
                            }
                            className="w-full [&::-webkit-calendar-picker-indicator]:ml-auto"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Graduation</Label>
                        <Input
                            type="date"
                            max={todayStr}
                            value={item.date_graduation || ""}
                            onChange={(e) =>
                                handleArrayChange(
                                    section,
                                    index,
                                    "date_graduation",
                                    e.target.value,
                                )
                            }
                            className="w-full [&::-webkit-calendar-picker-indicator]:ml-auto"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="whitespace-nowrap">
                            Duration (YY-MM-DD)
                        </Label>
                        <Input
                            readOnly
                            value={item.duration || ""}
                            className="bg-slate-100 text-slate-600 focus-visible:ring-0"
                            placeholder="00-00-00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex flex-col">
                            <span>Percentage (%)</span>
                            <span className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">
                                Convert CGPA to % (e.g., 9.8/10 = 98%, 4.5/5 =
                                90%)
                            </span>
                        </Label>
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            step="0.01" // Allows decimals like 98.5
                            value={item.percentage || ""}
                            onChange={(e) => {
                                let val = e.target.value;

                                // Prevent numbers greater than 100
                                if (val !== "" && parseFloat(val) > 100) {
                                    val = "100";
                                }
                                // Prevent negative numbers
                                if (val !== "" && parseFloat(val) < 0) {
                                    val = "";
                                }

                                handleArrayChange(
                                    section,
                                    index,
                                    "percentage",
                                    val,
                                );
                            }}
                            placeholder="e.g. 98"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Division/Class</Label>
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

            {/* (A) Ph.D. Details */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800">
                    (A) Ph.D. Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2 lg:col-span-2">
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
                    <div className="space-y-2 lg:col-span-2">
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
                    <div className="space-y-2 lg:col-span-1">
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
                            Date of Joining{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            max={todayStr}
                            value={phd.date_joining}
                            onChange={(e) =>
                                handlePhdChange("date_joining", e.target.value)
                            }
                            className={`w-full [&::-webkit-calendar-picker-indicator]:ml-auto ${
                                localErrors["phd.date_joining"]
                                    ? "border-red-500"
                                    : ""
                            }`}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Defence</Label>
                        <Input
                            type="date"
                            max={todayStr}
                            value={phd.date_defence}
                            onChange={(e) =>
                                handlePhdChange("date_defence", e.target.value)
                            }
                            className="w-full [&::-webkit-calendar-picker-indicator]:ml-auto"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Award</Label>
                        <Input
                            type="date"
                            max={todayStr}
                            value={phd.date_award}
                            onChange={(e) =>
                                handlePhdChange("date_award", e.target.value)
                            }
                            className="w-full [&::-webkit-calendar-picker-indicator]:ml-auto"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="whitespace-nowrap">
                            Duration (YY-MM-DD)
                        </Label>
                        <Input
                            readOnly
                            value={phd.duration || ""}
                            className="bg-slate-100 text-slate-600 focus-visible:ring-0"
                            placeholder="00-00-00"
                        />
                    </div>
                    <div className="space-y-2 lg:col-span-3">
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

            {/* (B) Academic Details - PG */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (B) Academic Details - PG
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("pg", {
                                degree: "",
                                university: "",
                                subjects: "",
                                date_joining: "",
                                date_graduation: "",
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

            {/* (C) Academic Details - UG */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (C) Academic Details - UG
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("ug", {
                                degree: "",
                                university: "",
                                subjects: "",
                                date_joining: "",
                                date_graduation: "",
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

            {/* (D) Academic Details - School */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800">
                    (D) Academic Details - School
                </h4>
                {school.map((item, index) => (
                    <div
                        key={index}
                        // Added 'items-end' right here so all inputs sit flush at the bottom
                        className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-4 rounded border border-slate-200 shadow-sm mt-2"
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
                            <Label className="flex flex-col">
                                <span>Percentage (%)</span>
                                <span className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">
                                    CGPA to % (e.g., 9.8/10 = 98%)
                                </span>
                            </Label>
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                step="0.01" // Allows decimals like 98.5
                                value={item.percentage || ""}
                                onChange={(e) => {
                                    let val = e.target.value;

                                    // Prevent numbers greater than 100
                                    if (val !== "" && parseFloat(val) > 100) {
                                        val = "100";
                                    }
                                    // Prevent negative numbers
                                    if (val !== "" && parseFloat(val) < 0) {
                                        val = "";
                                    }

                                    // Fixed: Changed 'section' variable to "school"
                                    handleArrayChange(
                                        "school",
                                        index,
                                        "percentage",
                                        val,
                                    );
                                }}
                                placeholder="e.g. 98"
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
