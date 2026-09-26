import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { calculateDuration } from "@/lib/dateUtils";
import TextField from "@/Components/inputs/TextField";
import DatePicker from "@/Components/inputs/DatePicker";
import SelectField from "@/Components/inputs/SelectField";
import NumberField from "@/Components/inputs/NumberField";

const HAS_THREE_YEARS_EXP_OPTIONS = ["Yes", "No"];

export default function Step4Employment({ data, setData, localErrors = {} }) {
    const emp = data.form_data.employment || {};
    const present = emp.present || {
        position: "",
        organization: "",
        date_joining: "",
        date_leaving: "Continuing",
        duration: "",
    };
    const history = emp.history || [];
    const teaching = emp.teaching || [];
    const research = emp.research || [];
    const industrial = emp.industrial || [];

    const todayStr = new Date().toISOString().split("T")[0];

    const updateEmpSection = (section, newValue) =>
        setData("form_data", {
            ...data.form_data,
            employment: { ...emp, [section]: newValue },
        });

    const handlePresentChange = (field, value) => {
        // Strict block for manual future dates
        if (
            (field === "date_joining" || field === "date_leaving") &&
            value > todayStr
        ) {
            return;
        }

        const updatedPresent = { ...present, [field]: value };

        if (field === "date_joining" || field === "date_leaving") {
            updatedPresent.duration = calculateDuration(
                updatedPresent.date_joining,
                updatedPresent.date_leaving,
            );
        }

        updateEmpSection("present", updatedPresent);
    };

    const handleArrayChange = (section, index, field, value) => {
        // Strict block for manual future dates
        if (
            (field === "date_joining" || field === "date_leaving") &&
            value > todayStr
        ) {
            return;
        }

        const arr = [...(emp[section] || [])];
        const updatedItem = { ...arr[index], [field]: value };

        if (field === "date_joining" || field === "date_leaving") {
            updatedItem.duration = calculateDuration(
                updatedItem.date_joining,
                updatedItem.date_leaving,
            );
        }

        arr[index] = updatedItem;
        updateEmpSection(section, arr);
    };

    const addArrayItem = (section, template) =>
        updateEmpSection(section, [...(emp[section] || []), template]);

    const removeArrayItem = (section, index) => {
        const arr = [...(emp[section] || [])];
        arr.splice(index, 1);
        updateEmpSection(section, arr);
    };

    const durationField = (value) => (
        <div className="space-y-2">
            <Label className="whitespace-nowrap">Duration (YY-MM-DD)</Label>
            <Input
                readOnly
                value={value || ""}
                className="bg-slate-100 text-slate-600 focus-visible:ring-0"
                placeholder="00-00-00"
            />
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">
                    3. Employment Details
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Provide your employment history, separating teaching,
                    research, and industry experience.
                </p>
            </div>

            {/* (A) Present Employment */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800">
                    (A) Present Employment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <TextField
                        id="present-position"
                        label="Position"
                        required
                        value={present.position}
                        onChange={(v) => handlePresentChange("position", v)}
                        placeholder="e.g. N/A if none"
                        error={localErrors["present.position"]}
                    />
                    <TextField
                        id="present-organization"
                        label="Organization"
                        required
                        value={present.organization}
                        onChange={(v) => handlePresentChange("organization", v)}
                        placeholder="e.g. N/A"
                        error={localErrors["present.organization"]}
                    />
                    <DatePicker
                        id="present-date_joining"
                        label="Date of Joining"
                        required
                        max={todayStr}
                        value={present.date_joining}
                        onChange={(v) => handlePresentChange("date_joining", v)}
                        error={localErrors["present.date_joining"]}
                    />
                    <div className="space-y-2">
                        <Label>Date of Leaving</Label>
                        <Input
                            value={present.date_leaving || ""}
                            disabled
                            className="bg-white font-bold text-slate-500"
                        />
                    </div>
                    {durationField(present.duration)}
                </div>
            </div>

            {/* Experience Eligibility */}
            <div className="space-y-4 bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-bold text-lg text-blue-900">
                    Experience Eligibility
                </h4>
                <div className="max-w-xs">
                    <SelectField
                        id="has_three_years_exp"
                        label="Minimum three years of industrial/ research/ teaching experience, excluding, however, the experience gained while pursuing Ph.D."
                        required
                        value={emp.has_three_years_exp}
                        onChange={(v) => updateEmpSection("has_three_years_exp", v)}
                        options={HAS_THREE_YEARS_EXP_OPTIONS}
                        placeholder="Select Yes or No..."
                        error={localErrors["emp.has_three_years_exp"]}
                    />
                </div>
            </div>

            {/* (B) Employment History */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (B) Employment History
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("history", {
                                position: "",
                                organization: "",
                                date_joining: "",
                                date_leaving: "",
                                duration: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add History
                    </Button>
                </div>
                {history.map((item, idx) => (
                    <div
                        key={idx}
                        className="relative p-4 pt-12 bg-white border border-slate-200 rounded-lg mt-3 shadow-sm group"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeArrayItem("history", idx)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
                            title="Remove Entry"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                            <TextField
                                id={`history-${idx}-position`}
                                label="Position"
                                value={item.position}
                                onChange={(v) => handleArrayChange("history", idx, "position", v)}
                            />
                            <TextField
                                id={`history-${idx}-organization`}
                                label="Organization"
                                value={item.organization}
                                onChange={(v) => handleArrayChange("history", idx, "organization", v)}
                            />
                            <DatePicker
                                id={`history-${idx}-date_joining`}
                                label="Date of Joining"
                                max={todayStr}
                                value={item.date_joining}
                                onChange={(v) => handleArrayChange("history", idx, "date_joining", v)}
                            />
                            <DatePicker
                                id={`history-${idx}-date_leaving`}
                                label="Date of Leaving"
                                max={todayStr}
                                value={item.date_leaving}
                                onChange={(v) => handleArrayChange("history", idx, "date_leaving", v)}
                            />
                            {durationField(item.duration)}
                        </div>
                    </div>
                ))}
            </div>

            {/* (C) Teaching Experience */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (C) Teaching Experience
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("teaching", {
                                position: "",
                                employer: "",
                                courses: "",
                                level: "",
                                students: "",
                                date_joining: "",
                                date_leaving: "",
                                duration: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Teaching
                    </Button>
                </div>
                {teaching.map((item, idx) => (
                    <div
                        key={idx}
                        className="relative p-4 pt-12 bg-white border border-slate-200 rounded-lg mt-3 shadow-sm group"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeArrayItem("teaching", idx)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
                            title="Remove Entry"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <TextField
                                id={`teaching-${idx}-position`}
                                label="Position"
                                value={item.position}
                                onChange={(v) => handleArrayChange("teaching", idx, "position", v)}
                            />
                            <TextField
                                id={`teaching-${idx}-employer`}
                                label="Employer"
                                value={item.employer}
                                onChange={(v) => handleArrayChange("teaching", idx, "employer", v)}
                            />
                            <TextField
                                id={`teaching-${idx}-courses`}
                                label="Course Taught"
                                value={item.courses}
                                onChange={(v) => handleArrayChange("teaching", idx, "courses", v)}
                            />
                            <TextField
                                id={`teaching-${idx}-level`}
                                label="UG/PG"
                                value={item.level}
                                onChange={(v) => handleArrayChange("teaching", idx, "level", v)}
                            />
                            <NumberField
                                id={`teaching-${idx}-students`}
                                label="No. of Students"
                                value={item.students}
                                onChange={(v) => handleArrayChange("teaching", idx, "students", v)}
                                min={0}
                            />
                            <DatePicker
                                id={`teaching-${idx}-date_joining`}
                                label="Date of Joining"
                                max={todayStr}
                                value={item.date_joining}
                                onChange={(v) => handleArrayChange("teaching", idx, "date_joining", v)}
                            />
                            <DatePicker
                                id={`teaching-${idx}-date_leaving`}
                                label="Date of Leaving"
                                max={todayStr}
                                value={item.date_leaving}
                                onChange={(v) => handleArrayChange("teaching", idx, "date_leaving", v)}
                            />
                            {durationField(item.duration)}
                        </div>
                    </div>
                ))}
            </div>

            {/* (D) Research Experience */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (D) Research Experience
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("research", {
                                position: "",
                                institute: "",
                                supervisor: "",
                                date_joining: "",
                                date_leaving: "",
                                duration: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Research
                    </Button>
                </div>
                {research.map((item, idx) => (
                    <div
                        key={idx}
                        className="relative p-4 pt-12 bg-white border border-slate-200 rounded-lg mt-3 shadow-sm group"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeArrayItem("research", idx)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
                            title="Remove Entry"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                            <TextField
                                id={`research-${idx}-position`}
                                label="Position"
                                value={item.position}
                                onChange={(v) => handleArrayChange("research", idx, "position", v)}
                            />
                            <TextField
                                id={`research-${idx}-institute`}
                                label="Institute"
                                value={item.institute}
                                onChange={(v) => handleArrayChange("research", idx, "institute", v)}
                            />
                            <TextField
                                id={`research-${idx}-supervisor`}
                                label="Supervisor"
                                value={item.supervisor}
                                onChange={(v) => handleArrayChange("research", idx, "supervisor", v)}
                            />
                            <DatePicker
                                id={`research-${idx}-date_joining`}
                                label="Date of Joining"
                                max={todayStr}
                                value={item.date_joining}
                                onChange={(v) => handleArrayChange("research", idx, "date_joining", v)}
                            />
                            <DatePicker
                                id={`research-${idx}-date_leaving`}
                                label="Date of Leaving"
                                max={todayStr}
                                value={item.date_leaving}
                                onChange={(v) => handleArrayChange("research", idx, "date_leaving", v)}
                            />
                            {durationField(item.duration)}
                        </div>
                    </div>
                ))}
            </div>

            {/* (E) Industrial Experience */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (E) Industrial Experience
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("industrial", {
                                organization: "",
                                profile: "",
                                date_joining: "",
                                date_leaving: "",
                                duration: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Industry
                    </Button>
                </div>
                {industrial.map((item, idx) => (
                    <div
                        key={idx}
                        className="relative p-4 pt-12 bg-white border border-slate-200 rounded-lg mt-3 shadow-sm group"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeArrayItem("industrial", idx)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center"
                            title="Remove Entry"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                            <TextField
                                id={`industrial-${idx}-organization`}
                                label="Organization"
                                value={item.organization}
                                onChange={(v) => handleArrayChange("industrial", idx, "organization", v)}
                            />
                            <TextField
                                id={`industrial-${idx}-profile`}
                                label="Work Profile"
                                value={item.profile}
                                onChange={(v) => handleArrayChange("industrial", idx, "profile", v)}
                            />
                            <DatePicker
                                id={`industrial-${idx}-date_joining`}
                                label="Date of Joining"
                                max={todayStr}
                                value={item.date_joining}
                                onChange={(v) => handleArrayChange("industrial", idx, "date_joining", v)}
                            />
                            <DatePicker
                                id={`industrial-${idx}-date_leaving`}
                                label="Date of Leaving"
                                max={todayStr}
                                value={item.date_leaving}
                                onChange={(v) => handleArrayChange("industrial", idx, "date_leaving", v)}
                            />
                            {durationField(item.duration)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
