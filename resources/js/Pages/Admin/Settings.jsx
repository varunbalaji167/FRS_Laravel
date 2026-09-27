import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { CheckCircle2, User, Lock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import ConfirmDialog from "@/Components/ConfirmDialog";

export default function Settings({
    mustVerifyEmail,
    status,
    departments = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [deletingDept, setDeletingDept] = useState(null);
    const [isDeletingDept, setIsDeletingDept] = useState(false);

    // --- FORM 1: PROFILE UPDATE ---
    const profileForm = useForm({
        name: user.name || "",
        email: user.email || "",
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch(route("profile.update"), {
            preserveScroll: true,
        });
    };

    // --- FORM 2: DEPARTMENT MANAGEMENT ---
    const deptForm = useForm({
        name: "",
    });

    const addDept = (e) => {
        e.preventDefault();
        deptForm.post(route("admin.departments.store"), {
            onSuccess: () => deptForm.reset(),
            preserveScroll: true,
        });
    };

    const confirmDeleteDept = () => {
        setIsDeletingDept(true);
        router.delete(route("admin.departments.destroy", deletingDept.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingDept(null),
            onFinish: () => setIsDeletingDept(false),
        });
    };

    return (
        <AdminLayout>
            <Head title="Portal Settings" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Portal Settings
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage your account security, profile, and institute
                        departments.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* 1. Basic Profile Section */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <header className="mb-6 border-b border-slate-100 pb-4 flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Profile Information
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Update your display name.
                                </p>
                            </div>
                        </header>

                        <form
                            onSubmit={submitProfile}
                            className="space-y-6 max-w-xl"
                        >
                            <div>
                                <InputLabel
                                    htmlFor="profile_name"
                                    value="Full Name"
                                />
                                <TextInput
                                    id="profile_name"
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5"
                                    value={profileForm.data.name}
                                    onChange={(e) =>
                                        profileForm.setData(
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={profileForm.errors.name}
                                />
                            </div>

                            <div>
                                <InputLabel value="Email Address" />
                                <TextInput
                                    type="email"
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500 px-4 py-2.5"
                                    value={profileForm.data.email}
                                    disabled
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton
                                    disabled={profileForm.processing}
                                    className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                                >
                                    Save Changes
                                </PrimaryButton>

                                <Transition
                                    show={profileForm.recentlySuccessful}
                                    enter="transition ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out duration-300"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" />{" "}
                                        Saved.
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </section>

                    {/* 2. Department Management Section */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <header className="mb-6 border-b border-slate-100 pb-4 flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Department Management
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Manage departments available for
                                    recruitment.
                                </p>
                            </div>
                        </header>

                        <form onSubmit={addDept} className="flex gap-2 mb-8">
                            <div className="flex-1">
                                <TextInput
                                    placeholder="New department name..."
                                    value={deptForm.data.name}
                                    onChange={(e) =>
                                        deptForm.setData("name", e.target.value)
                                    }
                                    className="w-full rounded-xl"
                                />
                                <InputError
                                    message={deptForm.errors.name}
                                    className="mt-1"
                                />
                            </div>
                            <PrimaryButton
                                disabled={deptForm.processing}
                                className="rounded-xl px-6"
                            >
                                Add
                            </PrimaryButton>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {departments.map((dept) => (
                                <div
                                    key={dept.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group"
                                >
                                    <span className="text-sm font-semibold text-slate-700">
                                        {dept.name}
                                    </span>
                                    <button
                                        onClick={() => setDeletingDept(dept)}
                                        className="text-slate-300 hover:text-red-600 transition-colors p-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {departments.length === 0 && (
                                <p className="col-span-full text-center py-4 text-slate-400 text-sm italic">
                                    No departments added yet.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* 3. Password Section */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <header className="mb-6 border-b border-slate-100 pb-4 flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Security & Password
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Update your account security.
                                </p>
                            </div>
                        </header>

                        <div className="-mt-6">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    </section>
                </div>
            </div>

            <ConfirmDialog
                open={!!deletingDept}
                onOpenChange={(open) => !open && setDeletingDept(null)}
                title={`Delete "${deletingDept?.name}"?`}
                description="This action cannot be undone."
                confirmLabel="Delete Department"
                processing={isDeletingDept}
                onConfirm={confirmDeleteDept}
            />
        </AdminLayout>
    );
}
