import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts";

const STATUS_COLORS = {
    submitted: "#6366f1",
    shortlisted: "#22c55e",
    rejected: "#ef4444",
    draft: "#94a3b8",
};

const PIE_COLORS = [
    "#6366f1",
    "#22c55e",
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
    "#ec4899",
    "#14b8a6",
];

const statusBadge = {
    submitted: "bg-blue-100 text-blue-700",
    shortlisted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
    draft: "bg-gray-100 text-gray-500",
};

export default function Dashboard({
    stats,
    byDepartment,
    byAdvertisement,
    overTime,
    recentApplications,
    recentAdvertisements,
}) {
    const statusPieData = [
        {
            name: "Submitted",
            value: stats.submitted,
            color: STATUS_COLORS.submitted,
        },
        {
            name: "Shortlisted",
            value: stats.shortlisted,
            color: STATUS_COLORS.shortlisted,
        },
        {
            name: "Rejected",
            value: stats.rejected,
            color: STATUS_COLORS.rejected,
        },
    ].filter((d) => d.value > 0);

    const deptBarData = byDepartment.map((d) => ({
        name:
            d.department.length > 20
                ? d.department.substring(0, 20) + "…"
                : d.department,
        fullName: d.department,
        count: d.count,
    }));

    const advBarData = byAdvertisement.map((d) => ({
        name: d.advertisement
            ? d.advertisement.reference_number
            : d.advertisement_id,
        title: d.advertisement?.title || "",
        count: d.count,
    }));

    const timelineData = overTime.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
        }),
        Applications: d.count,
    }));

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="p-6 space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Faculty Recruitment System — IIT Indore
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Applications"
                        value={stats.totalApplications}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        label="Submitted"
                        value={stats.submitted}
                        color="bg-blue-500"
                    />
                    <StatCard
                        label="Shortlisted"
                        value={stats.shortlisted}
                        color="bg-green-500"
                    />
                    <StatCard
                        label="Rejected"
                        value={stats.rejected}
                        color="bg-red-500"
                    />
                    <StatCard
                        label="Drafts"
                        value={stats.drafts}
                        color="bg-gray-400"
                    />
                    <StatCard
                        label="Active Ads"
                        value={stats.activeAdvertisements}
                        color="bg-amber-500"
                    />
                    <StatCard
                        label="Total Ads"
                        value={stats.totalAdvertisements}
                        color="bg-purple-500"
                    />
                    <StatCard
                        label="Total Applicants"
                        value={stats.totalApplicants}
                        color="bg-teal-500"
                    />
                </div>

                {/* Row 1: Status Pie + Timeline */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Status Breakdown Pie */}
                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-semibold text-gray-700 mb-4">
                            Application Status Breakdown
                        </h2>
                        {statusPieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={statusPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, value }) =>
                                            `${name}: ${value}`
                                        }
                                    >
                                        {statusPieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>

                    {/* Applications Over Time */}
                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-semibold text-gray-700 mb-4">
                            Applications Over Last 30 Days
                        </h2>
                        {timelineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={timelineData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="Applications"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

                {/* Row 2: By Department + By Advertisement */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* By Department */}
                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-semibold text-gray-700 mb-4">
                            Applications by Department
                        </h2>
                        {deptBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={deptBarData} layout="vertical">
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        width={130}
                                    />
                                    <Tooltip
                                        formatter={(value, name, props) => [
                                            value,
                                            props.payload.fullName,
                                        ]}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#6366f1"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>

                    {/* By Advertisement */}
                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-semibold text-gray-700 mb-4">
                            Applications by Advertisement
                        </h2>
                        {advBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={advBarData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        formatter={(value, name, props) => [
                                            value,
                                            props.payload.title ||
                                                props.payload.name,
                                        ]}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {advBarData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    PIE_COLORS[
                                                        i % PIE_COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

                {/* Row 3: Recent Applications + Recent Advertisements */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent Applications */}
                    <div className="bg-white rounded-xl shadow p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-700">
                                Recent Applications
                            </h2>
                            <Link
                                href="/admin/applications"
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                        <ul className="divide-y">
                            {recentApplications.length > 0 ? (
                                recentApplications.map((app) => (
                                    <li
                                        key={app.id}
                                        className="py-3 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">
                                                {app.user?.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {app.advertisement?.title}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {app.department}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge[app.status]}`}
                                            >
                                                {app.status}
                                            </span>
                                            <Link
                                                href={`/admin/applications/${app.id}`}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm py-4 text-center">
                                    No applications yet.
                                </p>
                            )}
                        </ul>
                    </div>

                    {/* Recent Advertisements */}
                    <div className="bg-white rounded-xl shadow p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-700">
                                Recent Advertisements
                            </h2>
                            <Link
                                href="/admin/jobs"
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                        <ul className="divide-y">
                            {recentAdvertisements.map((ad) => (
                                <li
                                    key={ad.id}
                                    className="py-3 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">
                                            {ad.title}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Ref: {ad.reference_number}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Deadline:{" "}
                                            {new Date(
                                                ad.deadline,
                                            ).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium ${ad.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                                    >
                                        {ad.is_active ? "Active" : "Inactive"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className={`${color} text-white rounded-xl p-5 shadow`}>
            <p className="text-sm opacity-80">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="flex items-center justify-center h-64 text-gray-300 text-sm">
            No data available yet
        </div>
    );
}
