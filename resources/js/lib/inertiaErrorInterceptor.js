import { router } from "@inertiajs/react";
import { toast } from "sonner";

// See docs/errors.md. A 500 arrives as a valid Inertia response, so this only
// covers the failures that happen before one can be produced.
export function registerInertiaErrorInterceptor() {
    router.on("invalid", (event) => {
        const response = event.detail.response;
        if (!response) return;

        // Expired CSRF token. A reload re-issues it and replays nothing,
        // the only safe retry for a request that may not be idempotent.
        if (response.status === 419) {
            event.preventDefault();
            toast.error("Your session expired. Reloading…");
            window.location.reload();
            return;
        }

        if (response.status === 429) {
            event.preventDefault();
            const retryAfter = response.headers?.["retry-after"];
            toast.error(
                retryAfter
                    ? `Too many attempts. Please try again in ${retryAfter}s.`
                    : "Too many attempts. Please try again later.",
            );
        }
    });
}
