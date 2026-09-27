import { useEffect } from "react";

// Warns on tab-close/refresh while `isDirty` is true (unsaved wizard edits).
// Browsers ignore the returnValue text and show their own generic prompt, but
// setting it is what actually triggers that prompt in the first place.
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
