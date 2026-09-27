import { Head, Link, useForm } from "@inertiajs/react";
import { GraduationCap, Mail, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import ToastListener from "@/Components/ToastListener";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <div className="flex min-h-screen bg-white">
            <ToastListener />
            <Head title="Forgot Password" />

            {/* Left Panel - Branding Area */}
            <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between bg-slate-900 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2866&auto=format&fit=crop"
                    alt="IIT Indore Campus"
                    className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-slate-900/80 to-slate-900/60" />

                <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-tight uppercase">IIT Indore</p>
                            <p className="text-xs font-medium text-blue-200">Faculty Recruitment Portal</p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <h1 className="font-serif text-4xl font-bold leading-tight drop-shadow-sm">Account Recovery</h1>
                        <p className="mt-4 text-base text-slate-200 font-medium leading-relaxed">
                            Don&apos;t worry, it happens to the best of us. Let&apos;s get you back into your dashboard
                            securely.
                        </p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            &ldquo;Research is formalized curiosity. It is poking and prying with a purpose.&rdquo;
                        </p>
                        <p className="mt-2 text-xs font-medium text-blue-300">- Zora Neale Hurston</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Area */}
            <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:w-[45%]">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">IIT Indore</p>
                            <p className="text-xs font-medium text-slate-500">Faculty Recruitment</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                            <KeyRound className="h-6 w-6" />
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-slate-900">Forgot your password?</h2>
                        <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                            No problem. Just let us know your email address and we will email you a password reset link
                            that will allow you to choose a new one.
                        </p>
                    </div>

                    {/* Laravel's success message block */}
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-semibold text-green-700">{status}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-900">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    placeholder="your.email@example.com"
                                    className={`pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={processing}
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="h-11 font-bold mt-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...
                                </>
                            ) : (
                                "Email Password Reset Link"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center border-t border-slate-100 pt-6">
                        <Link
                            href={route("login")}
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
