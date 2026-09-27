import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { GraduationCap, Briefcase, FileText, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/Components/ui/button";
import ToastListener from "@/Components/ToastListener";

export default function ApplicantLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const email = user.email;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        {
            name: "Open Positions",
            href: route("dashboard"),
            icon: Briefcase,
            active: route().current("dashboard"),
        },
        {
            name: "My Applications",
            href: route("applicant.applications"),
            icon: FileText,
            active: route().current("applicant.applications"),
        },
        {
            name: "Profile Settings",
            href: route("profile.edit"),
            icon: User,
            active: route().current("profile.edit"),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <ToastListener />

            {/*  DESKTOP SIDEBAR  */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed inset-y-0 z-50">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600">
                        <GraduationCap />
                    </div>
                    <div>
                        <p className="font-bold">IIT Indore</p>
                        <p className="text-xs text-blue-300">Applicant</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                                item.active ? "bg-blue-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                            {(email?.charAt(0) || "U").toUpperCase()}
                        </div>
                        <p className="text-sm truncate">{email}</p>
                    </div>

                    <Button variant="destructive" className="w-full" asChild>
                        <Link href={route("logout")} method="post" as="button">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Link>
                    </Button>
                </div>
            </aside>

            {/*  MAIN  */}
            <div className="flex-1 md:ml-64 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden flex justify-between items-center bg-slate-900 text-white h-16 px-4">
                    <div className="flex items-center gap-2">
                        <GraduationCap />
                        <span className="font-semibold">Applicant</span>
                    </div>

                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu />
                    </button>
                </header>

                {/*  MOBILE DRAWER  */}

                {/* Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
                )}

                {/* Drawer */}
                <div
                    className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 h-20 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600">
                                <GraduationCap />
                            </div>
                            <div>
                                <p className="font-bold">IIT Indore</p>
                                <p className="text-xs text-blue-300">Applicant</p>
                            </div>
                        </div>

                        <button onClick={() => setIsMobileMenuOpen(false)}>
                            <X />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="px-4 py-6 space-y-1">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                                    item.active ? "bg-blue-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* User */}
                    <div className="mt-auto p-4 border-t border-slate-800 absolute bottom-0 w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                                {(email?.charAt(0) || "U").toUpperCase()}
                            </div>
                            <p className="text-sm truncate">{email}</p>
                        </div>

                        <Button variant="destructive" className="w-full" asChild>
                            <Link href={route("logout")} method="post" as="button">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
