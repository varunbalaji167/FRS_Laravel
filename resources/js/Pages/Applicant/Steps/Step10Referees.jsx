import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import TextField from "@/Components/inputs/TextField";
import EmailField from "@/Components/inputs/EmailField";
import PhoneField from "@/Components/inputs/PhoneField";

const REFEREE_TEMPLATE = {
    name: "",
    position: "",
    association: "",
    institute: "",
    email: "",
    contact_code: "+91",
    contact_number: "",
};

export default function Step10Referees({ data, setData, localErrors = {} }) {
    const section = data.form_data.referees_section || {};
    // Pre-populate with 3 empty referees since 3 are mandatory
    const referees = section.referees || [{ ...REFEREE_TEMPLATE }, { ...REFEREE_TEMPLATE }, { ...REFEREE_TEMPLATE }];

    const updateReferees = (newReferees) => {
        setData("form_data", {
            ...data.form_data,
            referees_section: { ...section, referees: newReferees },
        });
    };

    const handleArrayChange = (index, field, value) => {
        const currentArray = [...referees];
        currentArray[index] = { ...currentArray[index], [field]: value };
        updateReferees(currentArray);
    };

    const addReferee = () => {
        updateReferees([...referees, { ...REFEREE_TEMPLATE }]);
    };

    const removeReferee = (index) => {
        // Never allow dropping below 3 mandatory referees
        if (referees.length <= 3) return;
        const currentArray = [...referees];
        currentArray.splice(index, 1);
        updateReferees(currentArray);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">9. Referees</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Provide details of at least 3 referees who are familiar with your academic and professional work.
                </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (A) Details of Referees <span className="text-red-500">*</span>
                    </h4>
                    <Button type="button" size="sm" variant="outline" onClick={addReferee}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Referee
                    </Button>
                </div>

                {/* Global referee error banner */}
                {localErrors.referees && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-lg border border-red-200">
                        {localErrors.referees}
                    </div>
                )}

                {referees.map((item, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-6 gap-4 p-5 pl-12 bg-white border border-slate-200 rounded-lg relative mt-4 shadow-sm"
                    >
                        <div className="absolute top-5 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                            {idx + 1}
                        </div>

                        {/* Remove button only for extra referees beyond the mandatory 3 */}
                        {referees.length > 3 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeReferee(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="md:col-span-2">
                            <TextField
                                id={`referee-${idx}-name`}
                                label="Name"
                                required
                                value={item.name}
                                onChange={(v) => handleArrayChange(idx, "name", v)}
                                error={localErrors[`referee_${idx}_name`]}
                            />
                        </div>

                        <div className="md:col-span-2 pr-8">
                            <TextField
                                id={`referee-${idx}-position`}
                                label="Position"
                                required
                                value={item.position}
                                onChange={(v) => handleArrayChange(idx, "position", v)}
                                placeholder="e.g. Professor"
                                error={localErrors[`referee_${idx}_position`]}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <TextField
                                id={`referee-${idx}-association`}
                                label="Association"
                                required
                                value={item.association}
                                onChange={(v) => handleArrayChange(idx, "association", v)}
                                placeholder="e.g. Thesis Supervisor"
                                error={localErrors[`referee_${idx}_association`]}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <TextField
                                id={`referee-${idx}-institute`}
                                label="Institute/Organization"
                                required
                                value={item.institute}
                                onChange={(v) => handleArrayChange(idx, "institute", v)}
                                error={localErrors[`referee_${idx}_institute`]}
                            />
                        </div>

                        <div className="md:col-span-2 pr-8">
                            <EmailField
                                id={`referee-${idx}-email`}
                                label="E-mail"
                                required
                                value={item.email}
                                onChange={(v) => handleArrayChange(idx, "email", v)}
                                error={localErrors[`referee_${idx}_email`]}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <PhoneField
                                id={`referee-${idx}-contact`}
                                label="Contact No."
                                required
                                code={item.contact_code}
                                onCodeChange={(v) => handleArrayChange(idx, "contact_code", v)}
                                value={item.contact_number}
                                onChange={(v) => handleArrayChange(idx, "contact_number", v)}
                                error={localErrors[`referee_${idx}_contact`]}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
