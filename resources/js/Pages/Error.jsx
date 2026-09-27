import { Head } from "@inertiajs/react";

const STATUS_MESSAGES = {
    404: "The page you're looking for could not be found.",
    403: "You are not authorised to view this page.",
    419: "Your session expired. Please refresh and try again.",
    429: "Too many requests. Please try again shortly.",
    500: "Something went wrong on our end. Please try again.",
    503: "The application is temporarily unavailable. Please try again shortly.",
};

export default function Error({ status, requestId }) {
    return (
        <>
            <Head title={`Error ${status}`} />
            <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
                <h1 className="text-lg font-semibold text-gray-900">
                    {status} — {STATUS_MESSAGES[status] ?? "An unexpected error occurred."}
                </h1>
                <p className="text-sm text-gray-500">
                    If the problem persists, contact support with the reference below.
                </p>
                {requestId && (
                    <p className="text-xs text-gray-400">Reference: {requestId}</p>
                )}
            </div>
        </>
    );
}
