import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import TextField from "@/Components/inputs/TextField";
import YearField from "@/Components/inputs/YearField";

const JOURNAL_FIELDS = [
    { key: "authors", label: "Author's Names", className: "md:col-span-2" },
    { key: "title", label: "Paper Title", className: "md:col-span-4 pr-8" },
    { key: "journal_name", label: "Name of Journal", className: "md:col-span-2" },
    { key: "year", widget: "year", label: "Year" },
    { key: "volume", label: "Volume" },
    { key: "issue", label: "Issue" },
    { key: "pages", label: "Page Nos." },
    { key: "impact_factor", label: "Impact Factor" },
    { key: "doi", label: "DOI", className: "md:col-span-3", placeholder: "https://doi.org/..." },
    { key: "status", label: "Status", className: "md:col-span-2", placeholder: "Published/Accepted" },
];

const CONFERENCE_FIELDS = [
    { key: "authors", label: "Author's Names", className: "md:col-span-2" },
    { key: "title", label: "Paper Title", className: "md:col-span-4 pr-8" },
    { key: "conference_name", label: "Name of the Conference", className: "md:col-span-3" },
    { key: "year", widget: "year", label: "Year" },
    { key: "pages", label: "Page Nos." },
    { key: "doi", label: "DOI (If any)" },
];

export default function Step9DetailedPubs({ data, setData }) {
    // Grouping under 'detailed_pubs'
    const pubs = data.form_data.detailed_pubs || {};
    const journals = pubs.journals || [];
    const conferences = pubs.conferences || [];

    const updatePubsSection = (section, newValue) => {
        setData("form_data", {
            ...data.form_data,
            detailed_pubs: { ...pubs, [section]: newValue },
        });
    };

    const handleArrayChange = (section, index, field, value) => {
        const currentArray = [...(pubs[section] || [])];
        currentArray[index] = { ...currentArray[index], [field]: value };
        updatePubsSection(section, currentArray);
    };

    const addArrayItem = (section, template) => {
        const currentArray = [...(pubs[section] || [])];
        currentArray.push(template);
        updatePubsSection(section, currentArray);
    };

    const removeArrayItem = (section, index) => {
        const currentArray = [...(pubs[section] || [])];
        currentArray.splice(index, 1);
        updatePubsSection(section, currentArray);
    };

    const renderRow = (section, fields, item, idx, badgeClass) => (
        <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 pl-12 bg-white border border-slate-200 rounded-lg relative mt-2 shadow-sm"
        >
            <div
                className={`absolute top-4 left-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeClass}`}
            >
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

            {fields.map(({ key, label, className, placeholder, widget }) => (
                <div key={key} className={className}>
                    {widget === "year" ? (
                        <YearField
                            id={`${section}-${idx}-${key}`}
                            label={label}
                            value={item[key]}
                            onChange={(v) => handleArrayChange(section, idx, key, v)}
                        />
                    ) : (
                        <TextField
                            id={`${section}-${idx}-${key}`}
                            label={label}
                            value={item[key]}
                            onChange={(v) => handleArrayChange(section, idx, key, v)}
                            placeholder={placeholder}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">8. Detailed Publications</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Provide an exhaustive list of all your journal and conference publications.
                </p>
            </div>

            {/* 18. Detailed List of Journal Publications */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-lg text-slate-800">(A) Detailed List of Journal Publications</h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("journals", {
                                authors: "",
                                title: "",
                                journal_name: "",
                                volume: "",
                                issue: "",
                                year: "",
                                pages: "",
                                impact_factor: "",
                                doi: "",
                                status: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Journal Paper
                    </Button>
                </div>

                {journals.map((item, idx) =>
                    renderRow("journals", JOURNAL_FIELDS, item, idx, "bg-blue-100 text-blue-700"),
                )}
            </div>

            {/* 19. Detailed List of Conference Publications */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">(B) Detailed List of Conference Publications</h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("conferences", {
                                authors: "",
                                title: "",
                                conference_name: "",
                                year: "",
                                pages: "",
                                doi: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Conference Paper
                    </Button>
                </div>

                {conferences.map((item, idx) =>
                    renderRow("conferences", CONFERENCE_FIELDS, item, idx, "bg-slate-100 text-slate-600"),
                )}
            </div>
        </div>
    );
}
