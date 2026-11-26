# Dialog — Non-modal

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Set `[modal]="false"` to keep document scrolling and outside pointer interactions available. There is
no backdrop in this mode.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-non-modal',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the dialog is open.
            </p>

            <div [modal]="false" rdxDialogRoot>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open non-modal dialog</button>

                <ng-template rdxDialogPortal>
                    <div
                        class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Non-modal dialog</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                            There is no backdrop, so you can keep interacting with the rest of the page.
                        </p>

                        <button
                            class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                            aria-label="Close"
                            rdxDialogClose
                        >
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>

            <button
                class="demo-button demo-button-secondary h-8 px-3 text-xs"
                (click)="outsideClicks.update((count) => count + 1)"
            >
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDialogNonModalComponent {
    protected readonly outsideClicks = signal(0);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
