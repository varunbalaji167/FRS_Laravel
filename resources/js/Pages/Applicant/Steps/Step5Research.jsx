import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import TextField from "@/Components/inputs/TextField";
import TextareaField from "@/Components/inputs/TextareaField";
import NumberField from "@/Components/inputs/NumberField";
import YearField from "@/Components/inputs/YearField";

const SUMMARY_FIELDS = [
    { key: "intl_journals", label: "Intl. Journal Papers" },
    { key: "natl_journals", label: "National Journal Papers" },
    { key: "intl_conferences", label: "Intl. Conference Papers" },
    { key: "natl_conferences", label: "Natl. Conference Papers" },
    { key: "patents", label: "Number of Patent(s)" },
    { key: "books", label: "Number of Book(s)" },
    { key: "book_chapters", label: "Number of Book Chapter(s)", className: "md:col-span-2" },
];

const PUBLICATION_FIELDS = [
    { key: "title", label: "Title", className: "md:col-span-2", widget: "text" },
    { key: "authors", label: "Author(s)", className: "md:col-span-2", widget: "text" },
    { key: "journal", label: "Name of Journal/Conf.", className: "md:col-span-2 pr-8", widget: "text" },
    { key: "year", label: "Year", widget: "year" },
    { key: "vol_page", label: "Vol. & Page", widget: "text", placeholder: "e.g. Vol 4, Pg 12-15" },
    { key: "impact_factor", label: "Impact Factor", widget: "text" },
    { key: "doi", label: "DOI / URL", className: "md:col-span-2", widget: "text", placeholder: "https://doi.org/..." },
    { key: "status", label: "Status", widget: "text", placeholder: "e.g. Published, Accepted" },
];

export default function Step5Research({ data, setData, localErrors = {} }) {
    const res = data.form_data.research || {};

    // 1. Area of Specialization
    const specialization = res.specialization || {
        area_of_specialization: "",
        current_area_of_research: "",
    };

    // 2. Summary of Publications
    const summary = res.summary || {
        intl_journals: "",
        natl_journals: "",
        intl_conferences: "",
        natl_conferences: "",
        patents: "",
        books: "",
        book_chapters: "",
    };

    // 3. Best Publications
    const publications = res.publications || [];

    const updateResSection = (section, newValue) => {
        setData("form_data", {
            ...data.form_data,
            research: { ...res, [section]: newValue },
        });
    };

    const handleSpecChange = (field, value) =>
        updateResSection("specialization", {
            ...specialization,
            [field]: value,
        });
    const handleSummaryChange = (field, value) =>
        updateResSection("summary", { ...summary, [field]: value });
    const handleArrayChange = (section, index, field, value) => {
        const currentArray = [...(res[section] || [])];
        currentArray[index] = { ...currentArray[index], [field]: value };
        updateResSection(section, currentArray);
    };

    const addArrayItem = (section, template) => {
        const currentArray = [...(res[section] || [])];
        currentArray.push(template);
        updateResSection(section, currentArray);
    };

    const removeArrayItem = (section, index) => {
        const currentArray = [...(res[section] || [])];
        currentArray.splice(index, 1);
        updateResSection(section, currentArray);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">
                    4. Research & Publications
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Provide your areas of expertise, a summary of your output,
                    and your top publications.
                </p>
            </div>

            {/* --- (A) Area of Specialization --- */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Area(s) of Specialization and Research
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextareaField
                        id="spec-area"
                        label="Area(s) of Specialization"
                        required
                        rows={5}
                        value={specialization.area_of_specialization}
                        onChange={(v) => handleSpecChange("area_of_specialization", v)}
                        placeholder="e.g. VEGETATION REMOTE SENSING, EARTH OBSERVATION..."
                        error={localErrors["spec.area"]}
                    />
                    <TextareaField
                        id="spec-current"
                        label="Current Area(s) of Research"
                        required
                        rows={5}
                        value={specialization.current_area_of_research}
                        onChange={(v) => handleSpecChange("current_area_of_research", v)}
                        placeholder="e.g. 1. BIOPHYSICAL PARAMETER ESTIMATION..."
                        error={localErrors["spec.current"]}
                    />
                </div>
            </div>

            {/* --- (B) Summary of Publications --- */}
            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-800 border-b pb-2">
                    Summary of Publications
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    {SUMMARY_FIELDS.map(({ key, label, className }) => (
                        <div key={key} className={className}>
                            <NumberField
                                id={`summary-${key}`}
                                label={label}
                                min={0}
                                value={summary[key]}
                                onChange={(v) => handleSummaryChange(key, v)}
                                placeholder="0"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* --- (C) Best Publications List --- */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        List of Best Research Publications (Max 10)
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("publications", {
                                title: "",
                                authors: "",
                                journal: "",
                                year: "",
                                vol_page: "",
                                impact_factor: "",
                                doi: "",
                                status: "",
                            })
                        }
                        disabled={publications.length >= 10}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Publication
                    </Button>
                </div>
                {publications.map((item, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-white border rounded-lg relative mt-2 shadow-sm"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("publications", idx)}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        {PUBLICATION_FIELDS.map(({ key, label, className, widget, placeholder }) => (
                            <div key={key} className={className}>
                                {widget === "year" ? (
                                    <YearField
                                        id={`publications-${idx}-${key}`}
                                        label={label}
                                        value={item[key]}
                                        onChange={(v) => handleArrayChange("publications", idx, key, v)}
                                    />
                                ) : (
                                    <TextField
                                        id={`publications-${idx}-${key}`}
                                        label={label}
                                        value={item[key]}
                                        onChange={(v) => handleArrayChange("publications", idx, key, v)}
                                        placeholder={placeholder}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
