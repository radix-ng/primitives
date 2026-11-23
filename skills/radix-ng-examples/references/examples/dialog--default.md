# Dialog — Default

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A modal dialog with an accessible title and description, form fields, and close buttons.

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
    selector: 'rdx-dialog-default',
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
            <button class="demo-button demo-button-outline h-8 px-3 leading-none" rdxDialogTrigger>Edit profile</button>

            <ng-template rdxDialogPortal>
                <div
                    class="fixed inset-0 z-50 bg-black opacity-20 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute supports-[-webkit-touch-callout:none]:min-h-dvh motion-safe:transition-opacity motion-safe:duration-150 dark:opacity-50"
                    rdxDialogBackdrop
                ></div>

                <div
                    class="demo-popup demo-popup-motion fixed top-1/2 left-1/2 z-50 -mt-8 flex max-h-[calc(100dvh-3rem)] w-96 max-w-[calc(100%-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-auto p-4 focus:outline-none data-nested-dialog-open:scale-[0.96]"
                    rdxDialogPopup
                >
                    <div class="flex flex-col gap-1">
                        <h2 class="text-base font-bold" rdxDialogTitle>Edit profile</h2>
                        <p class="text-muted-foreground text-sm" rdxDialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </p>
                    </div>

                    <label class="grid gap-1 text-sm font-bold">
                        Name
                        <input class="demo-input h-8 w-full px-2 font-normal" value="Pedro Duarte" />
                    </label>
                    <label class="grid gap-1 text-sm font-bold">
                        Username
                        <input class="demo-input h-8 w-full px-2 font-normal" value="@peduarte" />
                    </label>

                    <div class="flex flex-wrap justify-end gap-3">
                        <button class="demo-button demo-button-outline h-8 px-3" rdxDialogClose>Cancel</button>
                        <button class="demo-button demo-button-outline h-8 px-3" rdxDialogClose>Save changes</button>
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
export class RdxDialogDefaultComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
