import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { Toaster } from "sonner";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { registerInertiaErrorInterceptor } from "@/lib/inertiaErrorInterceptor";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

registerInertiaErrorInterceptor();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <ErrorBoundary>
                    <App {...props} />
                </ErrorBoundary>
                <Toaster richColors position="top-right" expand={true} />{" "}
            </>,
        );
    },
    progress: { color: "#4B5563" },
});
