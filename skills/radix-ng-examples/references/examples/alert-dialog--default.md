# Alert Dialog — Default

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A destructive confirmation with Cancel and an action button. Clicking the backdrop keeps it open.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger
} from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-default',
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogTrigger,
        RdxAlertDialogPortal,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription,
        RdxAlertDialogClose
    ],
    template: `
        <div rdxAlertDialogRoot>
            <button class="demo-button demo-button-outline h-8 px-3 leading-none" rdxAlertDialogTrigger>
                Delete account
            </button>

            <ng-template rdxAlertDialogPortal>
                <div
                    class="fixed inset-0 z-50 bg-black opacity-20 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute supports-[-webkit-touch-callout:none]:min-h-dvh motion-safe:transition-opacity motion-safe:duration-150 dark:opacity-50"
                    rdxAlertDialogBackdrop
                ></div>

                <div
                    class="demo-popup demo-popup-motion fixed top-1/2 left-1/2 z-50 -mt-8 flex max-h-[calc(100dvh-3rem)] w-96 max-w-[calc(100%-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-auto p-4 focus:outline-none data-nested-dialog-open:scale-[0.96]"
                    rdxAlertDialogPopup
                >
                    <div class="flex flex-col gap-1">
                        <h2 class="text-base font-bold" rdxAlertDialogTitle>Are you absolutely sure?</h2>
                        <p class="text-muted-foreground text-sm" rdxAlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data
                            from our servers.
                        </p>
                    </div>

                    <div class="flex flex-wrap justify-end gap-3">
                        <button class="demo-button demo-button-outline h-8 px-3" rdxAlertDialogClose>Cancel</button>
                        <button class="demo-button demo-button-destructive h-8 px-3" rdxAlertDialogClose>
                            Yes, delete account
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogDefaultComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
