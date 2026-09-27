import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import useBeforeUnloadGuard from "./useBeforeUnloadGuard";

function dispatchBeforeUnload() {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event;
}

describe("useBeforeUnloadGuard", () => {
    it("does not prevent unload when there are no unsaved changes", () => {
        renderHook(() => useBeforeUnloadGuard(false));

        const event = dispatchBeforeUnload();

        expect(event.defaultPrevented).toBe(false);
    });

    it("prevents unload when dirty (triggers the browser's native prompt)", () => {
        renderHook(() => useBeforeUnloadGuard(true));

        const event = dispatchBeforeUnload();

        expect(event.defaultPrevented).toBe(true);
        // Setting returnValue is what actually triggers the prompt in real
        // browsers; jsdom's Event just reflects it back as !defaultPrevented.
        expect(event.returnValue).toBe(false);
    });

    it("stops guarding once isDirty flips back to false", () => {
        const { rerender } = renderHook(({ isDirty }) => useBeforeUnloadGuard(isDirty), {
            initialProps: { isDirty: true },
        });

        rerender({ isDirty: false });

        const event = dispatchBeforeUnload();

        expect(event.defaultPrevented).toBe(false);
    });

    it("removes its listener on unmount", () => {
        const removeSpy = vi.spyOn(window, "removeEventListener");
        const { unmount } = renderHook(() => useBeforeUnloadGuard(true));

        unmount();

        expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
        removeSpy.mockRestore();
    });
});
