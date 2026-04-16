import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    GraduationCap,
    ArrowRight,
    Briefcase,
    Globe,
    Award,
    ChevronRight,
    CalendarDays,
    Building2,
    Download,
    FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ToastListener from "@/Components/ToastListener";

export default function Welcome({ auth, advertisements = [] }) {
    const user = auth?.user;

    const getDashboardRoute = () => {
        if (!user) return route("login");
        if (user.role === "admin") return route("admin.dashboard");
        if (user.role === "hod") return route("hod.dashboard");
        return route("dashboard");
    };

    const getPortalName = () => {
        if (user?.role === "admin") return "Admin Portal";
        if (user?.role === "hod") return "HOD Portal";
        return "Application Portal";
    };

    /**
     * Called when a guest clicks "Apply Now".
     * Shows a live countdown toast and redirects to the login page.
     */
    const handleGuestApply = (e) => {
        e.preventDefault();

        let counter = 5;

        // 1. Create the initial toast and capture its unique ID
        const toastId = toast.info("Please sign in to apply", {
            description: `Redirecting to the login page in ${counter} seconds...`,
            duration: 6000, // Keep alive slightly longer than the countdown
        });

        // 2. Start a 1-second interval
        const timer = setInterval(() => {
            counter--;

            if (counter > 0) {
                // Update the existing toast with the new number
                toast.info("Please sign in to apply", {
                    id: toastId, // This targets the toast we already opened!
                    description: `Redirecting to the login page in ${counter} ${counter === 1 ? "second" : "seconds"}...`,
                    duration: 6000,
                });
            } else {
                // 3. When it hits 0, clear the timer and redirect
                clearInterval(timer);
                toast.loading("Redirecting now...", { id: toastId });
                window.location.href = route("login");
            }
        }, 1000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            <ToastListener />
            <Head title="Faculty Recruitment Portal | IIT Indore" />

            {/* ── Glassmorphism Header ───────────────────────────── */}
            <header className="fixed top-0 z-[100] w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl transition-all duration-300">
                <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                IIT INDORE
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase">
                                Faculty Recruitment
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="hidden md:block text-sm font-semibold text-slate-500 italic">
                                    Welcome back, {user.name.split(" ")[0]}
                                </span>
                                <Button
                                    className="bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-md rounded-full px-6"
                                    asChild
                                >
                                    <Link href={getDashboardRoute()}>
                                        Dashboard{" "}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href={route("login")}
                                    className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Button
                                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-full px-8 h-11 transition-all hover:-translate-y-0.5"
                                    asChild
                                >
                                    <Link href={route("register")}>
                                        Register
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* ── Hero Section ─────────────────────────────────── */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-950">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?q=80&w=2940&auto=format&fit=crop"
                            alt="Academic Excellence"
                            className="h-full w-full object-cover opacity-30 grayscale-[0.5]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="container relative mx-auto px-6 lg:px-12 z-10"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-300 backdrop-blur-md mb-8 tracking-widest uppercase"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-3 animate-pulse" />
                            Recruitment Window 2026
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl max-w-5xl leading-[1.1]"
                        >
                            Join the{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                                Intellectual Elite
                            </span>{" "}
                            at IIT Indore
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="mt-8 text-xl leading-relaxed text-slate-300 max-w-2xl font-medium"
                        >
                            We are looking for visionaries, researchers, and
                            mentors to drive innovation at India's
                            fastest-growing Institute of National Importance.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="mt-12 flex flex-wrap items-center gap-6"
                        >
                            {user ? (
                                <Button
                                    size="lg"
                                    className="h-16 px-10 text-lg bg-blue-600 text-white hover:bg-blue-500 rounded-full shadow-2xl shadow-blue-600/30 transition-all group"
                                    asChild
                                >
                                    <Link href={getDashboardRoute()}>
                                        Enter {getPortalName()}{" "}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="lg"
                                        className="h-16 px-10 text-lg bg-white text-slate-950 hover:bg-blue-50 rounded-full shadow-2xl transition-all"
                                        asChild
                                    >
                                        <Link href={route("register")}>
                                            Start New Application
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-16 px-10 text-lg border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 rounded-full transition-all"
                                        asChild
                                    >
                                        <Link href={route("login")}>
                                            Member Login
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </section>

                {/* ── Impact Stats ─────────────────────────────────── */}
                <section className="bg-white py-12">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-slate-100 py-12">
                            <div className="text-center group">
                                <div className="text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                    #12
                                </div>
                                <div className="text-sm font-bold text-blue-600 uppercase tracking-tighter mt-1">
                                    NIRF Engineering 2025
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 mt-1">
                                    Top 10 in Innovation
                                </div>
                            </div>
                            <div className="text-center group">
                                <div className="text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                    500+
                                </div>
                                <div className="text-sm font-bold text-blue-600 uppercase tracking-tighter mt-1">
                                    Annual Publications
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 mt-1">
                                    59.55 RPC Score
                                </div>
                            </div>
                            <div className="text-center group">
                                <div className="text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                    100+
                                </div>
                                <div className="text-sm font-bold text-blue-600 uppercase tracking-tighter mt-1">
                                    Granted Patents
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 mt-1">
                                    112% Surge in Filings
                                </div>
                            </div>
                            <div className="text-center group">
                                <div className="text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                    ₹725Cr+
                                </div>
                                <div className="text-sm font-bold text-blue-600 uppercase tracking-tighter mt-1">
                                    Research & Infra Funding
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 mt-1">
                                    Including ANRF PAIR Grant
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Latest Advertisements ────────────────────────── */}
                {advertisements.length > 0 && (
                    <section className="py-24 bg-white">
                        <div className="container mx-auto px-6 lg:px-12">
                            {/* Section header */}
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                                <div>
                                    <p className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-3">
                                        Open Positions
                                    </p>
                                    <h2 className="text-4xl font-black text-slate-900">
                                        Latest Recruitment Drives
                                    </h2>
                                    <p className="mt-3 text-slate-500 font-medium max-w-xl">
                                        Active openings across IIT Indore
                                        departments. Register or sign in to
                                        apply.
                                    </p>
                                </div>

                                {/* If the user is an applicant, link to their full dashboard */}
                                {user?.role === "applicant" && (
                                    <Link
                                        href={route("dashboard")}
                                        className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        View all openings{" "}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>

                            {/* Advertisement cards */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                                {advertisements.map((advt, index) => (
                                    <AdvertisementCard
                                        key={advt.id}
                                        advt={advt}
                                        index={index}
                                        user={user}
                                        onGuestApply={handleGuestApply}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Features / Why Join ───────────────────────────── */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-3xl mb-16">
                            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-4">
                                Why IIT Indore?
                            </h2>
                            <p className="text-4xl font-black text-slate-900">
                                Unparalleled support for academic growth and
                                groundbreaking research.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="p-10 rounded-3xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-xl"
                            >
                                <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                                    <Briefcase className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    Dynamic Career Path
                                </h3>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    Defined progression from Assistant Professor
                                    to Institute Chair Professor with
                                    merit-based incentives.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -10 }}
                                className="p-10 rounded-3xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-xl"
                            >
                                <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                                    <Globe className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    Global Network
                                </h3>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    International research collaborations and
                                    generous funding for global conferences and
                                    sabbaticals.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -10 }}
                                className="p-10 rounded-3xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-xl"
                            >
                                <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8">
                                    <Award className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    World-Class Facilities
                                </h3>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    State-of-the-art labs and a 500-acre
                                    residential campus designed for holistic
                                    academic living.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── Call to Action ────────────────────────────────── */}
                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="rounded-[3rem] bg-gradient-to-br from-blue-700 to-indigo-900 p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                                    Ready to define the next <br /> decade of
                                    innovation?
                                </h2>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Button
                                        size="lg"
                                        className="h-16 px-12 bg-white text-blue-700 hover:bg-slate-100 rounded-full font-black transition-all shadow-xl"
                                        asChild
                                    >
                                        <Link href={route("register")}>
                                            Create Applicant Account
                                        </Link>
                                    </Button>
                                    <Link
                                        href="/faq"
                                        className="h-16 px-12 inline-flex items-center text-white font-bold hover:underline decoration-2 underline-offset-8"
                                    >
                                        Read Recruitment FAQs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="bg-slate-50 border-t border-slate-200 py-16">
                <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <GraduationCap className="h-6 w-6 text-blue-600" />
                            <span className="text-lg font-black tracking-tight text-slate-900">
                                IIT INDORE FRS
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Empowering the future of Indian engineering and
                            research through a transparent, merit-based faculty
                            selection process.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">
                            Helpful Links
                        </h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    Information Brochure
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    Pay Scales & Benefits
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    Technical Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">
                            Institute Contact
                        </h4>
                        <p className="text-slate-500 text-sm font-medium mb-4 italic">
                            Indian Institute of Technology Indore
                            <br />
                            Khandwa Road, Simrol, Indore 453552
                            <br />
                            Madhya Pradesh, India
                        </p>
                        <p className="text-blue-600 text-sm font-black">
                            fag@iiti.ac.in
                        </p>
                    </div>
                </div>
                <div className="container mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-slate-400">
                        &copy; {new Date().getFullYear()} IIT Indore. Managed by
                        Faculty Affairs Section.
                    </p>
                    <div className="flex gap-6">
                        <Link
                            href="#"
                            className="text-xs font-bold text-slate-400 hover:text-slate-900"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="#"
                            className="text-xs font-bold text-slate-400 hover:text-slate-900"
                        >
                            Terms of Use
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Advertisement Card 
───────────────────────────────────────────────────────────── */
function AdvertisementCard({ advt, index, user, onGuestApply }) {
    const isApplicant = user?.role === "applicant";
    const isStaff = user?.role === "admin" || user?.role === "hod";

    const deadlineDate = new Date(advt.deadline);
    const isPastDeadline = deadlineDate < new Date();
    const formattedDate = deadlineDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 group bg-white border-none ring-1 ring-slate-200 rounded-xl"
        >
            {/* Top Color Bar */}
            <div
                className={`h-1.5 w-full rounded-t-xl ${isPastDeadline ? "bg-slate-400" : "bg-blue-600"}`}
            ></div>

            <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <FileText className="h-5 w-5" />
                    </div>
                </div>
                <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">
                    Ref: {advt.reference_number}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    {advt.title}
                </h3>
            </div>

            <div className="p-6 pt-0 flex-grow pb-6 space-y-5">
                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-2 rounded shadow-sm border border-slate-200">
                        <CalendarDays
                            className={`h-5 w-5 ${isPastDeadline ? "text-slate-400" : "text-red-500"}`}
                        />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                            Application Deadline
                        </p>
                        <p
                            className={`text-sm font-semibold ${isPastDeadline ? "text-slate-400 line-through" : ""}`}
                        >
                            {formattedDate}
                        </p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-800">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-bold">
                            Applicable Departments / Schools:
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Object.keys(advt.departments || {}).map(
                            (dept, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm"
                                >
                                    {dept}
                                </span>
                            ),
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center p-6 pt-4 pb-6 bg-slate-50/50 border-t border-slate-100 flex-col sm:flex-row gap-3 rounded-b-xl">
                <a
                    href={`/storage/${advt.document_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-1/2"
                >
                    <Button
                        variant="outline"
                        className="w-full bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-bold shadow-sm"
                    >
                        <Download className="mr-2 h-4 w-4" /> View PDF
                    </Button>
                </a>

                {/* Smart Button Rendering based on Auth State */}
                {isPastDeadline ? (
                    <Button
                        disabled
                        className="w-full sm:w-1/2 bg-slate-200 text-slate-500 font-bold cursor-not-allowed"
                    >
                        Closed
                    </Button>
                ) : isStaff ? (
                    <Button
                        disabled
                        variant="outline"
                        className="w-full sm:w-1/2 font-bold text-slate-500 border-slate-200 bg-white shadow-sm"
                    >
                        Staff View
                    </Button>
                ) : isApplicant ? (
                    <Link
                        href={route("applicant.apply", advt.id)}
                        className="w-full sm:w-1/2"
                    >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition-all">
                            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                ) : (
                    // Guest state
                    <Button
                        onClick={onGuestApply}
                        className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
