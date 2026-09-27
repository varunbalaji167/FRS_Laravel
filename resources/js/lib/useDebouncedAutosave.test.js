import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useDebouncedAutosave from "./useDebouncedAutosave";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("useDebouncedAutosave", () => {
    it("does not save on initial mount", () => {
        const onSave = vi.fn();
        renderHook(() => useDebouncedAutosave("a", onSave, { delay: 2000 }));

        vi.advanceTimersByTime(5000);

        expect(onSave).not.toHaveBeenCalled();
    });

    it("saves the latest value 2s after the last change, resetting on each change", () => {
        const onSave = vi.fn();
        const { rerender } = renderHook(({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }), {
            initialProps: { value: "a" },
        });

        rerender({ value: "b" });
        vi.advanceTimersByTime(1000);
        rerender({ value: "c" });
        vi.advanceTimersByTime(1000);

        // Still within 2s of the last ("c") change — no save yet.
        expect(onSave).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith("c");
    });

    it("flush() fires an already-pending save immediately and cancels the timer", () => {
        const onSave = vi.fn();
        const { result, rerender } = renderHook(({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }), {
            initialProps: { value: "a" },
        });

        rerender({ value: "b" });
        result.current.flush();

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith("b");

        vi.advanceTimersByTime(5000);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("flushes a pending save on unmount instead of dropping it", () => {
        const onSave = vi.fn();
        const { unmount, rerender } = renderHook(({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }), {
            initialProps: { value: "a" },
        });

        rerender({ value: "b" });
        unmount();

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith("b");
    });

    // A handler that writes the value back into state hands the hook a fresh
    // object each time; a reference check turned that into an endless loop.
    it("does not re-save when the value is replaced by an equal-content object", () => {
        const onSave = vi.fn();
        const { rerender } = renderHook(({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }), {
            initialProps: { value: { a: 1 } },
        });

        rerender({ value: { a: 2 } });
        vi.advanceTimersByTime(2000);
        expect(onSave).toHaveBeenCalledTimes(1);

        // Same content, new identity — as `setData(key, {...})` produces.
        rerender({ value: { a: 2 } });
        vi.advanceTimersByTime(10000);

        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("markSaved() suppresses the debounce for content persisted out-of-band", () => {
        const onSave = vi.fn();
        const { result, rerender } = renderHook(({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }), {
            initialProps: { value: { a: 1 } },
        });

        const savedOutOfBand = { a: 2 };
        result.current.markSaved(savedOutOfBand);
        rerender({ value: savedOutOfBand });
        vi.advanceTimersByTime(10000);

        expect(onSave).not.toHaveBeenCalled();
    });

    it("does nothing when disabled", () => {
        const onSave = vi.fn();
        const { rerender } = renderHook(
            ({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000, enabled: false }),
            { initialProps: { value: "a" } },
        );

        rerender({ value: "b" });
        vi.advanceTimersByTime(5000);

        expect(onSave).not.toHaveBeenCalled();
    });
});
