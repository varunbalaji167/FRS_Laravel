import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import TextField from "@/Components/inputs/TextField";
import DatePicker from "@/Components/inputs/DatePicker";
import YearField from "@/Components/inputs/YearField";

const PATENT_FIELDS = [
    { key: "inventors", label: "Inventor(s)", className: "md:col-span-2", widget: "text" },
    { key: "title", label: "Title of Patent", className: "md:col-span-2 pr-8", widget: "text" },
    { key: "country", label: "Country", widget: "text" },
    { key: "number", label: "Patent Number", widget: "text" },
    { key: "date_filed", label: "Date of Filing", widget: "date" },
    { key: "date_published", label: "Date Published", widget: "date" },
    { key: "status", label: "Status (Filed/Published/Granted)", className: "md:col-span-2", widget: "text" },
];

const SOCIETY_FIELDS = [
    { key: "name", label: "Name of the Professional Society", className: "pr-8" },
    { key: "status", label: "Membership Status (e.g., Lifetime/Annual)" },
];

const TRAINING_FIELDS = [
    { key: "type", label: "Type of Training Received", widget: "text" },
    { key: "organization", label: "Organisation", className: "pr-8", widget: "text" },
    { key: "year", label: "Year", widget: "year" },
    { key: "duration", label: "Duration (Years/Months/Days)", widget: "text" },
];

export default function Step6AdditionalInfo({
    data,
    setData,
    localErrors = {},
}) {
    // Grouping all these lists under a new 'additional_info' object in our JSON
    const info = data.form_data.additional_info || {};
    const patents = info.patents || [];
    const books = info.books || [];
    const book_chapters = info.book_chapters || [];
    const societies = info.societies || [];
    const training = info.training || [];

    const updateInfoSection = (section, newValue) => {
        setData("form_data", {
            ...data.form_data,
            additional_info: { ...info, [section]: newValue },
        });
    };

    const handleScholarChange = (value) =>
        updateInfoSection("google_scholar", value);

    const handleArrayChange = (section, index, field, value) => {
        const currentArray = [...(info[section] || [])];
        currentArray[index] = { ...currentArray[index], [field]: value };
        updateInfoSection(section, currentArray);
    };

    const addArrayItem = (section, template) => {
        const currentArray = [...(info[section] || [])];
        currentArray.push(template);
        updateInfoSection(section, currentArray);
    };

    const removeArrayItem = (section, index) => {
        const currentArray = [...(info[section] || [])];
        currentArray.splice(index, 1);
        updateInfoSection(section, currentArray);
    };

    // Reusable row for Books and Book Chapters since they share the exact same fields
    const renderBookRow = (section, item, idx) => (
        <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white border rounded-lg relative mt-2 shadow-sm"
        >
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem(section, idx)}
                className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <div className="md:col-span-2">
                <TextField
                    id={`${section}-${idx}-authors`}
                    label="Author(s)"
                    value={item.authors}
                    onChange={(v) => handleArrayChange(section, idx, "authors", v)}
                />
            </div>
            <div className="md:col-span-2 pr-8">
                <TextField
                    id={`${section}-${idx}-title`}
                    label="Title"
                    value={item.title}
                    onChange={(v) => handleArrayChange(section, idx, "title", v)}
                />
            </div>
            <YearField
                id={`${section}-${idx}-year`}
                label="Year"
                value={item.year}
                onChange={(v) => handleArrayChange(section, idx, "year", v)}
            />
            <div className="md:col-span-2">
                <TextField
                    id={`${section}-${idx}-isbn`}
                    label="ISBN"
                    value={item.isbn}
                    onChange={(v) => handleArrayChange(section, idx, "isbn", v)}
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-slate-900">
                    5. Additional Information
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Provide details of your patents, books, professional
                    memberships, and training.
                </p>
            </div>

            {/* (A) Patents */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (A) Patent(s)
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("patents", {
                                inventors: "",
                                title: "",
                                country: "",
                                number: "",
                                date_filed: "",
                                date_published: "",
                                status: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Patent
                    </Button>
                </div>
                {patents.map((item, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border rounded-lg relative mt-2 shadow-sm"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("patents", idx)}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        {PATENT_FIELDS.map(({ key, label, className, widget }) => (
                            <div key={key} className={className}>
                                {widget === "date" ? (
                                    <DatePicker
                                        id={`patents-${idx}-${key}`}
                                        label={label}
                                        value={item[key]}
                                        onChange={(v) => handleArrayChange("patents", idx, key, v)}
                                    />
                                ) : (
                                    <TextField
                                        id={`patents-${idx}-${key}`}
                                        label={label}
                                        value={item[key]}
                                        onChange={(v) => handleArrayChange("patents", idx, key, v)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* (B) Books */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (B) Book(s)
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("books", {
                                authors: "",
                                title: "",
                                year: "",
                                isbn: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Book
                    </Button>
                </div>
                {books.map((item, idx) => renderBookRow("books", item, idx))}
            </div>

            {/* (C) Book Chapters */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        (C) Book Chapter(s)
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("book_chapters", {
                                authors: "",
                                title: "",
                                year: "",
                                isbn: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Chapter
                    </Button>
                </div>
                {book_chapters.map((item, idx) =>
                    renderBookRow("book_chapters", item, idx),
                )}
            </div>

            {/* 8. Google Scholar */}
            <div className="space-y-4 bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-bold text-lg text-blue-900">
                    Google Scholar Profile
                </h4>
                <TextField
                    id="google_scholar"
                    label="URL"
                    value={info.google_scholar}
                    onChange={handleScholarChange}
                    placeholder="https://scholar.google.com/citations?user=..."
                />
            </div>

            {/* 9. Professional Societies */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        Membership of Professional Societies
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("societies", { name: "", status: "" })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Membership
                    </Button>
                </div>
                {societies.map((item, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border rounded-lg relative mt-2 shadow-sm"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("societies", idx)}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        {SOCIETY_FIELDS.map(({ key, label, className }) => (
                            <div key={key} className={className}>
                                <TextField
                                    id={`societies-${idx}-${key}`}
                                    label={label}
                                    value={item[key]}
                                    onChange={(v) => handleArrayChange("societies", idx, key, v)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* 10. Professional Training */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-lg text-slate-800">
                        Professional Training
                    </h4>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            addArrayItem("training", {
                                type: "",
                                organization: "",
                                year: "",
                                duration: "",
                            })
                        }
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Training
                    </Button>
                </div>
                {training.map((item, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border rounded-lg relative mt-2 shadow-sm"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem("training", idx)}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        {TRAINING_FIELDS.map(({ key, label, className, widget }) => (
                            <div key={key} className={className}>
                                {widget === "year" ? (
                                    <YearField
                                        id={`training-${idx}-${key}`}
                                        label={label}
                                        value={item[key]}
                                        onChange={(v) => handleArrayChange("training", idx, key, v)}
                                    />
                                ) : (
                                    <TextField
                                        id={`training-${idx}-${key}`}
                                        label={label}
                                        value={item[key]}
                                        onChange={(v) => handleArrayChange("training", idx, key, v)}
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
