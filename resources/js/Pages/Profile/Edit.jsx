import ApplicantLayout from '@/Layouts/ApplicantLayout';
import { Head, usePage } from '@inertiajs/react';
import { BadgeCheck, BookOpen, Building2, FileText, GraduationCap, MapPin, Mail, Phone, Sparkles, UserRound } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const initials = (user.name || 'U')
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const links = [
        ['Google Scholar', user.google_scholar_url],
        ['ORCID', user.orcid_url],
        ['LinkedIn', user.linkedin_url],
        ['GitHub', user.github_url],
        ['Website', user.personal_website_url],
    ];

    const documents = [
        ['CV', user.cv_path],
        ['Research statement', user.research_statement_document_path],
        ['Teaching statement', user.teaching_statement_document_path],
    ];

    return (
        <ApplicantLayout>
            <Head title="Faculty Profile" />

            <div className="space-y-8 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white shadow-2xl shadow-blue-950/20">
                    <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-blue-100 backdrop-blur">
                                <Sparkles className="h-3.5 w-3.5" />
                                Faculty recruitment portal
                            </div>

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="h-28 w-28 overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 ring-1 ring-inset ring-white/10">
                                    {user.photo_path ? (
                                        <img src={`/storage/${user.photo_path}`} alt={user.name || 'Profile photo'} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-3xl font-black">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                        {user.name || 'Applicant Profile'}
                                    </h1>
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-100/80">
                                        {user.designation || 'Faculty Applicant'}{user.affiliation ? ` · ${user.affiliation}` : ''}
                                    </p>
                                    <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                                        Maintain a complete academic profile for review, shortlisting, and professional sharing.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Contact</p>
                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white"><Phone className="h-4 w-4 text-blue-200" />{user.phone || user.email || '-'}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Location</p>
                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white"><MapPin className="h-4 w-4 text-blue-200" />{user.location || [user.city, user.state, user.country].filter(Boolean).join(', ') || '-'}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Qualification</p>
                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white"><GraduationCap className="h-4 w-4 text-blue-200" />{user.highest_qualification || '-'}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Affiliation</p>
                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white"><Building2 className="h-4 w-4 text-blue-200" />{user.affiliation || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Profile summary</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-blue-100/70">Email</p>
                                        <p className="mt-1 text-sm font-semibold text-white flex items-center gap-2"><Mail className="h-4 w-4 text-blue-200" />{user.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100/70">Role</p>
                                        <p className="mt-1 text-sm font-semibold text-white flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-blue-200" />{(user.role || 'applicant').toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100/70">Research focus</p>
                                        <p className="mt-1 text-sm font-semibold text-white">{user.research_areas || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100/70">Verification</p>
                                        <p className="mt-1 text-sm font-semibold text-white">{mustVerifyEmail && !user.email_verified_at ? 'Pending' : 'Verified'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Documents</p>
                                <div className="mt-3 space-y-2 text-sm text-white/90">
                                    {documents.map(([label, path]) => (
                                        <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                                            <span>{label}</span>
                                            <span className="text-xs text-blue-100/80">{path ? 'Uploaded' : 'Not added'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.9fr)]">
                    <div className="space-y-8">
                        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"><UserRound className="h-5 w-5" /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Basic information</h2>
                                        <p className="mt-1 text-sm text-slate-500">Identity, contact details, and location.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 sm:px-8">
                                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-none" />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><BookOpen className="h-5 w-5" /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Academic profile sections</h2>
                                        <p className="mt-1 text-sm text-slate-500">Education, research, publications, teaching, and service.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 px-6 py-6 sm:px-8 md:grid-cols-2">
                                {[
                                    'Education',
                                    'Research',
                                    'Publications',
                                    'Achievements',
                                    'Teaching experience',
                                    'Projects and research work',
                                    'Professional experience',
                                    'Skills',
                                    'Curriculum contributions',
                                    'Certifications',
                                    'Academic service',
                                    'Statement',
                                ].map((title) => (
                                    <div key={title} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                        <p className="text-sm font-bold text-slate-900">{title}</p>
                                        <p className="mt-1 text-sm text-slate-500">Editable in the form below.</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200"><FileText className="h-5 w-5" /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Documents</h2>
                                        <p className="mt-1 text-sm text-slate-500">CV and statements with downloadable files.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 px-6 py-6 sm:px-8 md:grid-cols-3">
                                {documents.map(([label, path]) => (
                                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-sm font-bold text-slate-900">{label}</p>
                                        <p className="mt-1 text-sm text-slate-500">{path ? 'Available for download' : 'Upload from the form'}</p>
                                        {path && (
                                            <a href={`/storage/${path}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm font-semibold text-blue-700 hover:underline">
                                                Download
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><BookOpen className="h-5 w-5" /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Security</h2>
                                        <p className="mt-1 text-sm text-slate-500">Password and account control.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 sm:px-8">
                                <UpdatePasswordForm className="max-w-none" />
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8">
                        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-6">
                                <h3 className="text-lg font-black text-slate-900">Profiles and links</h3>
                                <p className="mt-1 text-sm text-slate-500">Live professional profiles.</p>
                            </div>
                            <div className="space-y-3 px-6 py-6 text-sm">
                                {links.map(([label, value]) => (
                                    <div key={label} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                        <p className="font-bold text-slate-900">{label}</p>
                                        <p className="mt-1 break-all text-slate-600">{value || '-'}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[1.75rem] border border-rose-200 bg-white shadow-sm">
                            <div className="border-b border-rose-100 px-6 py-6">
                                <h3 className="text-lg font-black text-slate-900">Account removal</h3>
                                <p className="mt-1 text-sm text-slate-500">Permanent deletion.</p>
                            </div>
                            <div className="px-6 py-6">
                                <DeleteUserForm className="max-w-none" />
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </ApplicantLayout>
    );
}
