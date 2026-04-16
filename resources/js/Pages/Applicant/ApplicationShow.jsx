import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { calculateAge } from "@/lib/dateUtils";
import {
    CheckCircle,
    XCircle,
    Download,
    FileSpreadsheet,
    User,
    GraduationCap,
    Briefcase,
    BookOpen,
    Award,
    PenTool,
    Users,
    FileText,
    Globe,
    Microscope,
    Layers,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from "lucide-react";

const statusColors = {
    draft: "bg-amber-100 text-amber-700 border-amber-200",
    submitted: "bg-blue-100 text-blue-700 border-blue-200",
    shortlisted: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-600 border-red-200",
};

//Collapsible Section wrapper
function Section({ title, icon, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-100 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="text-indigo-600">{icon}</div>
                    <h2 className="text-base font-bold text-slate-800">
                        {title}
                    </h2>
                </div>
                {open ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
            </button>
            {open && <div className="p-6">{children}</div>}
        </div>
    );
}

//Sub-section header inside a Section
function SubTitle({ label }) {
    return (
        <h4 className="font-bold text-sm text-slate-700 mb-3 mt-5 first:mt-0 bg-slate-100 px-3 py-1.5 rounded-md inline-block border border-slate-200">
            {label}
        </h4>
    );
}

//Key-value box
function DataBox({ label, value, span = false }) {
    return (
        <div className={span ? "col-span-full" : ""}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {label}
            </p>
            <p className="text-sm text-slate-900 font-medium break-words">
                {value || (
                    <span className="text-slate-300 font-normal italic">—</span>
                )}
            </p>
        </div>
    );
}

//Reusable table shell
function DataTable({ headers, children, emptyMsg = "No data provided." }) {
    return (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                        {headers.map((h) => (
                            <th
                                key={h}
                                className="px-4 py-2.5 whitespace-nowrap text-xs uppercase tracking-wide"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                    {children || (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="px-4 py-4 text-center text-slate-400 italic text-xs"
                            >
                                {emptyMsg}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

//Long-text statement block
function StatementBlock({ value }) {
    return (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[60px]">
            {value || (
                <span className="text-slate-400 italic">
                    No information provided.
                </span>
            )}
        </div>
    );
}

export default function ApplicationShow({ application }) {
    const status = application.status;

    const formData = application.form_data || {};
    const p = formData.personal_details || {};
    const edu = formData.education || {};
    const emp = formData.employment || {};
    const res = formData.research || {};
    const addInfo = formData.additional_info || {};
    const ap = formData.awards_projects || {};
    const stmts = formData.statements || {};
    const dpubs = formData.detailed_pubs || {};
    const refs = formData.referees_section?.referees || [];
    const docs = formData.uploaded_documents || {};

    // arrays (Step3: edu.pg, edu.ug, edu.school are arrays)
    const pgList = Array.isArray(edu.pg) ? edu.pg : edu.pg ? [edu.pg] : [];
    const ugList = Array.isArray(edu.ug) ? edu.ug : edu.ug ? [edu.ug] : [];
    const schoolList = Array.isArray(edu.school)
        ? edu.school
        : edu.school
          ? [edu.school]
          : [];

    const photoUrl = p.profile_image
        ? typeof p.profile_image === "string"
            ? `/storage/${p.profile_image}`
            : null
        : null;

    return (
        <ApplicantLayout>
            <Head
                title={`Application: ${p.first_name || application.user?.name}`}
            />

            {/* ── STICKY HEADER ──── */}
            <div className="sticky top-0 z-40 bg-white border-b shadow-sm px-6 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-4 min-w-0">
                    {photoUrl && (
                        <img
                            src={photoUrl}
                            alt="Applicant"
                            className="h-11 w-11 rounded-full object-cover border-2 border-indigo-200 shrink-0"
                        />
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold text-slate-900 truncate">
                                {[p.first_name, p.middle_name, p.last_name]
                                    .filter(Boolean)
                                    .join(" ") || application.user?.name}
                            </h1>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider shrink-0 ${statusColors[status]}`}
                            >
                                {status}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">
                            Ref:{" "}
                            <strong className="text-slate-700">
                                {application.advertisement?.reference_number}
                            </strong>
                            &nbsp;·&nbsp;Dept:{" "}
                            <strong className="text-slate-700">
                                {application.department}
                            </strong>
                            &nbsp;·&nbsp;Grade:{" "}
                            <strong className="text-slate-700">
                                {application.grade}
                            </strong>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <a
                            href={route(
                                "applicant.applications.export.pdf",
                                application.id,
                            )}
                            target="_blank"
                            className="flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm rounded-md transition-all gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5 text-red-500" />{" "}
                            PDF
                        </a>
                        <a
                            href={route(
                                "applicant.applications.export.excel",
                                application.id,
                            )}
                            className="flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm rounded-md transition-all gap-1.5"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />{" "}
                            Excel
                        </a>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* ── 1. PERSONAL DETAILS─ */}
                <Section
                    title="1. Personal Details"
                    icon={<User className="h-5 w-5" />}
                >
                    <div className="flex gap-6 mb-6">
                        {/* Photo */}
                        <div className="shrink-0">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt="Applicant Photo"
                                    className="h-28 w-24 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                                />
                            ) : (
                                <div className="h-28 w-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                                    <User className="h-10 w-10 text-slate-300" />
                                </div>
                            )}
                            <p className="text-xs text-center text-slate-400 mt-1">
                                Photo
                            </p>
                        </div>

                        {/* Core fields */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                            <DataBox
                                label="Full Name"
                                value={[
                                    p.first_name,
                                    p.middle_name,
                                    p.last_name,
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                span
                            />
                            <DataBox
                                label="Father's Name"
                                value={p.fathers_name}
                            />
                            <DataBox label="Date of Birth" value={p.dob} />
                            <DataBox
                                label="Age"
                                value={
                                    p.dob ? (
                                        <span className="inline-flex items-center text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                                            {calculateAge(p.dob)}
                                        </span>
                                    ) : (
                                        "—"
                                    )
                                }
                            />
                            <DataBox label="Gender" value={p.gender} />
                            <DataBox label="Category" value={p.category} />
                            <DataBox
                                label="Marital Status"
                                value={p.marital_status}
                            />
                            <DataBox
                                label="Nationality"
                                value={p.nationality}
                            />
                            <DataBox
                                label="ID Proof"
                                value={[p.id_proof_type, p.id_proof_number]
                                    .filter(Boolean)
                                    .join(": ")}
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 mb-5">
                        <DataBox
                            label="Primary Email"
                            value={p.email || application.user?.email}
                        />
                        <DataBox label="Alternate Email" value={p.alt_email} />
                        <DataBox
                            label="Primary Mobile"
                            value={
                                p.phone
                                    ? `${p.phone_code || "+91"} ${p.phone}`
                                    : null
                            }
                        />

                        <DataBox
                            label="Alternate Mobile"
                            value={
                                p.alt_phone
                                    ? `${p.alt_phone_code || "+91"} ${p.alt_phone}`
                                    : null
                            }
                        />
                    </div>

                    {/* Addresses */}
                    <div className="grid md:grid-cols-2 gap-5 border-t border-slate-100 pt-4">
                        {[
                            { label: "Correspondence Address", prefix: "corr" },
                            { label: "Permanent Address", prefix: "perm" },
                        ].map(({ label, prefix }) => (
                            <div key={prefix}>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    {label}
                                </p>
                                <p className="text-sm text-slate-800 leading-relaxed">
                                    {p[`${prefix}_address`] || "—"}
                                    <br />
                                    {[p[`${prefix}_city`], p[`${prefix}_state`]]
                                        .filter(Boolean)
                                        .join(", ")}
                                    <br />
                                    {p[`${prefix}_country`]}
                                    {p[`${prefix}_pincode`]
                                        ? ` – ${p[`${prefix}_pincode`]}`
                                        : ""}
                                </p>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ── 2. EDUCATIONAL QUALIFICATIONS ─────────── */}
                <Section
                    title="2. Educational Qualifications"
                    icon={<GraduationCap className="h-5 w-5" />}
                >
                    {/* PhD */}
                    <SubTitle label="(A) Ph.D. Details" />
                    {edu.phd && edu.phd.university ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4 pl-3 border-l-2 border-indigo-200 mb-2">
                            <DataBox
                                label="University / Institute"
                                value={edu.phd.university}
                            />
                            <DataBox
                                label="Department"
                                value={edu.phd.department}
                            />
                            <DataBox
                                label="Supervisor"
                                value={edu.phd.supervisor}
                            />
                            <DataBox
                                label="Date of Joining"
                                value={edu.phd.date_joining}
                            />
                            <DataBox
                                label="Date of Defence"
                                value={edu.phd.date_defence}
                            />
                            <DataBox
                                label="Date of Award"
                                value={edu.phd.date_award}
                            />
                            <DataBox
                                label="Duration (yy-mm-dd)"
                                value={edu.phd.duration}
                            />
                            <DataBox
                                label="Thesis Title"
                                value={edu.phd.title || edu.phd.thesis_title}
                                span
                            />
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic mb-2">
                            No PhD details provided.
                        </p>
                    )}

                    {/* PG */}
                    <SubTitle label="(B) Post-Graduate Details" />
                    <DataTable
                        headers={[
                            "#",
                            "Degree",
                            "University / Institute",
                            "Subjects",
                            "Date Joined",
                            "Date Graduated",
                            "Duration (YY-MM-DD)",
                            "% / CGPA",
                            "Division",
                        ]}
                    >
                        {pgList.length > 0 &&
                            pgList.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {row.degree || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.university || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.subjects || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.date_joining || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.date_graduation || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.duration || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.percentage || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.division || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* UG */}
                    <SubTitle label="(C) Under-Graduate Details" />
                    <DataTable
                        headers={[
                            "#",
                            "Degree",
                            "University / Institute",
                            "Subjects",
                            "Date Joined",
                            "Date Graduated",
                            "Duration (YY-MM-DD)",
                            "% / CGPA",
                            "Division",
                        ]}
                    >
                        {ugList.length > 0 &&
                            ugList.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {row.degree || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.university || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.subjects || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.date_joining || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.date_graduation || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.duration || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.percentage || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.division || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* School */}
                    <SubTitle label="(D) School Details" />
                    <DataTable
                        headers={[
                            "Level",
                            "School / Board",
                            "Year of Passing",
                            "% / CGPA",
                            "Division",
                        ]}
                    >
                        {schoolList.length > 0 &&
                            schoolList.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 font-medium text-slate-900">
                                        {/* Smart Fallback based on index */}
                                        {row.level ||
                                            (i === 0
                                                ? "12th/HSC/Diploma"
                                                : "10th")}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.school || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.year_passing || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.percentage || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {row.division || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>
                </Section>

                {/* ── 3. EMPLOYMENT  */}
                <Section
                    title="3. Employment & Experience"
                    icon={<Briefcase className="h-5 w-5" />}
                >
                    {/* Present */}
                    <SubTitle label="(A) Present Employment" />
                    {emp.present?.position ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100 mb-2">
                            <DataBox
                                label="Position"
                                value={emp.present.position}
                            />
                            <DataBox
                                label="Organization"
                                value={emp.present.organization}
                            />
                            <DataBox
                                label="Date of Joining"
                                value={emp.present.date_joining}
                            />
                            <DataBox
                                label="Date of Leaving"
                                value={emp.present.date_leaving || "Continuing"}
                            />
                            <DataBox
                                label="Duration (YY-MM-DD)"
                                value={emp.present.duration}
                            />
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic mb-2">
                            No present employment provided.
                        </p>
                    )}

                    {emp.has_three_years_exp && (
                        <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 border
                            ${emp.has_three_years_exp === "Yes" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}
                        >
                            {emp.has_three_years_exp === "Yes" ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5" />
                            )}
                            3-year post-PhD experience:{" "}
                            {emp.has_three_years_exp}
                        </div>
                    )}

                    {/* History */}
                    <SubTitle label="(B) Employment History" />
                    <DataTable
                        headers={[
                            "#",
                            "Position",
                            "Organization",
                            "Date Joined",
                            "Date Left",
                            "Duration (YY-MM-DD)",
                        ]}
                    >
                        {(emp.history || []).length > 0 &&
                            emp.history.map((h, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {h.position || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {h.organization || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {h.date_joining || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {h.date_leaving || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {h.duration || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* (C) Teaching Experience */}
                    <SubTitle label="(C) Teaching Experience" />
                    <DataTable
                        headers={[
                            "#",
                            "Position",
                            "Employer",
                            "Course Taught",
                            "Level (UG/PG)",
                            "Students",
                            "Date Joined",
                            "Date Left",
                            "Duration (YY-MM-DD)",
                        ]}
                    >
                        {(emp.teaching || []).length > 0 ? (
                            emp.teaching.map((e, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="px-4 py-2.5 text-slate-400 font-medium">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        {e.position || "—"}
                                    </td>
                                    <td className="px-4 py-3 ">
                                        {e.employer || "—"}
                                    </td>
                                    <td className="px-4 py-3 ">
                                        {e.courses || "—"}
                                    </td>
                                    <td className="px-4 py-3 ">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                            {e.level || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 ">
                                        {e.students || "0"}
                                    </td>
                                    <td className="px-4 py-3  whitespace-nowrap">
                                        {e.date_joining || "—"}
                                    </td>
                                    <td className="px-4 py-3  whitespace-nowrap">
                                        {e.date_leaving || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.duration || "00-00-00"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="px-4 py-8 text-center text-slate-400 italic"
                                >
                                    No teaching experience recorded.
                                </td>
                            </tr>
                        )}
                    </DataTable>
                    {/* Research */}
                    <SubTitle label="(D) Research Experience" />
                    <DataTable
                        headers={[
                            "#",
                            "Position",
                            "Institute",
                            "Supervisor",
                            "Date Joined",
                            "Date Left",
                            "Duration (YY-MM-DD)",
                        ]}
                    >
                        {(emp.research || []).length > 0 &&
                            emp.research.map((e, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {e.position || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.institute || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.supervisor || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.date_joining || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.date_leaving || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.duration || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* Industrial */}
                    <SubTitle label="(E) Industrial Experience" />
                    <DataTable
                        headers={[
                            "#",
                            "Organization",
                            "Work Profile",
                            "Date Joined",
                            "Date Left",
                            "Duration (YY-MM-DD)",
                        ]}
                    >
                        {(emp.industrial || []).length > 0 &&
                            emp.industrial.map((e, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {e.organization || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.profile || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.date_joining || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.date_leaving || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {e.duration || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>
                </Section>

                {/* ── 4. RESEARCH & PUBLICATIONS ────────────── */}
                <Section
                    title="4. Research & Publications"
                    icon={<Microscope className="h-5 w-5" />}
                >
                    {/* Specialization */}
                    <div className="grid md:grid-cols-2 gap-5 mb-5">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Area(s) of Specialization
                            </p>
                            <StatementBlock
                                value={
                                    res.specialization?.area_of_specialization
                                }
                            />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Current Area(s) of Research
                            </p>
                            <StatementBlock
                                value={
                                    res.specialization?.current_area_of_research
                                }
                            />
                        </div>
                    </div>

                    {/* Summary counts */}
                    <SubTitle label="Publication Summary" />
                    {res.summary && (
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-5">
                            {[
                                {
                                    label: "Intl. Journals",
                                    val: res.summary.intl_journals,
                                },
                                {
                                    label: "Natl. Journals",
                                    val: res.summary.natl_journals,
                                },
                                {
                                    label: "Intl. Conferences",
                                    val: res.summary.intl_conferences,
                                },
                                {
                                    label: "Natl. Conferences",
                                    val: res.summary.natl_conferences,
                                },
                                { label: "Patents", val: res.summary.patents },
                                { label: "Books", val: res.summary.books },
                                {
                                    label: "Book Chapters",
                                    val: res.summary.book_chapters,
                                },
                            ].map(({ label, val }) => (
                                <div
                                    key={label}
                                    className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center"
                                >
                                    <p className="text-2xl font-black text-indigo-700">
                                        {val || "0"}
                                    </p>
                                    <p className="text-xs text-indigo-500 mt-0.5 leading-tight">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Best publications */}
                    <SubTitle label="Best Research Publications (up to 10)" />
                    <DataTable
                        headers={[
                            "#",
                            "Title",
                            "Author(s)",
                            "Journal / Conference",
                            "Year",
                            "Vol. & Page",
                            "IF",
                            "DOI",
                            "Status",
                        ]}
                    >
                        {(res.publications || []).length > 0 &&
                            res.publications.map((pub, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium max-w-xs">
                                        {pub.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.authors || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.journal || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.year || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.vol_page || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.impact_factor || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.doi ? (
                                            <a
                                                href={pub.doi}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                Link{" "}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-bold ${pub.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                                        >
                                            {pub.status || "—"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </DataTable>
                </Section>

                {/* ── 5. ADDITIONAL INFORMATION  */}
                <Section
                    title="5. Additional Information"
                    icon={<Layers className="h-5 w-5" />}
                    defaultOpen={false}
                >
                    {/* Google Scholar */}
                    {addInfo.google_scholar && (
                        <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                            <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Google Scholar Profile
                                </p>
                                <a
                                    href={addInfo.google_scholar}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-600 hover:underline break-all"
                                >
                                    {addInfo.google_scholar}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Patents */}
                    <SubTitle label="(A) Patents" />
                    <DataTable
                        headers={[
                            "#",
                            "Inventor(s)",
                            "Title",
                            "Country",
                            "Patent No.",
                            "Date Filed",
                            "Date Published",
                            "Status",
                        ]}
                    >
                        {(addInfo.patents || []).length > 0 &&
                            addInfo.patents.map((pat, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pat.inventors || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {pat.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pat.country || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pat.number || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pat.date_filed || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pat.date_published || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pat.status || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* Books */}
                    <SubTitle label="(B) Books" />
                    <DataTable
                        headers={["#", "Author(s)", "Title", "Year", "ISBN"]}
                    >
                        {(addInfo.books || []).length > 0 &&
                            addInfo.books.map((bk, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {bk.authors || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {bk.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {bk.year || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {bk.isbn || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* Book Chapters */}
                    <SubTitle label="(C) Book Chapters" />
                    <DataTable
                        headers={["#", "Author(s)", "Title", "Year", "ISBN"]}
                    >
                        {(addInfo.book_chapters || []).length > 0 &&
                            addInfo.book_chapters.map((bc, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {bc.authors || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {bc.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {bc.year || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {bc.isbn || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* Societies */}
                    <SubTitle label="(D) Membership of Professional Societies" />
                    <DataTable
                        headers={["#", "Name of Society", "Membership Status"]}
                    >
                        {(addInfo.societies || []).length > 0 &&
                            addInfo.societies.map((soc, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {soc.name || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {soc.status || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* Training */}
                    <SubTitle label="(E) Professional Training" />
                    <DataTable
                        headers={[
                            "#",
                            "Type of Training",
                            "Organisation",
                            "Year",
                            "Duration (YY-MM-DD)",
                        ]}
                    >
                        {(addInfo.training || []).length > 0 &&
                            addInfo.training.map((tr, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {tr.type || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {tr.organization || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {tr.year || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {tr.duration || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>
                </Section>

                {/* ── 6. AWARDS, SUPERVISION & PROJECTS ────── */}
                <Section
                    title="6. Awards, Supervision & Projects"
                    icon={<Award className="h-5 w-5" />}
                    defaultOpen={false}
                >
                    {/* Awards */}
                    <SubTitle label="(A) Awards and Recognitions" />
                    <DataTable
                        headers={["#", "Name of Award", "Awarded By", "Year"]}
                    >
                        {(ap.awards || []).length > 0 &&
                            ap.awards.map((aw, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {aw.name || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {aw.awarded_by || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {aw.year || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* PhD Supervision */}
                    <SubTitle label="(B-i) PhD Thesis Supervision" />
                    <DataTable
                        headers={[
                            "#",
                            "Scholar Name",
                            "Thesis Title",
                            "Role",
                            "Status",
                            "Year",
                        ]}
                    >
                        {(ap.phd_supervision || []).length > 0 &&
                            ap.phd_supervision.map((sup, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {sup.student_name || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 max-w-xs">
                                        {sup.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.role || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.status || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.year || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* PG Supervision */}
                    <SubTitle label="(B-ii) M.Tech / Master's Supervision" />
                    <DataTable
                        headers={[
                            "#",
                            "Student Name",
                            "Thesis / Project Title",
                            "Role",
                            "Status",
                            "Year",
                        ]}
                    >
                        {(ap.pg_supervision || []).length > 0 &&
                            ap.pg_supervision.map((sup, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {sup.student_name || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 max-w-xs">
                                        {sup.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.role || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.status || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.year || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* UG Supervision */}
                    <SubTitle label="(B-iii) B.Tech / Bachelor's Supervision" />
                    <DataTable
                        headers={[
                            "#",
                            "Student Name",
                            "Project Title",
                            "Role",
                            "Status",
                            "Year",
                        ]}
                    >
                        {(ap.ug_supervision || []).length > 0 &&
                            ap.ug_supervision.map((sup, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {sup.student_name || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 max-w-xs">
                                        {sup.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.role || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.status || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sup.year || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* Sponsored Projects */}
                    <SubTitle label="(C-i) Sponsored Projects" />
                    <DataTable
                        headers={[
                            "#",
                            "Sponsoring Agency",
                            "Title",
                            "Amount",
                            "Period",
                            "Role",
                            "Status",
                        ]}
                    >
                        {(ap.sponsored_projects || []).length > 0 &&
                            ap.sponsored_projects.map((proj, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {proj.agency || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 max-w-xs">
                                        {proj.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.amount || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.period || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.role || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.status || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    {/* Consultancy Projects */}
                    <SubTitle label="(C-ii) Consultancy Projects" />
                    <DataTable
                        headers={[
                            "#",
                            "Organisation / Agency",
                            "Title",
                            "Amount",
                            "Period",
                            "Role",
                            "Status",
                        ]}
                    >
                        {(ap.consultancy_projects || []).length > 0 &&
                            ap.consultancy_projects.map((proj, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">
                                        {proj.agency || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 max-w-xs">
                                        {proj.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.amount || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.period || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.role || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {proj.status || "—"}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>
                </Section>

                {/* ── 7. STATEMENTS & FUTURE PLANS ──────────── */}
                <Section
                    title="7. Contributions & Future Plans"
                    icon={<PenTool className="h-5 w-5" />}
                >
                    {[
                        {
                            label: "(A) Significant Research Contribution & Future Plans",
                            key: "research_plan",
                        },
                        {
                            label: "(B) Significant Teaching Contribution & Future Plans",
                            key: "teaching_plan",
                        },
                        {
                            label: "(C) Professional Service as Reviewer / Editor etc.",
                            key: "professional_service",
                        },
                        {
                            label: "(D) Any Other Relevant Information",
                            key: "other_info",
                        },
                    ].map(({ label, key }) => (
                        <div key={key} className="mb-5 last:mb-0">
                            <h4 className="font-bold text-sm text-slate-700 mb-2 border-b border-slate-100 pb-1">
                                {label}
                            </h4>
                            <StatementBlock value={stmts[key]} />
                        </div>
                    ))}
                </Section>

                {/* ── 8. DETAILED PUBLICATIONS ─ */}
                <Section
                    title="8. Detailed Publications"
                    icon={<BookOpen className="h-5 w-5" />}
                    defaultOpen={false}
                >
                    <SubTitle label="(A) Journal Publications" />
                    <DataTable
                        headers={[
                            "#",
                            "Author(s)",
                            "Paper Title",
                            "Journal",
                            "Year",
                            "Vol.",
                            "Issue",
                            "Pages",
                            "IF",
                            "DOI",
                            "Status",
                        ]}
                    >
                        {(dpubs.journals || []).length > 0 &&
                            dpubs.journals.map((pub, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.authors || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium max-w-xs">
                                        {pub.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.journal_name || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.year || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.volume || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.issue || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.pages || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.impact_factor || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.doi ? (
                                            <a
                                                href={pub.doi}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                Link{" "}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-bold ${pub.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                                        >
                                            {pub.status || "—"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </DataTable>

                    <SubTitle label="(B) Conference Publications" />
                    <DataTable
                        headers={[
                            "#",
                            "Author(s)",
                            "Paper Title",
                            "Conference Name",
                            "Year",
                            "Pages",
                            "DOI",
                        ]}
                    >
                        {(dpubs.conferences || []).length > 0 &&
                            dpubs.conferences.map((pub, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2.5 text-slate-400">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.authors || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium max-w-xs">
                                        {pub.title || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.conference_name || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.year || "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {pub.pages || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {pub.doi ? (
                                            <a
                                                href={pub.doi}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                Link{" "}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </DataTable>
                </Section>

                {/* ── 9. REFEREES ── */}
                <Section
                    title="9. Referees"
                    icon={<Users className="h-5 w-5" />}
                >
                    {refs.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-4">
                            {refs.map((ref, i) => (
                                <div
                                    key={i}
                                    className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 leading-tight">
                                                {ref.name || "—"}
                                            </p>
                                            <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                                                {ref.position || "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                                        <p>
                                            <span className="font-bold text-slate-400 uppercase tracking-wide">
                                                Association:{" "}
                                            </span>
                                            {ref.association || "—"}
                                        </p>
                                        <p>
                                            <span className="font-bold text-slate-400 uppercase tracking-wide">
                                                Institute:{" "}
                                            </span>
                                            {ref.institute || "—"}
                                        </p>
                                        <p>
                                            <span className="font-bold text-slate-400 uppercase tracking-wide">
                                                Email:{" "}
                                            </span>
                                            <a
                                                href={`mailto:${ref.email}`}
                                                className="text-indigo-600 hover:underline"
                                            >
                                                {ref.email || "—"}
                                            </a>
                                        </p>
                                        {/* Field is stored as 'contact' in Step10, not 'phone' */}
                                        {ref.contact_number && (
                                            <p>
                                                <span className="font-bold text-slate-400 uppercase tracking-wide">
                                                    Phone:{" "}
                                                </span>
                                                {`${ref.contact_code || "+91"} ${ref.contact_number}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">
                            No referees provided.
                        </p>
                    )}
                </Section>
                {/* ── 10. UPLOADED DOCUMENTS ─── */}
                <Section
                    title="10. Uploaded Documents"
                    icon={<FileText className="h-5 w-5" />}
                >
                    {Object.keys(docs).length > 0 ? (
                        <div className="space-y-6">
                            {/* Standard Documents Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(docs)
                                    .filter(
                                        ([key, path]) =>
                                            path &&
                                            key.toLowerCase() !== "signature",
                                    )
                                    .map(([key, path]) => (
                                        <a
                                            key={key}
                                            href={`/storage/${path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-colors group"
                                        >
                                            <FileText className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 mr-3 shrink-0" />
                                            <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-700 capitalize leading-tight">
                                                {key.replace(/_/g, " ")}
                                            </span>
                                        </a>
                                    ))}
                            </div>

                            {/* Signature Section at the bottom */}
                            {Object.entries(docs).find(
                                ([key, path]) =>
                                    path && key.toLowerCase() === "signature",
                            ) && (
                                <div className="pt-6 border-t border-slate-100 flex flex-col items-start">
                                    <span className="text-sm font-semibold text-slate-500 mb-3 capitalize">
                                        Applicant Signature
                                    </span>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 inline-block">
                                        <img
                                            src={`/storage/${docs["signature"]}`}
                                            alt="Signature"
                                            className="max-h-20 object-contain mix-blend-multiply"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">
                            No documents uploaded.
                        </p>
                    )}
                </Section>
            </div>
        </ApplicantLayout>
    );
}
