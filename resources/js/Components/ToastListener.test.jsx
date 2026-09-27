import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const { usePageMock, toastMock } = vi.hoisted(() => ({
    usePageMock: vi.fn(),
    toastMock: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@inertiajs/react", () => ({
    usePage: () => usePageMock(),
}));

vi.mock("sonner", () => ({ toast: toastMock }));

import ToastListener from "./ToastListener";

describe("ToastListener", () => {
    beforeEach(() => {
        toastMock.success.mockClear();
        toastMock.error.mockClear();
    });

    it("fires one summary toast, not one per field, when several fields fail", () => {
        usePageMock.mockReturnValue({
            props: {
                flash: {},
                errors: {
                    first_name: "First name is required.",
                    last_name: "Last name is required.",
                },
            },
        });

        render(<ToastListener />);

        expect(toastMock.error).toHaveBeenCalledTimes(1);
        expect(toastMock.error).toHaveBeenCalledWith(
            "Please fix 2 highlighted fields and try again.",
            expect.anything(),
        );
    });

    it("still fires a single toast for exactly one failing field", () => {
        usePageMock.mockReturnValue({
            props: { flash: {}, errors: { email: "Invalid email." } },
        });

        render(<ToastListener />);

        expect(toastMock.error).toHaveBeenCalledTimes(1);
        expect(toastMock.error).toHaveBeenCalledWith(
            "Please fix the highlighted field and try again.",
            expect.anything(),
        );
    });

    it("shows the flash success/error toasts alongside, without duplicating them", () => {
        usePageMock.mockReturnValue({
            props: { flash: { success: "Saved!" }, errors: {} },
        });

        render(<ToastListener />);

        expect(toastMock.success).toHaveBeenCalledTimes(1);
        expect(toastMock.success).toHaveBeenCalledWith("Saved!", expect.anything());
        expect(toastMock.error).not.toHaveBeenCalled();
    });
});
