import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Bomb() {
    throw new Error("boom");
}

describe("ErrorBoundary", () => {
    it("renders its children when nothing throws", () => {
        render(
            <ErrorBoundary>
                <p>All good</p>
            </ErrorBoundary>,
        );

        expect(screen.getByText("All good")).toBeInTheDocument();
    });

    it("renders the fallback UI when a child throws", () => {
        // React logs the error to the console even when caught by a boundary;
        // silence it so the test output stays readable.
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <Bomb />
            </ErrorBoundary>,
        );

        expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    });

    it("shows the request id reference when one is provided", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <ErrorBoundary requestId="01TESTREQUESTID">
                <Bomb />
            </ErrorBoundary>,
        );

        expect(screen.getByText(/01TESTREQUESTID/)).toBeInTheDocument();
    });
});
