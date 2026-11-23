# Dialog — Deferred requests

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind `[open]` and listen to `(openChange)` when the application decides when to accept requests.
Focus and modal behavior follow the bound value. `defaultOpen` applies only to uncontrolled state
and is read once when the Root initializes.

```typescript
import { Component, signal } from '@angular/core';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    selector: 'rdx-dialog-deferred-open',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogClose
    ],
    template: `
        <div class="flex items-center gap-3">
            <button
                class="demo-button demo-button-outline h-8 px-3 text-xs"
                [disabled]="requestedOpen() !== true"
                (click)="applyRequest()"
            >
                Apply open request
            </button>

            <div [open]="open()" (openChange)="requestedOpen.set($event)" rdxDialogRoot defaultOpen>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>
                <ng-template rdxDialogPortal>
                    <div class="bg-foreground/50 fixed inset-0 z-50" rdxDialogBackdrop></div>
                    <div
                        class="demo-popup fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Review the request</h2>
                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                Request close
                            </button>
                            <button
                                class="demo-button demo-button-outline h-8 px-3 text-xs"
                                [disabled]="requestedOpen() !== false"
                                (click)="applyRequest()"
                            >
                                Apply close request
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDialogDeferredOpenComponent {
    protected readonly open = signal(false);
    protected readonly requestedOpen = signal<boolean | null>(null);

    protected applyRequest(): void {
        const requested = this.requestedOpen();
        if (requested !== null) {
            this.open.set(requested);
            this.requestedOpen.set(null);
        }
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
