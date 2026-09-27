import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { GraduationCap, Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import ToastListener from "@/Components/ToastListener";

export default function ResetPassword({ token, email }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"), {
            preserveScroll: true,
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="flex min-h-screen bg-white">
            <ToastListener />
            <Head title="Reset Password" />

            {/* Left Panel - Branding Area */}
            <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between bg-slate-900 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2940&auto=format&fit=crop"
                    alt="IIT Indore Library"
                    className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-slate-900/80 to-slate-900/60" />

                <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-tight uppercase">IIT Indore</p>
                            <p className="text-xs font-medium text-indigo-200">Faculty Recruitment Portal</p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <h1 className="font-serif text-4xl font-bold leading-tight drop-shadow-sm">
                            Secure your account
                        </h1>
                        <p className="mt-4 text-base text-slate-200 font-medium leading-relaxed">
                            Please choose a strong, unique password to protect your recruitment data and applications.
                        </p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            &ldquo;The function of education is to teach one to think intensively and to think
                            critically.&rdquo;
                        </p>
                        <p className="mt-2 text-xs font-medium text-indigo-300">- Martin Luther King Jr.</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Area */}
            <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:w-[45%]">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">IIT Indore</p>
                            <p className="text-xs font-medium text-slate-500">Faculty Recruitment</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-slate-900">Set new password</h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Almost there! Enter your new password below.
                        </p>
                    </div>

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
                                    className={`pl-10 h-11 bg-slate-50 border-slate-200 text-slate-500 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={true}
                                />
                            </div>
                            {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-900">
                                New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder="Enter new password"
                                    className={`pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={processing}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs font-medium text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-900">
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password_confirmation"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                    placeholder="Confirm new password"
                                    className="pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                                    disabled={processing}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="h-11 font-bold mt-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
