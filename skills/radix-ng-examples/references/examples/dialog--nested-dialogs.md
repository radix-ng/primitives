# Dialog — Nested dialogs

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Dialogs can be nested. The parent popup gains `data-nested-dialog-open` and the child popup gains
`data-nested`, which the demo uses to scale the parent back.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxDialogBackdrop,
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
    selector: 'rdx-dialog-nested',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div rdxDialogRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>

                <div
                    class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Parent dialog</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                        Opening the nested dialog scales this popup back via
                        <code>[data-nested-dialog-open]</code>
                        .
                    </p>

                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDialogClose>Close</button>

                        <div rdxDialogRoot>
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogTrigger>
                                Open nested
                            </button>

                            <ng-template rdxDialogPortal>
                                <div
                                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                                    rdxDialogBackdrop
                                ></div>
                                <div
                                    class="demo-popup data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                                    rdxDialogPopup
                                >
                                    <h2 class="demo-dialog-title" rdxDialogTitle>Nested dialog</h2>
                                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                                        Escape or the backdrop closes this one first, then the parent.
                                    </p>
                                    <div class="mt-6 flex justify-end gap-2">
                                        <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                            Done
                                        </button>
                                    </div>
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
                    </div>

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
    `
})
export class RdxDialogNestedComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
