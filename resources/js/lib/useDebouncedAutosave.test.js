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
        const { rerender } = renderHook(
            ({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }),
            { initialProps: { value: "a" } },
        );

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
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }),
            { initialProps: { value: "a" } },
        );

        rerender({ value: "b" });
        result.current.flush();

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith("b");

        vi.advanceTimersByTime(5000);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("flushes a pending save on unmount instead of dropping it", () => {
        const onSave = vi.fn();
        const { unmount, rerender } = renderHook(
            ({ value }) => useDebouncedAutosave(value, onSave, { delay: 2000 }),
            { initialProps: { value: "a" } },
        );

        rerender({ value: "b" });
        unmount();

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith("b");
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
