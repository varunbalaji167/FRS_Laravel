import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Briefcase,
    FileText,
    Clock,
    CheckCircle2,
    ArrowRight,
    Download,
    CalendarDays,
    Building2,
    AlertCircle,
    Eye,
    XCircle,
} from "lucide-react";

export default function MyApplications({ applications }) {
    // Ensure applications is an array (handle pagination if necessary)
    const appsList = Array.isArray(applications)
        ? applications
        : applications?.data || [];

    // Separate drafts from submitted applications
    const drafts = appsList.filter((app) => app.status === "draft");
    const submitted = appsList.filter((app) => app.status !== "draft");

    return (
        <ApplicantLayout>
            <Head title="My Applications" />

            <div className="max-w-5xl mx-auto space-y-8 p-4">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        My Applications
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track your application status and resume saved drafts.
                    </p>
                </div>

                {appsList.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 bg-slate-50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                No Applications Found
                            </h3>
                            <p className="text-slate-500 max-w-sm mb-6">
                                You haven't started any applications yet. Browse
                                the open positions to begin.
                            </p>
                            <Button
                                asChild
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Link href={route("dashboard")}>
                                    <Briefcase className="h-4 w-4 mr-2" /> View
                                    Open Positions
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-10">
                        {/* IN PROGRESS / DRAFTS SECTION */}
                        {drafts.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-amber-500" />{" "}
                                    In Progress ({drafts.length})
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {drafts.map((app) => (
                                        <ApplicationCard
                                            key={app.id}
                                            app={app}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* SUBMITTED SECTION */}
                        {submitted.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                    <CheckCircle2 className="h-5 w-5 mr-2 text-indigo-500" />{" "}
                                    Submitted Applications ({submitted.length})
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {submitted.map((app) => (
                                        <ApplicationCard
                                            key={app.id}
                                            app={app}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </ApplicantLayout>
    );
}

// --- Reusable Card Component ---
function ApplicationCard({ app }) {
    const status = app.status;

    // Helper to parse the specific Laravel string from UTC to IST
    const convertToIST = (dateString) => {
        if (!dateString) return "N/A";

        // 1. Remove the " - " so JS can read it (turns into "Apr 16, 2026 01:44 PM")
        const cleanString = dateString.replace(" - ", " ");

        // 2. Append " UTC" so the browser knows the source timezone
        const date = new Date(`${cleanString} UTC`);

        // If parsing fails for any reason, just return the original string
        if (isNaN(date.getTime())) return dateString;

        // 3. Convert and format to IST
        return date
            .toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
            .replace(",", " -"); // Puts a nice hyphen back in if you want it
    };

    // Theme configuration based on status
    const theme = {
        draft: {
            border: "border-amber-200",
            bg: "bg-amber-50/40",
            indicator: "bg-amber-400",
            badge: "bg-amber-100 text-amber-700 border-amber-200",
            label: "Draft",
        },
        submitted: {
            border: "border-blue-200",
            bg: "bg-white",
            indicator: "bg-blue-500",
            badge: "bg-blue-100 text-blue-700 border-blue-200",
            label: "Under Review",
        },
        shortlisted: {
            border: "border-emerald-300",
            bg: "bg-emerald-50/40",
            indicator: "bg-emerald-500",
            badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
            label: "Shortlisted",
        },
        rejected: {
            border: "border-rose-200",
            bg: "bg-rose-50/30",
            indicator: "bg-rose-500",
            badge: "bg-rose-100 text-rose-700 border-rose-200",
            label: "Not Selected",
        },
    };

    const currentTheme = theme[status] || theme.submitted;
    const isDraft = status === "draft";

    return (
        <Card
            className={`relative overflow-hidden transition-all hover:shadow-md ${currentTheme.border} ${currentTheme.bg}`}
        >
            {/* Left Color Indicator Bar */}
            <div
                className={`absolute top-0 left-0 w-1 h-full ${currentTheme.indicator}`}
            />

            <CardContent className="p-5 pl-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1 pr-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Ref: {app.advertisement?.reference_number || "N/A"}
                        </span>
                        <h3 className="font-bold text-slate-900 leading-tight">
                            {app.advertisement?.title || "Untitled Application"}
                        </h3>
                    </div>
                    <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border shrink-0 ${currentTheme.badge}`}
                    >
                        {currentTheme.label}
                    </span>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center text-sm text-slate-600">
                        <Building2 className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                        <span className="truncate">
                            {app.department || "Department not selected"}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Briefcase className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                        <span>{app.grade || "Grade not selected"}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5 mr-2 shrink-0" />
                        <span>Last updated: {app.updated_at || "N/A"}</span>
                    </div>
                </div>

                {/* HOD Feedback Banners */}
                {status === "shortlisted" && (
                    <div className="mb-4 bg-emerald-100/50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex gap-2 items-start">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <p>
                            <strong>Congratulations!</strong> You have been
                            shortlisted. The department will contact you soon.
                        </p>
                    </div>
                )}
                {status === "rejected" && (
                    <div className="mb-4 bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex gap-2 items-start">
                        <XCircle className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                        <p>
                            Thank you for your interest. Unfortunately, you were
                            not selected for further progression.
                        </p>
                    </div>
                )}

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                    {isDraft ? (
                        <>
                            <div className="flex items-center text-xs font-medium text-amber-700 bg-amber-100/50 border border-amber-200 px-2 py-1 rounded">
                                <AlertCircle className="h-3 w-3 mr-1.5" /> Step{" "}
                                {app.current_step || 1} of 11
                            </div>
                            <Button
                                asChild
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-white shadow-none"
                            >
                                <Link
                                    href={route(
                                        "applicant.apply",
                                        app.advertisement?.id,
                                    )}
                                >
                                    Resume Draft{" "}
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                {status === "submitted" ? (
                                    <>
                                        <Clock className="h-3.5 w-3.5" /> Locked
                                        & Under Review
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                        Application Closed
                                    </>
                                )}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-none"
                                >
                                    <Link
                                        href={route(
                                            "applicant.applications.show",
                                            app.id,
                                        )}
                                    >
                                        <Eye className="h-4 w-4 mr-1.5 text-indigo-500" />{" "}
                                        View
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="..."
                                >
                                    <a
                                        href={route(
                                            "applicant.applications.export.pdf",
                                            app.id,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Download className="h-4 w-4 mr-1.5 text-red-500" />{" "}
                                        PDF
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
