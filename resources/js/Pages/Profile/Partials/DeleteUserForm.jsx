import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">
                    Account actions
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Delete account
                </h2>

                <p className="max-w-2xl text-sm leading-6 text-slate-500">
                    Permanently remove this recruitment account and its data.
                </p>
            </header>

            <DangerButton className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-200" onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-8">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Enter your password to confirm permanent deletion.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-rose-500 focus:bg-white focus:ring-rose-500 sm:w-3/4"
                            isFocused
                            placeholder="Password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <SecondaryButton className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest" onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-200" disabled={processing}>
                            Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
