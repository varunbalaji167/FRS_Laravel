import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { Copy } from 'lucide-react'; 

export default function BasicProfileForm({ className = '' }) {
    const user = usePage().props.auth.user;
    const profile = user.applicant_profile || {}; // Reads the new 1-to-1 table data

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        // Core Identity (From Users table)
        name: user.name || '',
        email: user.email || '',
        
        // Profile Data (From ApplicantProfiles table)
        father_name: profile.father_name || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        marital_status: profile.marital_status || '',
        category: profile.category || '',
        nationality: profile.nationality || 'Indian',
        id_proof: profile.id_proof || '',
        
        // Contact Info
        phone: profile.phone || '',
        alt_phone: profile.alt_phone || '',
        alt_email: profile.alt_email || '',

        // Correspondence Address
        corr_address: profile.corr_address || '',
        corr_city: profile.corr_city || '',
        corr_state: profile.corr_state || '',
        corr_pincode: profile.corr_pincode || '',
        corr_country: profile.corr_country || 'India',

        // Permanent Address
        perm_address: profile.perm_address || '',
        perm_city: profile.perm_city || '',
        perm_state: profile.perm_state || '',
        perm_pincode: profile.perm_pincode || '',
        perm_country: profile.perm_country || 'India',

        // Professional Links
        google_scholar_url: profile.google_scholar_url || '',
        orcid_url: profile.orcid_url || '',
        linkedin_url: profile.linkedin_url || '',
    });

    const copyAddress = () => {
        setData(current => ({
            ...current,
            perm_address: current.corr_address,
            perm_city: current.corr_city,
            perm_state: current.corr_state,
            perm_pincode: current.corr_pincode,
            perm_country: current.corr_country,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), { preserveScroll: true });
    };

    const inputClass = "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm";

    return (
        <section className={className}>
            <header className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Master Profile</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Keep this core information up to date. It will be used to automatically pre-fill your future IIT Indore job applications.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                
                {/* 1. Personal Details */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">1. Personal Details</h3>
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput id="name" className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </div>
                        <div>
                            <InputLabel htmlFor="father_name" value="Father's Name" />
                            <TextInput id="father_name" className={inputClass} value={data.father_name} onChange={(e) => setData('father_name', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                            <TextInput id="date_of_birth" type="date" className={inputClass} value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel htmlFor="gender" value="Gender" />
                            <select id="gender" className={inputClass} value={data.gender} onChange={(e) => setData('gender', e.target.value)}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="marital_status" value="Marital Status" />
                            <select id="marital_status" className={inputClass} value={data.marital_status} onChange={(e) => setData('marital_status', e.target.value)}>
                                <option value="">Select</option>
                                <option value="Married">Married</option>
                                <option value="Unmarried">Unmarried</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="category" value="Category" />
                            <select id="category" className={inputClass} value={data.category} onChange={(e) => setData('category', e.target.value)}>
                                <option value="">Select Category</option>
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="EWS">EWS</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="nationality" value="Nationality" />
                            <TextInput id="nationality" className={inputClass} value={data.nationality} onChange={(e) => setData('nationality', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="id_proof" value="ID Proof (Aadhar/PAN/Passport)" />
                            <TextInput id="id_proof" className={inputClass} value={data.id_proof} onChange={(e) => setData('id_proof', e.target.value)} placeholder="e.g. AADHAR: 1234..." />
                        </div>
                    </div>
                </div>

                {/* 2. Contact Information */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">2. Contact Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="email" value="Primary Email" />
                            <TextInput id="email" type="email" className={`${inputClass} bg-slate-50 text-slate-500`} value={data.email} disabled />
                        </div>
                        <div>
                            <InputLabel htmlFor="alt_email" value="Alternate Email" />
                            <TextInput id="alt_email" type="email" className={inputClass} value={data.alt_email} onChange={(e) => setData('alt_email', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel htmlFor="phone" value="Primary Mobile" />
                            <TextInput id="phone" className={inputClass} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel htmlFor="alt_phone" value="Alternate Mobile" />
                            <TextInput id="alt_phone" className={inputClass} value={data.alt_phone} onChange={(e) => setData('alt_phone', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* 3. Addresses */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">3. Addresses</h3>
                    <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        {/* Correspondence */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="font-semibold text-slate-800">Correspondence Address</h4>
                            <div>
                                <InputLabel htmlFor="corr_address" value="Street Address" />
                                <TextInput id="corr_address" className={inputClass} value={data.corr_address} onChange={(e) => setData('corr_address', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="corr_city" value="City" />
                                    <TextInput id="corr_city" className={inputClass} value={data.corr_city} onChange={(e) => setData('corr_city', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="corr_state" value="State" />
                                    <TextInput id="corr_state" className={inputClass} value={data.corr_state} onChange={(e) => setData('corr_state', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="corr_pincode" value="Pincode" />
                                    <TextInput id="corr_pincode" className={inputClass} value={data.corr_pincode} onChange={(e) => setData('corr_pincode', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="corr_country" value="Country" />
                                    <TextInput id="corr_country" className={inputClass} value={data.corr_country} onChange={(e) => setData('corr_country', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Permanent */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-slate-800">Permanent Address</h4>
                                <button type="button" onClick={copyAddress} className="flex items-center text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-100/50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition">
                                    <Copy className="h-3 w-3 mr-1.5" /> Same as Correspondence
                                </button>
                            </div>
                            <div>
                                <InputLabel htmlFor="perm_address" value="Street Address" />
                                <TextInput id="perm_address" className={inputClass} value={data.perm_address} onChange={(e) => setData('perm_address', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="perm_city" value="City" />
                                    <TextInput id="perm_city" className={inputClass} value={data.perm_city} onChange={(e) => setData('perm_city', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="perm_state" value="State" />
                                    <TextInput id="perm_state" className={inputClass} value={data.perm_state} onChange={(e) => setData('perm_state', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="perm_pincode" value="Pincode" />
                                    <TextInput id="perm_pincode" className={inputClass} value={data.perm_pincode} onChange={(e) => setData('perm_pincode', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="perm_country" value="Country" />
                                    <TextInput id="perm_country" className={inputClass} value={data.perm_country} onChange={(e) => setData('perm_country', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Professional Links */}
                <div>
                    <h3 className="text-base font-semibold leading-7 text-slate-900 border-b pb-2">4. Professional Links</h3>
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="google_scholar_url" value="Google Scholar URL" />
                            <TextInput id="google_scholar_url" type="url" className={inputClass} value={data.google_scholar_url} onChange={(e) => setData('google_scholar_url', e.target.value)} placeholder="https://scholar.google.com/..." />
                        </div>
                        <div>
                            <InputLabel htmlFor="orcid_url" value="ORCID URL" />
                            <TextInput id="orcid_url" type="url" className={inputClass} value={data.orcid_url} onChange={(e) => setData('orcid_url', e.target.value)} placeholder="https://orcid.org/..." />
                        </div>
                        <div>
                            <InputLabel htmlFor="linkedin_url" value="LinkedIn URL" />
                            <TextInput id="linkedin_url" type="url" className={inputClass} value={data.linkedin_url} onChange={(e) => setData('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
                        </div>
                    </div>
                </div>

                {/* Save Action */}
                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                        Save Profile
                    </PrimaryButton>

                    <Transition show={recentlySuccessful} enter="transition ease-in-out duration-300" enterFrom="opacity-0" leave="transition ease-in-out duration-300" leaveTo="opacity-0">
                        <p className="text-sm font-medium text-emerald-600">Profile saved successfully.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}