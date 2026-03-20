import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function JobsIndex({ advertisements }) {
    return (
        <AdminLayout>
            <Head title="Job Advertisements" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Job Advertisements</h1>
                    <Link
                        href="/admin/jobs/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                        + New Advertisement
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Reference</th>
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Deadline</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Document</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {advertisements.map((ad) => (
                                <tr key={ad.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-gray-600">{ad.reference_number}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{ad.title}</td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(ad.deadline).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {ad.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        
                                         <a   href={`/storage/${ad.document_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            View PDF ↗
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}