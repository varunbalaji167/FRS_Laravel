import { useCallback, useEffect, useRef } from "react";

function serialize(value) {
    try {
        return JSON.stringify(value);
    } catch {
        return null;
    }
}

// Debounced autosave. Changes are compared by serialised content, not
// identity, so a handler that writes the value back into state can't re-arm
// the timer forever and turn autosave into an endless request loop.
export default function useDebouncedAutosave(value, onSave, { delay = 2000, enabled = true } = {}) {
    const onSaveRef = useRef(onSave);
    onSaveRef.current = onSave;

    const valueRef = useRef(value);
    valueRef.current = value;

    const timeoutRef = useRef(null);
    const pendingRef = useRef(false);
    const lastSerializedRef = useRef(serialize(value));

    const flush = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (!pendingRef.current) return;
        pendingRef.current = false;
        lastSerializedRef.current = serialize(valueRef.current);
        onSaveRef.current(valueRef.current);
    }, []);

    // For callers that persist out-of-band (an explicit "Save" button), so the
    // debounce doesn't fire a second, redundant request for the same content.
    const markSaved = useCallback((savedValue) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        pendingRef.current = false;
        lastSerializedRef.current = serialize(savedValue === undefined ? valueRef.current : savedValue);
    }, []);

    const serialized = serialize(value);

    useEffect(() => {
        if (!enabled) return;
        if (serialized === lastSerializedRef.current) return;

        pendingRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(flush, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serialized, delay, enabled]);

    useEffect(() => {
        return () => flush();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { flush, markSaved };
}
