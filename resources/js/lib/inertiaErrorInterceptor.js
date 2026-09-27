import axios from "axios";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

// Standard Inertia error interceptor — see docs/errors.md.
// A 500 is handled server-side (bootstrap/app.php renders Pages/Error.jsx
// directly), so it always arrives as a valid Inertia response and never
// reaches the `invalid` event this listens on. This only has to cover the
// two failure modes that happen *before* a normal Inertia response can be
// produced: an expired CSRF token, and a throttle limit.
export function registerInertiaErrorInterceptor() {
    router.on("invalid", (event) => {
        const response = event.detail.response;
        if (!response) return;

        if (response.status === 419) {
            event.preventDefault();
            axios(response.config).catch(() => {
                window.location.reload();
            });
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
