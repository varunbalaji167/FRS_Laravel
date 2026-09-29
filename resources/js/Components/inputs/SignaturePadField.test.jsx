import { describe, expect, it, vi, beforeEach } from "vitest";
import { forwardRef, useImperativeHandle } from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Stand-in for react-signature-canvas: exposes the same ref API the field
// calls (isEmpty/toDataURL/clear) and a button to fire the onEnd callback,
// so we exercise commit() without a real <canvas> (jsdom has none).
const padState = { empty: true, throwOnTrim: false };

vi.mock("react-signature-canvas", () => ({
    default: forwardRef(function MockPad({ onEnd }, ref) {
        useImperativeHandle(ref, () => ({
            isEmpty: () => padState.empty,
            clear: () => {
                padState.empty = true;
            },
            // The real getTrimmedCanvas() throws IndexSizeError on a 0-dim
            // trim; toDataURL() reads the full canvas and never does.
            getTrimmedCanvas: () => {
                if (padState.throwOnTrim) throw new Error("IndexSizeError");
                return { toDataURL: () => "data:image/png;base64,QQ==" };
            },
            toDataURL: () => "data:image/png;base64,QQ==",
        }));
        return (
            <button type="button" data-testid="end-stroke" onClick={onEnd}>
                end
            </button>
        );
    }),
}));

import SignaturePadField from "./SignaturePadField";

describe("SignaturePadField", () => {
    beforeEach(() => {
        padState.empty = true;
        padState.throwOnTrim = false;
    });

    it("stores a File once a stroke is drawn, even when trim would throw", () => {
        // The exact condition that used to swallow the capture in onEnd.
        padState.throwOnTrim = true;
        padState.empty = false;
        const onChange = vi.fn();

        render(<SignaturePadField id="signature" label="Signature" onChange={onChange} />);
        fireEvent.click(screen.getByTestId("end-stroke"));

        expect(onChange).toHaveBeenCalledTimes(1);
        const file = onChange.mock.calls[0][0];
        expect(file).toBeInstanceOf(File);
        expect(file.type).toBe("image/png");
    });

    it("reports empty (null) when the pad has no strokes", () => {
        padState.empty = true;
        const onChange = vi.fn();

        render(<SignaturePadField id="signature" label="Signature" onChange={onChange} />);
        fireEvent.click(screen.getByTestId("end-stroke"));

        expect(onChange).toHaveBeenCalledWith(null);
    });
});
