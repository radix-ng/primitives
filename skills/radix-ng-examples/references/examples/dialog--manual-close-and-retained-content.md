# Dialog — Manual close and retained content

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Call `eventDetails.preventUnmountOnClose()` in `onOpenChange` to hold the closing view while an
external animation runs. Call `root.unmount()` from the exported Root when that animation ends.
`onOpenChangeComplete(false)` fires once. Bind `[keepMounted]` on Portal to keep the child views
and their state. The Popup, Backdrop and Viewport are hidden once closing completes.

```typescript
import { Component, signal } from '@angular/core';
import { dialogImports, RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-manual-close',
    imports: [dialogImports],
    template: `
        <div
            class="flex flex-col items-start gap-3"
            #root="rdxDialogRoot"
            (onOpenChange)="prepareClose($event)"
            (onOpenChangeComplete)="!$event && closing.set(false)"
            rdxDialogRoot
        >
            <label class="text-foreground flex items-center gap-2 text-sm">
                <input #retain [checked]="keepMounted()" (change)="keepMounted.set(retain.checked)" type="checkbox" />
                Keep draft mounted
            </label>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open editor</button>
            <ng-template [keepMounted]="keepMounted()" rdxDialogPortal>
                <div [class]="d.backdrop" rdxDialogBackdrop></div>
                <div [class]="d.popup" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Edit draft</h2>
                    <label class="text-foreground flex flex-col gap-1 text-sm">
                        Draft
                        <input class="border-border rounded-md border px-3 py-2" />
                    </label>
                    <div [class]="d.footer">
                        @if (closing()) {
                            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="root.unmount()">
                                Finish close
                            </button>
                        } @else {
                            <button [class]="cn(b.base, b.outline, b.size.md)" rdxDialogClose>Close editor</button>
                        }
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogManualCloseComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly keepMounted = signal(false);
    protected readonly closing = signal(false);

    protected prepareClose(change: RdxDialogOpenChange): void {
        this.closing.set(!change.open);
        if (!change.open) change.eventDetails.preventUnmountOnClose();
    }
}
```
