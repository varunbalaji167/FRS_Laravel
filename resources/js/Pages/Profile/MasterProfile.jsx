import ApplicantLayout from '@/Layouts/ApplicantLayout';
import { Head, usePage } from '@inertiajs/react';
import { BadgeCheck, MapPin, Mail, Phone, Sparkles, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import BasicProfileForm from './Partials/BasicProfileForm'; 

export default function MasterProfile({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const profile = user.applicant_profile || {}; // Reads the new 1-to-1 table data
    
    const initials = (user.name || 'U')
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <ApplicantLayout>
            <Head title="Master Profile" />

            <div className="space-y-8 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 min-h-screen">
                
                {/* HERO SECTION */}
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white shadow-2xl shadow-blue-950/20">
                    <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-blue-100 backdrop-blur">
                                <Sparkles className="h-3.5 w-3.5" />
                                IIT Indore Recruitment
                            </div>

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 ring-1 ring-inset ring-white/10 flex items-center justify-center text-4xl font-black">
                                    {profile.photo_path ? (
                                        <img src={`/storage/${profile.photo_path}`} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                        {user.name || 'Applicant Profile'}
                                    </h1>
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-100/80">
                                        {profile.designation || 'Faculty Applicant'} {profile.affiliation ? ` · ${profile.affiliation}` : ''}
                                    </p>
                                    <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                                        This is your permanent Master Profile. The details here will be used to automatically pre-fill your future applications.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* HERO SUMMARY CARDS */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 content-center">
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Contact</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white truncate">
                                    <Mail className="h-4 w-4 text-blue-200 shrink-0" /> {user.email || '-'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Phone</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white truncate">
                                    <Phone className="h-4 w-4 text-blue-200 shrink-0" /> {profile.phone || '-'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Location</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white truncate">
                                    <MapPin className="h-4 w-4 text-blue-200 shrink-0" /> {profile.corr_city || profile.perm_city || 'Not provided'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/70">Account Status</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-300 truncate">
                                    <BadgeCheck className="h-4 w-4 shrink-0" /> {mustVerifyEmail && !user.email_verified_at ? 'Pending Verification' : 'Verified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MAIN CONTENT GRID */}
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)] items-start">
                    
                    {/* LEFT COLUMN: Master Profile Form */}
                    <div className="space-y-8">
                        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                                        <UserRound className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Master Data</h2>
                                        <p className="mt-1 text-sm text-slate-500">Edit your core identity, addresses, and professional links.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 sm:px-8 bg-slate-50">
                                {/* Load the streamlined form we built previously */}
                                <BasicProfileForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-none" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Security & Deletion */}
                    <aside className="space-y-8">
                        {/* Security Section */}
                        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-md">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Security</h3>
                                        <p className="mt-1 text-sm text-slate-500">Update your password.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 bg-slate-50">
                                <UpdatePasswordForm className="max-w-none" />
                            </div>
                        </section>

                        {/* Account Deletion Section */}
                        <section className="overflow-hidden rounded-[1.75rem] border border-rose-200 bg-white shadow-sm">
                            <div className="border-b border-rose-100 px-6 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-sm">
                                        <Trash2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-rose-900">Danger Zone</h3>
                                        <p className="mt-1 text-sm text-rose-600/80">Permanently delete your account.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-6 bg-rose-50/30">
                                <DeleteUserForm className="max-w-none" />
                            </div>
                        </section>
                    </aside>

                </div>
            </div>
        </ApplicantLayout>
    );
}