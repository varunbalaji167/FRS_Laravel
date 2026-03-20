import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const roleColors = {
    hod:       'bg-purple-100 text-purple-700',
    applicant: 'bg-gray-100 text-gray-600',
};

export default function UsersIndex({ users }) {
    const [saving, setSaving] = useState(null);

    function updateRole(userId, newRole) {
        setSaving(userId);
        router.patch(`/admin/users/${userId}/role`, { role: newRole }, {
            onFinish: () => setSaving(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Manage Users" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
                    <p className="text-gray-500 text-sm mt-1">Assign or remove HOD roles for users.</p>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Current Role</th>
                                <th className="px-4 py-3 text-left">Change Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.map((user, i) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.role === 'applicant' ? (
                                            <button
                                                onClick={() => updateRole(user.id, 'hod')}
                                                disabled={saving === user.id}
                                                className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {saving === user.id ? 'Saving...' : 'Make HOD'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateRole(user.id, 'applicant')}
                                                disabled={saving === user.id}
                                                className="bg-gray-400 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-500 disabled:opacity-50"
                                            >
                                                {saving === user.id ? 'Saving...' : 'Remove HOD'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex gap-2 justify-end">
                    {users.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            className={`px-3 py-1 rounded text-sm border ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 hover:bg-gray-100'} disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}