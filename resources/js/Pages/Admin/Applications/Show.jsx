import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    submitted:   'bg-blue-100 text-blue-700',
    shortlisted: 'bg-green-100 text-green-700',
    rejected:    'bg-red-100 text-red-600',
};

function renderSection(data, depth = 0) {
    if (data === null || data === undefined) return <span className="text-gray-400">—</span>;
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return <span className="text-gray-800">{String(data)}</span>;
    }
    if (Array.isArray(data)) {
        return (
            <div className="space-y-3">
                {data.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">#{i + 1}</p>
                        {renderSection(item, depth + 1)}
                    </div>
                ))}
            </div>
        );
    }
    if (typeof data === 'object') {
        return (
            <div className="space-y-2">
                {Object.entries(data).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 gap-2">
                        <span className="text-gray-400 capitalize col-span-1">
                            {key.replace(/_/g, ' ')}
                        </span>
                        <span className="col-span-2 text-gray-800">
                            {typeof val === 'object' && val !== null
                                ? renderSection(val, depth + 1)
                                : (val !== null && val !== undefined ? String(val) : <span className="text-gray-300">—</span>)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

export default function ApplicationShow({ application }) {
    const [status, setStatus] = useState(application.status);
    const [saving, setSaving] = useState(false);

    function updateStatus(newStatus) {
        setSaving(true);
        router.patch(`/admin/applications/${application.id}`, { status: newStatus }, {
            onFinish: () => { setSaving(false); setStatus(newStatus); }
        });
    }

    const formData = application.form_data || {};

    return (
        <AdminLayout>
            <Head title={`Application #${application.id}`} />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Application #{application.id}</h1>
                        <p className="text-gray-500 text-sm mt-1">{application.advertisement?.title} — Ref: {application.advertisement?.reference_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                        {status}
                    </span>
                </div>

                {/* Applicant Info */}
                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="font-semibold text-gray-700 mb-3">Applicant</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Name</span>
                            <p className="font-medium">{application.user?.name}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Email</span>
                            <p className="font-medium">{application.user?.email}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Department</span>
                            <p className="font-medium">{application.department}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Grade</span>
                            <p className="font-medium">{application.grade}</p>
                        </div>
                    </div>
                </div>

                {/* Form Data */}
                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="font-semibold text-gray-700 mb-4">Application Details</h2>
                    <div className="space-y-6 text-sm">
                        {Object.entries(formData).map(([section, value]) => {
                            if (['uploaded_documents', 'current_step', 'declaration'].includes(section)) return null;
                            return (
                                <div key={section}>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 border-b border-gray-100 pb-2 capitalize">
                                        {section.replace(/_/g, ' ')}
                                    </h3>
                                    <div className="space-y-2">
                                        {renderSection(value)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Uploaded Documents */}
                {formData.uploaded_documents && Object.keys(formData.uploaded_documents).length > 0 && (
                    <div className="bg-white rounded-xl shadow p-5">
                        <h2 className="font-semibold text-gray-700 mb-3">Uploaded Documents</h2>
                        <ul className="space-y-2 text-sm">
                            {Object.entries(formData.uploaded_documents).map(([key, path]) => (
                                <li key={key}>
                                    <a href={`/storage/${path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline capitalize">
                                        {key.replace(/_/g, ' ')} ↗
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Status Actions */}
                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="font-semibold text-gray-700 mb-3">Update Status</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => updateStatus('shortlisted')}
                            disabled={saving || status === 'shortlisted'}
                            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                            Shortlist
                        </button>
                        <button
                            onClick={() => updateStatus('rejected')}
                            disabled={saving || status === 'rejected'}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => updateStatus('submitted')}
                            disabled={saving || status === 'submitted'}
                            className="bg-gray-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-500 disabled:opacity-50"
                        >
                            Reset to Submitted
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}