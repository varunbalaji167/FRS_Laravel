import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    submitted:   'bg-blue-100 text-blue-700',
    shortlisted: 'bg-green-100 text-green-700',
    rejected:    'bg-red-100 text-red-600',
    draft:       'bg-gray-100 text-gray-500',
};

export default function ApplicationsIndex({ applications, advertisements, filters }) {
    const [advFilter, setAdvFilter] = useState(filters.advertisement_id || '');
    const [deptFilter, setDeptFilter] = useState(filters.department || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    function applyFilters() {
        router.get('/admin/applications', {
            advertisement_id: advFilter,
            department: deptFilter,
            status: statusFilter,
        }, { preserveState: true });
    }

    return (
        <AdminLayout>
            <Head title="Applications" />

            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Applications</h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow">
                    <select
                        className="border rounded-lg px-3 py-2 pr-8 text-sm appearance-none bg-white cursor-pointer"
                        value={advFilter}
                        onChange={(e) => setAdvFilter(e.target.value)}
                    >
                        <option value="">All Advertisements</option>
                        {advertisements.map((ad) => (
                            <option key={ad.id} value={ad.id}>{ad.reference_number} — {ad.title}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Filter by department..."
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    />

                    <select
                        className="border rounded-lg px-3 py-2 pr-8 text-sm appearance-none bg-white cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="submitted">Submitted</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <button
                        onClick={applyFilters}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                        Apply Filters
                    </button>

                    <button
                        onClick={() => {
                            setAdvFilter('');
                            setDeptFilter('');
                            setStatusFilter('');
                            router.get('/admin/applications', {}, { preserveState: true });
                        }}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
                    >
                        Clear
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Applicant</th>
                                <th className="px-4 py-3 text-left">Advertisement</th>
                                <th className="px-4 py-3 text-left">Department</th>
                                <th className="px-4 py-3 text-left">Grade</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {applications.data.map((app, i) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{app.user?.name}</p>
                                        <p className="text-gray-400 text-xs">{app.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{app.advertisement?.title}</td>
                                    <td className="px-4 py-3 text-gray-600">{app.department}</td>
                                    <td className="px-4 py-3 text-gray-600">{app.grade}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/applications/${app.id}`}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {applications.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        No applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex gap-2 justify-end">
                    {applications.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            className={`px-3 py-1 rounded text-sm border ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 hover:bg-gray-100'} disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}