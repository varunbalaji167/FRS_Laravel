import SelectField from "@/Components/inputs/SelectField";

export default function Step1Position({ data, setData, localErrors = {}, advertisement }) {
    const availableDepartments = Object.keys(advertisement.departments || {});
    const availableGrades = data.department ? advertisement.departments[data.department] || [] : [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-xl font-bold text-slate-900">Position Details</h3>
                <p className="text-sm text-slate-500">Select the specific department and grade you are targeting.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <SelectField
                    id="department"
                    label="Department / School"
                    required
                    value={data.department}
                    onChange={(value) =>
                        // Use explicit object spread instead of a functional updater so
                        // it works correctly regardless of Inertia version.
                        setData({
                            ...data,
                            department: value,
                            grade: "", // reset grade whenever department changes
                        })
                    }
                    options={availableDepartments}
                    placeholder="Select a department..."
                    error={localErrors.department}
                />

                <div className="space-y-2">
                    <SelectField
                        id="grade"
                        label="Grade / Position"
                        required
                        value={data.grade}
                        onChange={(value) => setData("grade", value)}
                        options={availableGrades}
                        placeholder="Select position grade..."
                        disabled={!data.department}
                        error={localErrors.grade}
                    />
                    {!data.department && (
                        <p className="text-xs text-slate-400">
                            Please select a department first to see available positions.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
