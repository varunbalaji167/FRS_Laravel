import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { calculateDuration } from "@/lib/dateUtils";
import TextField from "@/Components/inputs/TextField";
import DatePicker from "@/Components/inputs/DatePicker";
import PercentField from "@/Components/inputs/PercentField";
import YearField from "@/Components/inputs/YearField";

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
                    <TextField
                        id={`${section}-${index}-degree`}
                        label="Degree"
                        value={item.degree}
                        onChange={(v) => handleArrayChange(section, index, "degree", v)}
                    />
                    <TextField
                        id={`${section}-${index}-university`}
                        label="University/Institute"
                        value={item.university}
                        onChange={(v) => handleArrayChange(section, index, "university", v)}
                    />
                    <TextField
                        id={`${section}-${index}-subjects`}
                        label="Subjects"
                        value={item.subjects}
                        onChange={(v) => handleArrayChange(section, index, "subjects", v)}
                    />
                    <DatePicker
                        id={`${section}-${index}-date_joining`}
                        label="Date of Joining"
                        max={todayStr}
                        value={item.date_joining}
                        onChange={(v) => handleArrayChange(section, index, "date_joining", v)}
                    />
                    <DatePicker
                        id={`${section}-${index}-date_graduation`}
                        label="Date of Graduation"
                        max={todayStr}
                        value={item.date_graduation}
                        onChange={(v) => handleArrayChange(section, index, "date_graduation", v)}
                    />
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
                    <PercentField
                        id={`${section}-${index}-percentage`}
                        label="Percentage (%)"
                        hint="Convert CGPA to % (e.g., 9.8/10 = 98%, 4.5/5 = 90%)"
                        value={item.percentage}
                        onChange={(v) => handleArrayChange(section, index, "percentage", v)}
                    />
                    <TextField
                        id={`${section}-${index}-division`}
                        label="Division/Class"
                        value={item.division}
                        onChange={(v) => handleArrayChange(section, index, "division", v)}
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

            {/* (A) Ph.D. Details */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800">
                    (A) Ph.D. Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <TextField
                            id="phd-university"
                            label="University"
                            required
                            value={phd.university}
                            onChange={(v) => handlePhdChange("university", v)}
                            error={localErrors["phd.university"]}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <TextField
                            id="phd-department"
                            label="Department"
                            required
                            value={phd.department}
                            onChange={(v) => handlePhdChange("department", v)}
                            error={localErrors["phd.department"]}
                        />
                    </div>
                    <TextField
                        id="phd-supervisor"
                        label="Name of Supervisor"
                        value={phd.supervisor}
                        onChange={(v) => handlePhdChange("supervisor", v)}
                    />
                    <DatePicker
                        id="phd-date_joining"
                        label="Date of Joining"
                        required
                        max={todayStr}
                        value={phd.date_joining}
                        onChange={(v) => handlePhdChange("date_joining", v)}
                        error={localErrors["phd.date_joining"]}
                    />
                    <DatePicker
                        id="phd-date_defence"
                        label="Date of Defence"
                        max={todayStr}
                        value={phd.date_defence}
                        onChange={(v) => handlePhdChange("date_defence", v)}
                    />
                    <DatePicker
                        id="phd-date_award"
                        label="Date of Award"
                        max={todayStr}
                        value={phd.date_award}
                        onChange={(v) => handlePhdChange("date_award", v)}
                    />
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
                    <div className="lg:col-span-3">
                        <TextField
                            id="phd-title"
                            label="Title of the Ph.D. Thesis"
                            value={phd.title}
                            onChange={(v) => handlePhdChange("title", v)}
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
                        <TextField
                            id={`school-${index}-school`}
                            label="School"
                            value={item.school}
                            onChange={(v) => handleArrayChange("school", index, "school", v)}
                        />
                        <YearField
                            id={`school-${index}-year_passing`}
                            label="Year of Passing"
                            value={item.year_passing}
                            onChange={(v) => handleArrayChange("school", index, "year_passing", v)}
                        />
                        <PercentField
                            id={`school-${index}-percentage`}
                            label="Percentage (%)"
                            hint="CGPA to % (e.g., 9.8/10 = 98%)"
                            value={item.percentage}
                            onChange={(v) => handleArrayChange("school", index, "percentage", v)}
                        />
                        <TextField
                            id={`school-${index}-division`}
                            label="Division"
                            value={item.division}
                            onChange={(v) => handleArrayChange("school", index, "division", v)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
