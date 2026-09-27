import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

function Harness({ onConfirm }) {
    const [open, setOpen] = useState(true);
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title="Delete user?"
            description="This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={onConfirm}
        />
    );
}

describe("ConfirmDialog", () => {
    it("renders the title and description when open", () => {
        render(<Harness onConfirm={vi.fn()} />);

        expect(screen.getByText("Delete user?")).toBeInTheDocument();
        expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    });

    it("calls onConfirm when the confirm button is clicked", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        render(<Harness onConfirm={onConfirm} />);

        await user.click(screen.getByRole("button", { name: "Delete" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("closes without confirming when Cancel is clicked", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        render(<Harness onConfirm={onConfirm} />);

        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onConfirm).not.toHaveBeenCalled();
        expect(screen.queryByText("Delete user?")).not.toBeInTheDocument();
    });

    it("disables both buttons while processing", () => {
        render(
            <ConfirmDialog
                open={true}
                onOpenChange={vi.fn()}
                title="Delete user?"
                confirmLabel="Delete"
                processing
                onConfirm={vi.fn()}
            />,
        );

        expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Working…" })).toBeDisabled();
    });
});
