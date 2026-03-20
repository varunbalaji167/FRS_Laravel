import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { GraduationCap, Lock, Mail, Eye, EyeOff, Loader2, User, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent } from "@/Components/ui/card";
import ToastListener from "@/Components/ToastListener";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("applicant");

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        role: "applicant",
    });

    const submit = (e) => {
        e.preventDefault();
        
        post(route("login"), {
            preserveScroll: true,
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="flex min-h-screen bg-white">
            <ToastListener />
            <Head title="Log in" />

            <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between bg-slate-900 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2866&auto=format&fit=crop"
                    alt="IIT Indore Campus"
                    className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-slate-900/80 to-slate-900/60" />

                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm tracking-tight uppercase">
                                IIT Indore
                            </p>
                            <p className="text-xs font-medium text-blue-200">
                                Faculty Recruitment Portal
                            </p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <h1 className="font-serif text-4xl font-bold text-white leading-tight">
                            Welcome Back to the Portal
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-slate-300">
                            Access your application, track your progress, or
                            manage the recruitment pipeline from your secure
                            dashboard.
                        </p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <blockquote className="text-sm text-slate-300 italic leading-relaxed">
                            &ldquo;Research is formalized curiosity. It is
                            poking and prying with a purpose.&rdquo;
                        </blockquote>
                        <p className="mt-2 text-xs font-medium text-blue-300">
                            - Zora Neale Hurston
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:w-[45%]">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">
                                IIT Indore
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                                Faculty Recruitment
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="font-serif text-2xl font-bold text-slate-900">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Select your portal and enter your credentials.
                        </p>
                    </div>

                    <div className="mb-6">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                            Select Portal
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setRole("applicant");
                                    setData("role", "applicant");
                                    reset("email", "password");
                                }}
                                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                                    role === "applicant"
                                        ? "border-blue-600 bg-blue-50 ring-4 ring-blue-600/10 shadow-sm"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${
                                        role === "applicant"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${role === "applicant" ? "text-blue-700" : "text-slate-700"}`}>
                                        Applicant
                                    </p>
                                    <p className={`text-xs font-medium ${role === "applicant" ? "text-blue-600/70" : "text-slate-500"}`}>
                                        Apply & track
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setRole("admin");
                                    setData("role", "admin");
                                    reset("email", "password");
                                }}
                                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                                    role === "admin"
                                        ? "border-blue-600 bg-blue-50 ring-4 ring-blue-600/10 shadow-sm"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${
                                        role === "admin"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${role === "admin" ? "text-blue-700" : "text-slate-700"}`}>
                                        Institute
                                    </p>
                                    <p className={`text-xs font-medium ${role === "admin" ? "text-blue-600/70" : "text-slate-500"}`}>
                                        Admin / Faculty
                                    </p>
                                </div>
                            </button>
                        </div>
                        
                        {/* Domain Restriction Warning for Admin UI */}
                        {role === 'admin' && (
                            <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 border border-amber-200">
                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-amber-800">
                                    <strong className="font-bold">Security Notice:</strong> Institute login is strictly restricted to active <span className="font-bold text-amber-900">@iiti.ac.in</span> email accounts.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Google Auth Button */}
                    <div className="mb-6">
                        <a 
                            href={route('google.redirect', { role: role })}
                            className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                        >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
                            </svg>
                            Sign in with Google
                        </a>

                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 font-medium text-slate-400">Or continue with email</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-sm font-semibold text-slate-900"
                            >
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    placeholder={
                                        role === "admin"
                                            ? "admin@iiti.ac.in"
                                            : "your.email@example.com"
                                    }
                                    className={`pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={processing}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs font-medium text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-slate-900"
                                >
                                    Password
                                </Label>
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    className={`pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-red-500">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="h-11 font-bold mt-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 mr-2" /> Sign In securely
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            New applicant?{" "}
                            <Link
                                href={route("register")}
                                className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>

                    <Card className="mt-8 border-dashed border-slate-200 bg-slate-50">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-center">
                                Demo Credentials
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                    <p className="font-bold text-slate-900 mb-1">
                                        Applicant
                                    </p>
                                    <p className="text-slate-500 font-medium">
                                        applicant@test.com
                                    </p>
                                    <p className="text-slate-400">password</p>
                                </div>
                                <div className="bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                    <p className="font-bold text-slate-900 mb-1">
                                        Admin
                                    </p>
                                    <p className="text-slate-500 font-medium">
                                        admin@iiti.ac.in
                                    </p>
                                    <p className="text-slate-400">password</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}