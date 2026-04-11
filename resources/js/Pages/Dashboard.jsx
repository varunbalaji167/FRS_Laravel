import { Head, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    CalendarDays,
    Building2,
    ArrowRight,
    Inbox,
    CheckCircle2,
    Download,
    FileText,
    Clock,
} from "lucide-react";
import ApplicantLayout from "@/Layouts/ApplicantLayout";

export default function Dashboard({
    advertisements = [],
    submittedAdvtIds = [],
    draftAdvtIds = [],
}) {
    return (
        <ApplicantLayout>
            <Head title="Applicant Dashboard" />

            <div className="bg-slate-900 py-12 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-slate-900/50" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-3xl font-serif font-bold text-white sm:text-4xl drop-shadow-sm">
                        Active Recruitment Drives
                    </h1>
                    <p className="mt-3 text-slate-300 font-medium max-w-2xl text-lg">
                        Browse the latest IIT Indore faculty recruitment
                        advertisements. Review the official documents and begin
                        your formal application process.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 py-12">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {advertisements.map((advt) => {
                        const hasSubmitted = submittedAdvtIds.includes(advt.id);
                        const hasDraft = draftAdvtIds.includes(advt.id);
                        let ringColor = "ring-slate-200";
                        let bgColor = "bg-white";
                        let topBarColor = "bg-blue-600";

                        if (hasSubmitted) {
                            ringColor = "ring-emerald-500/50";
                            bgColor = "bg-emerald-50/10";
                            topBarColor = "bg-emerald-500";
                        } else if (hasDraft) {
                            ringColor = "ring-amber-400/50";
                            bgColor = "bg-amber-50/10";
                            topBarColor = "bg-amber-400";
                        }

                        return (
                            <Card
                                key={advt.id}
                                className={`flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 group ${bgColor} border-none ring-1 ${ringColor}`}
                            >
                                {/* Top Color Bar */}
                                <div
                                    className={`h-1.5 w-full rounded-t-xl ${topBarColor}`}
                                ></div>

                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        {/* Status Badges */}
                                        {hasSubmitted && (
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                                                Applied
                                            </span>
                                        )}
                                        {hasDraft && (
                                            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                                                <Clock className="h-3 w-3 mr-1" />{" "}
                                                Draft Saved
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">
                                        Ref: {advt.reference_number}
                                    </p>
                                    <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                                        {advt.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex-grow pb-6 space-y-5">
                                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="bg-white p-2 rounded shadow-sm border border-slate-200">
                                            <CalendarDays className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">
                                                Application Deadline
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {new Date(
                                                    advt.deadline,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-slate-800">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                            <h3 className="text-sm font-bold">
                                                Applicable Departments /
                                                Schools:
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Object.keys(
                                                advt.departments || {},
                                            ).map((dept, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm"
                                                >
                                                    {dept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-4 pb-6 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                                    <a
                                        href={`/storage/${advt.document_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full sm:w-1/2"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-bold shadow-sm"
                                        >
                                            <Download className="mr-2 h-4 w-4" />{" "}
                                            View PDF
                                        </Button>
                                    </a>

                                    {/* Smart Button Rendering based on Status */}
                                    {hasSubmitted ? (
                                        <Button
                                            disabled
                                            className="w-full sm:w-1/2 bg-slate-200 text-slate-500 font-bold cursor-not-allowed"
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />{" "}
                                            Application Locked
                                        </Button>
                                    ) : hasDraft ? (
                                        <Link
                                            href={route(
                                                "applicant.apply",
                                                advt.id,
                                            )}
                                            className="w-full sm:w-1/2"
                                        >
                                            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md hover:shadow-lg transition-all">
                                                Resume Draft{" "}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route(
                                                "applicant.apply",
                                                advt.id,
                                            )}
                                            className="w-full sm:w-1/2"
                                        >
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition-all">
                                                Apply Now{" "}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {advertisements.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
                        <Inbox className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">
                            No Recruitment Drives Available
                        </h3>
                        <p className="text-slate-500 mt-2 max-w-md">
                            There are currently no active faculty recruitment
                            advertisements. Please check back later.
                        </p>
                    </div>
                )}
            </div>
        </ApplicantLayout>
    );
}
