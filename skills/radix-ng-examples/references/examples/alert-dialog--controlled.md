# Alert Dialog — Controlled

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind `[(open)]` to open or close the alert dialog from component state.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxAlertDialogBackdrop,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger
} from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-controlled',
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogTrigger,
        RdxAlertDialogPortal,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Alert dialog is {{ open() ? 'open' : 'closed' }}</p>

            <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="open.set(true)">
                Open from outside
            </button>

            <div [(open)]="open" rdxAlertDialogRoot>
                <button class="demo-button demo-button-destructive h-9 px-4" rdxAlertDialogTrigger>
                    Discard changes
                </button>

                <ng-template rdxAlertDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxAlertDialogBackdrop
                    ></div>

                    <div
                        class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxAlertDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxAlertDialogTitle>Discard unsaved changes?</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                            The open state is owned by the component and bound with
                            <code>[(open)]</code>
                            .
                        </p>

                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="open.set(false)">
                                Keep editing
                            </button>
                            <button
                                class="demo-button demo-button-destructive h-8 px-3 text-xs"
                                (click)="open.set(false)"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxAlertDialogControlledComponent {
    protected readonly open = signal(false);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
