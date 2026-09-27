import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

// Per docs/errors.md: one summary toast per response — inline field errors
// (via FormField/combinedErrors) already point the user at the specific
// input, so a toast per field is redundant noise on top of that.
export default function ToastListener() {
    const { flash = {}, errors = {} } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, { duration: 4000 });
        }
        if (flash?.error) {
            toast.error(flash.error, { duration: 5000 });
        }

        const errorCount = Object.keys(errors || {}).length;
        if (errorCount > 0) {
            toast.error(
                errorCount === 1
                    ? "Please fix the highlighted field and try again."
                    : `Please fix ${errorCount} highlighted fields and try again.`,
                { duration: 5000 },
            );
        }
    }, [flash, errors]);

    return null;
}
