import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function InlineFacultyProfileForm({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const [editingField, setEditingField] = useState(null);

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        photo: null,
        phone: user.phone || '',
        designation: user.designation || '',
        affiliation: user.affiliation || '',
        location: user.location || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        category: user.category || '',
        caste: user.caste || '',
        address_line_1: user.address_line_1 || '',
        address_line_2: user.address_line_2 || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || '',
        highest_qualification: user.highest_qualification || '',
        education_institution: user.education_institution || '',
        education_year: user.education_year || '',
        education_details: user.education_details || '',
        thesis_details: user.thesis_details || '',
        supervisors: user.supervisors || '',
        research_areas: user.research_areas || '',
        research_statement: user.research_statement || '',
        publications: user.publications || '',
        achievements: user.achievements || '',
        teaching_experience: user.teaching_experience || '',
        teaching_philosophy: user.teaching_philosophy || '',
        projects_research_work: user.projects_research_work || '',
        professional_experience: user.professional_experience || '',
        skills: user.skills || '',
        curriculum_contributions: user.curriculum_contributions || '',
        certifications: user.certifications || '',
        academic_service: user.academic_service || '',
        google_scholar_url: user.google_scholar_url || '',
        orcid_url: user.orcid_url || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        personal_website_url: user.personal_website_url || '',
        statement: user.statement || '',
        cv: null,
        research_statement_document: null,
        teaching_statement_document: null,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setEditingField(null),
        });
    };

    const handleFileChange = (field) => (e) => {
        setData(field, e.target.files?.[0] || null);
    };

    const cancelEdit = (field) => {
        reset(field);
        setEditingField(null);
    };

    const inputClass =
        'mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500';
    const textAreaClass = `${inputClass} min-h-[130px]`;

    const prettyValue = (value) => {
        if (Array.isArray(value)) return value.filter(Boolean).join(', ') || 'Not added';
        if (value === null || value === undefined || value === '') return 'Not added';
        return String(value);
    };

    const fileName = (path) => {
        if (!path) return 'Not uploaded';
        const parts = String(path).split('/');
        return parts[parts.length - 1];
    };

    const storedFiles = {
        photo: user.photo_path,
        cv: user.cv_path,
        research_statement_document: user.research_statement_document_path,
        teaching_statement_document: user.teaching_statement_document_path,
    };

    const renderControl = (field) => {
        if (field.type === 'textarea') {
            return (
                <textarea
                    id={field.name}
                    className={textAreaClass}
                    value={data[field.name]}
                    onChange={(e) => setData(field.name, e.target.value)}
                />
            );
        }

        if (field.type === 'select') {
            return (
                <select
                    id={field.name}
                    className={inputClass}
                    value={data[field.name]}
                    onChange={(e) => setData(field.name, e.target.value)}
                >
                    <option value="">Select</option>
                    {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            );
        }

        if (field.type === 'file') {
            return (
                <div className="mt-2 space-y-3">
                    {storedFiles[field.name] && (
                        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                            Current file: {fileName(storedFiles[field.name])}
                        </div>
                    )}
                    <input
                        type="file"
                        accept={field.accept}
                        onChange={handleFileChange(field.name)}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-blue-500"
                    />
                </div>
            );
        }

        return (
            <TextInput
                id={field.name}
                type={field.type || 'text'}
                className={inputClass}
                value={data[field.name]}
                onChange={(e) => setData(field.name, e.target.value)}
            />
        );
    };

    const FieldCard = ({ field }) => {
        const isEditing = editingField === field.name;
        const value = field.type === 'file' ? fileName(storedFiles[field.name]) : prettyValue(data[field.name]);

        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-slate-900">{field.label}</p>
                        {field.helper && <p className="mt-1 text-xs leading-5 text-slate-500">{field.helper}</p>}
                    </div>

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setEditingField(field.name)}
                            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 transition hover:bg-blue-100"
                        >
                            Edit
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <PrimaryButton
                                type="submit"
                                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-blue-500"
                                disabled={processing}
                            >
                                Save
                            </PrimaryButton>
                            <button
                                type="button"
                                onClick={() => cancelEdit(field.name)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {field.type === 'file' && storedFiles[field.name] ? (
                            <div className="flex flex-col gap-2">
                                <span>{value}</span>
                                <a
                                    href={`/storage/${storedFiles[field.name]}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-fit items-center text-sm font-semibold text-blue-700 hover:underline"
                                >
                                    View file
                                </a>
                            </div>
                        ) : (
                            value
                        )}
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {renderControl(field)}
                        <InputError className="mt-2" message={errors[field.name]} />
                    </div>
                )}
            </div>
        );
    };

    const sections = [
        {
            title: 'Basic information',
            description: 'Identity, contact, and location.',
            fields: [
                { name: 'photo', label: 'Photo', type: 'file', accept: 'image/*', helper: 'Professional photo for the profile header.' },
                { name: 'name', label: 'Full name', helper: 'Name as it should appear on the portal.' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Phone' },
                { name: 'designation', label: 'Designation' },
                { name: 'affiliation', label: 'Affiliation' },
                { name: 'location', label: 'Location' },
                { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
                { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
                { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
                { name: 'caste', label: 'Caste' },
                { name: 'address_line_1', label: 'Address line 1' },
                { name: 'address_line_2', label: 'Address line 2' },
                { name: 'city', label: 'City' },
                { name: 'state', label: 'State' },
                { name: 'postal_code', label: 'Postal code' },
                { name: 'country', label: 'Country' },
            ],
        },
        {
            title: 'Education and research',
            description: 'Degrees, thesis, and research focus.',
            fields: [
                { name: 'highest_qualification', label: 'Highest qualification' },
                { name: 'education_institution', label: 'Institution' },
                { name: 'education_year', label: 'Year' },
                { name: 'education_details', label: 'Education details', type: 'textarea' },
                { name: 'thesis_details', label: 'Thesis details', type: 'textarea' },
                { name: 'supervisors', label: 'Supervisors', type: 'textarea' },
                { name: 'research_areas', label: 'Research areas', type: 'textarea' },
                { name: 'research_statement', label: 'Research statement', type: 'textarea' },
            ],
        },
        {
            title: 'Academic profile',
            description: 'Publications, teaching, projects, and service.',
            fields: [
                { name: 'publications', label: 'Publications', type: 'textarea' },
                { name: 'achievements', label: 'Achievements', type: 'textarea' },
                { name: 'teaching_experience', label: 'Teaching experience', type: 'textarea' },
                { name: 'teaching_philosophy', label: 'Teaching philosophy', type: 'textarea' },
                { name: 'projects_research_work', label: 'Projects and research work', type: 'textarea' },
                { name: 'professional_experience', label: 'Professional experience', type: 'textarea' },
                { name: 'skills', label: 'Skills', type: 'textarea' },
                { name: 'curriculum_contributions', label: 'Curriculum contributions', type: 'textarea' },
                { name: 'certifications', label: 'Certifications', type: 'textarea' },
                { name: 'academic_service', label: 'Academic service', type: 'textarea' },
            ],
        },
        {
            title: 'Profiles, statement, and documents',
            description: 'External links, SOP, and uploads.',
            fields: [
                { name: 'google_scholar_url', label: 'Google Scholar URL', type: 'url' },
                { name: 'orcid_url', label: 'ORCID URL', type: 'url' },
                { name: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
                { name: 'github_url', label: 'GitHub URL', type: 'url' },
                { name: 'personal_website_url', label: 'Personal website URL', type: 'url' },
                { name: 'statement', label: 'Short SOP / cover note', type: 'textarea' },
                { name: 'cv', label: 'CV / Resume', type: 'file', accept: '.pdf,.doc,.docx', helper: 'Upload the latest CV.' },
                { name: 'research_statement_document', label: 'Research statement', type: 'file', accept: '.pdf,.doc,.docx' },
                { name: 'teaching_statement_document', label: 'Teaching statement', type: 'file', accept: '.pdf,.doc,.docx' },
            ],
        },
    ];

    return (
        <section className={className}>
            <header className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Profile data</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Editable faculty profile</h2>
                <p className="max-w-3xl text-sm leading-6 text-slate-500">
                    Review your stored profile and click Edit beside any field to update it.
                </p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-8">
                {sections.map((section) => (
                    <div key={section.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">{section.title}</h3>
                                <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {section.fields.map((field) => (
                                <FieldCard key={field.name} field={field} />
                            ))}
                        </div>
                    </div>
                ))}

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">Email verification pending.</p>
                        <p className="mt-1 leading-6 text-amber-800">
                            Verify your email to keep your applicant profile active.
                        </p>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="mt-3 inline-flex items-center rounded-full bg-amber-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        >
                            Resend verification email
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                Verification link sent.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-200 transition hover:bg-blue-500 focus:ring-blue-500" disabled={processing}>
                        Save profile
                    </PrimaryButton>

                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm font-semibold text-emerald-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
