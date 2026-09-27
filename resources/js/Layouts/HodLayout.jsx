import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { LayoutDashboard, Users, LogOut, Menu, X, Building2, Settings } from "lucide-react";
import { Button } from "@/Components/ui/button";
import ToastListener from "@/Components/ToastListener";

export default function HodLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const email = user.email;
    const department = user.department || "Department";

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        {
            name: "Dashboard",
            href: route("hod.dashboard"),
            icon: LayoutDashboard,
            active: route().current("hod.dashboard"),
        },
        {
            name: "Review Applications",
            href: route("hod.applications.index"),
            icon: Users,
            active: route().current("hod.applications.*"),
        },
        {
            name: "Portal Settings",
            href: route("hod.settings"),
            icon: Settings,
            active: route().current("hod.settings"),
            show: true,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <ToastListener />

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shadow-sm fixed inset-y-0 z-50">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800 bg-slate-950 shrink-0">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-600 text-white shrink-0">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        {/* Using title attribute for tooltip on hover since it truncates */}
                        <p className="font-bold text-white truncate text-sm" title={department}>
                            {department}
                        </p>
                        <p className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold mt-0.5">
                            HOD Portal
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-semibold transition-colors ${
                                item.active
                                    ? "bg-purple-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-purple-900/50 flex items-center justify-center font-bold text-purple-400 border border-purple-800 shrink-0">
                            {(email?.charAt(0) || "U").toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-300 truncate" title={email}>
                                {email}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full text-rose-400 border-slate-700 bg-slate-900 hover:bg-rose-950 hover:border-rose-900 transition-colors"
                        asChild
                    >
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="flex items-center justify-center"
                        >
                            <LogOut className="h-4 w-4 mr-2 text-white shrink-0" />
                            <span className="text-white">Logout</span>
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                {/* MOBILE HEADER */}
                <header className="md:hidden flex justify-between items-center bg-slate-900 h-16 px-4 border-b border-slate-800 shrink-0 sticky top-0 z-40">
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-purple-600 text-white shrink-0">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="block font-bold text-white text-sm truncate" title={department}>
                                {department}
                            </span>
                            <span className="block text-[10px] text-purple-400 uppercase tracking-wider font-semibold">
                                HOD Portal
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-slate-300 hover:text-white p-2 rounded-md hover:bg-slate-800 transition-colors shrink-0"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </header>

                {/* MOBILE MENU FULL SCREEN OVERLAY */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-30 bg-slate-900 pt-16 flex flex-col">
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-colors ${
                                        item.active
                                            ? "bg-purple-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    }`}
                                >
                                    <item.icon className="h-6 w-6 shrink-0" />
                                    <span className="text-base">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-slate-800 bg-slate-950 pb-8 shrink-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-full bg-purple-900/50 flex items-center justify-center font-bold text-purple-400 border border-purple-800 text-lg shrink-0">
                                    {(email?.charAt(0) || "U").toUpperCase()}
                                </div>
                                <div className="overflow-hidden min-w-0 flex-1">
                                    <p className="text-base font-bold text-slate-300 truncate">{email}</p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full py-6 text-base text-rose-400 border-slate-700 bg-slate-900 hover:bg-rose-950 hover:border-rose-900"
                                asChild
                            >
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="flex items-center justify-center"
                                >
                                    <LogOut className="h-5 w-5 mr-2" />
                                    <span>Logout</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* PAGE CONTENT */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">{children}</main>
            </div>
        </div>
    );
}
