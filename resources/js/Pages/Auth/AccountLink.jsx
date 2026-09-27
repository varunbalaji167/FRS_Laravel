import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Lock, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import ToastListener from "@/Components/ToastListener";

export default function AccountLink({ email }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("google.link.confirm"));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
            <ToastListener />
            <Head title="Confirm account link" />

            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-slate-900">
                        Confirm it&rsquo;s you
                    </h2>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        An account already exists for{" "}
                        <span className="font-bold text-slate-700">
                            {email}
                        </span>
                        . Enter its password to link your Google sign-in to
                        it.
                    </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="text-sm font-semibold text-slate-900"
                        >
                            Password
                        </Label>
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
                                autoFocus
                                className={`pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                disabled={processing}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
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
                                Linking...
                            </>
                        ) : (
                            "Confirm and link account"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
