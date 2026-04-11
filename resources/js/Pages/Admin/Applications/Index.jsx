import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState, useCallback } from "react";

const statusColors = {
    submitted:  "bg-blue-100 text-blue-700 border-blue-200",
    shortlisted:"bg-green-100 text-green-700 border-green-200",
    rejected:   "bg-red-100 text-red-600 border-red-200",
    inreview:   "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ApplicationsIndex({
    applications,
    advertisements,
    departments,
    filters,
}) {
    const [advFilter,    setAdvFilter]    = useState(filters.advertisement_id || "");
    const [deptFilter,   setDeptFilter]   = useState(filters.department || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");

    // Infinite-scroll state
    // allItems accumulates every row fetched across all pages.
    const [allItems, setAllItems] = useState(applications.data);
    const [loading,  setLoading]  = useState(false);

    // Whether there is a next page to fetch
    const hasNextPage  = applications.next_page_url !== null;
    // We store the next page number in a ref so the IntersectionObserver
    // callback always reads the latest value without needing to be re-created.
    const nextPageRef  = useRef(applications.current_page + 1);
    const sentinelRef  = useRef(null);   // invisible div at list bottom

    // Sync incoming Inertia prop → local accumulated list
    // Fires whenever Inertia delivers new `applications` data (filter change OR
    // next page scroll). We distinguish them by checking current_page:
    //   page 1  → filter/reset  → start fresh
    //   page 2+ → scroll load   → append
    useEffect(() => {
        if (applications.current_page === 1) {
            setAllItems(applications.data);
        } else {
            setAllItems((prev) => {
                const seen  = new Set(prev.map((a) => a.id));
                const fresh = applications.data.filter((a) => !seen.has(a.id));
                return [...prev, ...fresh];
            });
        }
        nextPageRef.current = applications.current_page + 1;
        setLoading(false);
    }, [applications]);

    // Fetch next page
    // `only: ['applications']` tells Inertia to do a partial reload — the server
    // returns just the paginated rows, not advertisements/departments/filters.
    // This makes scroll requests significantly faster.
    const loadNextPage = useCallback(() => {
        if (loading || !hasNextPage) return;
        setLoading(true);
        router.get(
            "/admin/applications",
            {
                advertisement_id: advFilter,
                department:       deptFilter,
                status:           statusFilter,
                page:             nextPageRef.current,
            },
            {
                preserveState:  true,
                preserveScroll: true,
                only:           ["applications"],
            },
        );
    }, [loading, hasNextPage, advFilter, deptFilter, statusFilter]);

    // IntersectionObserver — watches the sentinel div
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) loadNextPage(); },
            { rootMargin: "200px" },   // start loading 200 px before sentinel enters view
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadNextPage]);

    // Filter helpers─
    // Always resets to page 1. We clear allItems immediately so the table
    // doesn't flash stale rows while the request is in flight.
    function applyFilters() {
        setAllItems([]);
        router.get(
            "/admin/applications",
            {
                advertisement_id: advFilter,
                department:       deptFilter,
                status:           statusFilter,
                page:             1,
            },
            { preserveState: true, preserveScroll: false, only: ["applications"] },
        );
    }

    function clearFilters() {
        setAdvFilter("");
        setDeptFilter("");
        setStatusFilter("");
        setAllItems([]);
        router.get(
            "/admin/applications",
            { page: 1 },
            { preserveState: true, preserveScroll: false, only: ["applications"] },
        );
    }

    return (
        <AdminLayout>
            <Head title="Applications" />

            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Applications</h1>

                {/* ── Filters ── */}
                <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow border border-slate-100">
                    {/* Advertisement */}
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[200px]"
                        value={advFilter}
                        onChange={(e) => setAdvFilter(e.target.value)}
                    >
                        <option value="">All Advertisements</option>
                        {advertisements.map((ad) => (
                            <option key={ad.id} value={ad.id}>
                                {ad.reference_number} — {ad.title}
                            </option>
                        ))}
                    </select>

                    {/* Department */}
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[200px]"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                                {dept.name}
                            </option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="submitted">Submitted</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={applyFilters}
                            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="bg-slate-100 text-slate-600 px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-black tracking-wider border-b">
                            <tr>
                                <th className="px-5 py-4 text-left w-12">#</th>
                                <th className="px-5 py-4 text-left">Applicant</th>
                                <th className="px-5 py-4 text-left">Advertisement</th>
                                <th className="px-5 py-4 text-left">Department</th>
                                <th className="px-5 py-4 text-left">Grade</th>
                                <th className="px-5 py-4 text-left">Status</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allItems.map((app, i) => (
                                <tr
                                    key={app.id}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-5 py-4 text-slate-400 font-medium">
                                        {i + 1}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-bold text-slate-900 leading-tight">
                                            {app.user?.name}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-0.5">
                                            {app.user?.email}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p
                                            className="text-slate-700 font-medium truncate max-w-xs"
                                            title={app.advertisement?.title}
                                        >
                                            {app.advertisement?.title}
                                        </p>
                                        <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-tighter">
                                            Ref: {app.advertisement?.reference_number}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600 font-medium">
                                        {app.department}
                                    </td>
                                    <td className="px-5 py-4 text-slate-600 font-medium italic">
                                        {app.grade}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[app.status]}`}
                                        >
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/applications/${app.id}`}
                                            className="inline-flex items-center justify-center bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {allItems.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <p className="text-slate-400 font-medium">
                                            No applications found matching your criteria.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* ── Infinite-scroll sentinel ── */}
                    {/* This div sits below the last row. IntersectionObserver fires
                        loadNextPage() when it scrolls into view (200 px early). */}
                    <div ref={sentinelRef}>
                        {loading && <LoadingRow />}
                        {!loading && !hasNextPage && allItems.length > 0 && (
                            <p className="text-center text-xs text-slate-300 py-5 border-t border-slate-100">
                                All {allItems.length} application{allItems.length !== 1 ? "s" : ""} loaded
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function LoadingRow() {
    return (
        <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm border-t border-slate-100">
            <svg
                className="animate-spin h-4 w-4 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                />
            </svg>
            Loading more applications…
        </div>
    );
}
