import HodLayout from "@/Layouts/HodLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { CheckCircle2, User, Lock } from "lucide-react";

import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

export default function Settings() {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || "",
        email: user.email || "",
    });

    const submitProfile = (e) => {
        e.preventDefault();
        patch(route("profile.update"));
    };

    return (
        <HodLayout>
            <Head title="Portal Settings" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Portal Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your account security and profile information.</p>
                </div>

                <div className="space-y-8">
                    {/* 1. Basic Profile Section */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <header className="mb-6 border-b border-slate-100 pb-4 flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
                                <p className="text-sm text-slate-500">Update your account&apos;s display name.</p>
                            </div>
                        </header>

                        <form onSubmit={submitProfile} className="space-y-6 max-w-xl">
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500 px-4 py-2.5"
                                    value={data.email}
                                    disabled
                                />
                                <p className="mt-1.5 text-xs text-slate-400">
                                    Your email address cannot be changed as it is tied to your institute login.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <PrimaryButton
                                    disabled={processing}
                                    className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:ring-indigo-500"
                                >
                                    Save Changes
                                </PrimaryButton>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out duration-300"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" /> Saved.
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </section>

                    {/* 2. Password Section */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <header className="mb-6 border-b border-slate-100 pb-4 flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Security & Password</h2>
                                <p className="text-sm text-slate-500">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>
                            </div>
                        </header>

                        {/* Negative top margin collapses UpdatePasswordForm's own header into the section heading above. */}
                        <div className="-mt-6">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    </section>
                </div>
            </div>
        </HodLayout>
    );
}
