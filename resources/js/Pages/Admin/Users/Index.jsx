import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, User as UserIcon, BookOpen } from 'lucide-react';

const roleStyles = {
    admin:     { bg: 'bg-rose-100', text: 'text-rose-700', icon: Shield },
    hod:       { bg: 'bg-purple-100', text: 'text-purple-700', icon: BookOpen },
    applicant: { bg: 'bg-gray-100', text: 'text-gray-600', icon: UserIcon },
};

export default function UsersIndex({ users, departments }) {
    const { auth } = usePage().props;
    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form for editing an existing user
    const editForm = useForm({
        role: 'applicant',
        department: '',
    });

    // Form for creating a brand new staff member
    const createForm = useForm({
        name: '',
        email: '',
        role: 'hod',
        department: '',
    });

    function openEditModal(user) {
        setEditingUser(user);
        editForm.setData({
            role: user.role,
            department: user.department || '',
        });
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.patch(route('admin.users.update-role', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    }

    function submitCreate(e) {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                setIsCreating(false);
                createForm.reset();
            },
        });
    }

    function deleteUser(user) {
        if (window.confirm(`Are you sure you want to completely delete ${user.name}? This action cannot be undone.`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    }

    return (
        <AdminLayout>
            <Head title="Manage Users" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Directory Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage system access, assign HODs, and provision administrative accounts.</p>
                    </div>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Staff Member
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Name & Email</th>
                                <th className="px-6 py-4">System Role</th>
                                <th className="px-6 py-4">Assigned Department</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.data.map((user) => {
                                const RoleIcon = roleStyles[user.role]?.icon || UserIcon;
                                const isSelf = user.id === auth.user.id;
                                
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{user.name} {isSelf && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-2">You</span>}</div>
                                            <div className="text-slate-500 text-xs mt-0.5">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${roleStyles[user.role]?.bg} ${roleStyles[user.role]?.text}`}>
                                                <RoleIcon className="h-3 w-3 mr-1.5" />
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {user.department || <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-indigo-600 hover:text-indigo-900 transition"
                                                title="Edit Role"
                                            >
                                                <Edit2 className="h-4 w-4 inline" />
                                            </button>
                                            {!isSelf && (
                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4 inline" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        No users found in the system.
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
                            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {/* MODAL: EDIT ROLE */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl border border-slate-100">
                        <h2 className="text-xl font-bold mb-1 text-slate-900">Modify Access</h2>
                        <p className="text-sm text-slate-500 mb-6">Updating permissions for <span className="font-semibold text-slate-700">{editingUser.name}</span></p>
                        
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">System Role</label>
                                <select 
                                    className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    value={editForm.data.role}
                                    onChange={(e) => {
                                        editForm.setData("role", e.target.value);
                                        if (e.target.value !== "hod") editForm.setData("department", "");
                                    }}
                                >
                                    <option value="applicant">Applicant</option>
                                    <option value="hod">Head of Department (HOD)</option>
                                    <option value="admin">System Administrator</option>
                                </select>
                                {editForm.errors.role && <span className="text-red-500 text-xs mt-1 block">{editForm.errors.role}</span>}
                            </div>

                            {editForm.data.role === "hod" && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Assign Department</label>
                                    <select 
                                        className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        value={editForm.data.department}
                                        onChange={(e) => editForm.setData("department", e.target.value)}
                                        required={editForm.data.role === "hod"}
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                    {editForm.errors.department && <span className="text-red-500 text-xs mt-1 block">{editForm.errors.department}</span>}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"
                                    onClick={() => { setEditingUser(null); editForm.reset(); }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing ? 'Saving...' : 'Confirm Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CREATE USER */}
            {isCreating && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl border border-slate-100">
                        <h2 className="text-xl font-bold mb-1 text-slate-900">Provision Staff Account</h2>
                        <p className="text-sm text-slate-500 mb-6">Manually create an Admin or HOD profile.</p>
                        
                        <form onSubmit={submitCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input 
                                    type="text"
                                    className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData("name", e.target.value)}
                                    required
                                />
                                {createForm.errors.name && <span className="text-red-500 text-xs mt-1 block">{createForm.errors.name}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Institute Email (@iiti.ac.in)</label>
                                <input 
                                    type="email"
                                    className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData("email", e.target.value)}
                                    required
                                />
                                {createForm.errors.email && <span className="text-red-500 text-xs mt-1 block">{createForm.errors.email}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">System Role</label>
                                <select 
                                    className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    value={createForm.data.role}
                                    onChange={(e) => {
                                        createForm.setData("role", e.target.value);
                                        if (e.target.value !== "hod") createForm.setData("department", "");
                                    }}
                                >
                                    <option value="hod">Head of Department (HOD)</option>
                                    <option value="admin">System Administrator</option>
                                </select>
                            </div>

                            {createForm.data.role === "hod" && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Assign Department</label>
                                    <select 
                                        className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        value={createForm.data.department}
                                        onChange={(e) => createForm.setData("department", e.target.value)}
                                        required={createForm.data.role === "hod"}
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"
                                    onClick={() => { setIsCreating(false); createForm.reset(); }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                                    disabled={createForm.processing}
                                >
                                    {createForm.processing ? 'Creating...' : 'Provision Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}