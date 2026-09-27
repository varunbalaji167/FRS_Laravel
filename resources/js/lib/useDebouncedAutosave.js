import { useCallback, useEffect, useRef } from "react";

// Debounced autosave: schedules `onSave(value)` `delay` ms after the last
// change to `value`. Each change resets the timer (true debounce, not
// throttle). `flush()` fires an already-pending save immediately and cancels
// the timer. Any save still pending when the component unmounts is flushed
// once so a quick navigate-away doesn't silently drop the last edit.
export default function useDebouncedAutosave(value, onSave, { delay = 2000, enabled = true } = {}) {
    const onSaveRef = useRef(onSave);
    onSaveRef.current = onSave;

    const valueRef = useRef(value);
    valueRef.current = value;

    const timeoutRef = useRef(null);
    const pendingRef = useRef(false);
    const isFirstRun = useRef(true);

    const flush = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (!pendingRef.current) return;
        pendingRef.current = false;
        onSaveRef.current(valueRef.current);
    }, []);

    useEffect(() => {
        if (!enabled) return;
        // Skip the run that fires on mount — there's nothing to save yet.
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        pendingRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(flush, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, delay, enabled]);

    useEffect(() => {
        return () => flush();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { flush };
}
