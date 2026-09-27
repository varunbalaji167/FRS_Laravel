import { useEffect } from "react";

// Warns on tab-close while `isDirty`. Browsers ignore the returnValue text,
// but setting it is what triggers their own prompt.
export default function useBeforeUnloadGuard(isDirty) {
    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);
}
