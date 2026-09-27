import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

// Replaces window.confirm() / toast-as-confirm for destructive actions —
// keyboard/focus-trapped, doesn't get lost in a toast queue.
export default function ConfirmDialog({
    open,
    onOpenChange,
    title = "Are you sure?",
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = true,
    processing = false,
    onConfirm,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={destructive ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? "Working…" : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
