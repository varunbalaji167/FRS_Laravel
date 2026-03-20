import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    FilePlus,
    FileText,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import ToastListener from "@/Components/ToastListener";

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const email = user.email;
    const role = user.role;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = role === 'admin';

    const navLinks = [
        {
            name: "Dashboard Overview",
            href: route("admin.dashboard"),
            icon: LayoutDashboard,
            active: route().current("admin.dashboard"),
            show: true,
        },
        {
            name: "Post New Job",
            href: route("admin.jobs.create"),
            icon: FilePlus,
            active: route().current("admin.jobs.create"),
            show: isAdmin,
        },
        {
            name: "Advertisements",
            href: route("admin.jobs.index"),
            icon: FileText,
            active: route().current("admin.jobs.index"),
            show: isAdmin,
        },
        {
            name: "Review Applications",
            href: route("admin.applications.index"),
            icon: Users,
            active: route().current("admin.applications.index"),
            show: true,
        },
        {
            name: "Manage Users",
            href: route("admin.users.index"),
            icon: Shield,
            active: route().current("admin.users.index"),
            show: isAdmin,
        },
        {
            name: "Portal Settings",
            href: "#",
            icon: Settings,
            active: false,
            show: true,
        },
    ].filter(link => link.show);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <ToastListener />

            {/*  DESKTOP SIDEBAR  */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-50 border-r border-slate-200 shadow-sm fixed inset-y-0 z-50">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 h-20 border-b bg-white">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">IIT Indore</p>
                        <p className="text-xs text-indigo-600 uppercase">
                            Admin
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-semibold ${
                                item.active
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="p-4 border-t bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                            {(email?.charAt(0) || "U").toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">
                                {email}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        asChild
                    >
                        <Link href={route("logout")} method="post" as="button">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Link>
                    </Button>
                </div>
            </aside>

            {/*  MAIN CONTENT  */}
            <div className="flex-1 md:ml-64 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden flex justify-between items-center bg-white h-16 px-4 border-b">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold">Admin</span>
                    </div>

                    <button
                        onClick={() =>
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                        }
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/*  MOBILE MENU  */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t p-4 space-y-3 shadow">
                        {/* Nav Links */}
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block p-3 rounded font-semibold ${
                                    item.active
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 text-slate-700"
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Divider */}
                        <div className="border-t pt-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                    {(email?.charAt(0) || "U").toUpperCase()}
                                </div>
                                <p className="text-sm font-semibold text-slate-700 truncate">
                                    {email}
                                </p>
                            </div>

                            {/* Logout */}
                            <Button
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                asChild
                            >
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}