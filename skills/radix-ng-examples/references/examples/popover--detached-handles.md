# Popover — Detached handles

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Create a shared handle when triggers live outside the root or multiple triggers should control the
same popup. The handle also supports imperative `open(id)`, `toggle(id)`, and `close()` calls.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    createRdxPopoverHandle,
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-detached',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex w-[min(640px,80vw)] flex-col items-center gap-8">
            <div class="flex w-full justify-between gap-4">
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    id="account"
                    [handle]="popover"
                    rdxPopoverTrigger
                >
                    Account trigger
                </button>

                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    id="billing"
                    [handle]="popover"
                    rdxPopoverTrigger
                >
                    Billing trigger
                </button>
            </div>

            <div class="flex flex-wrap justify-center gap-2">
                <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="popover.open('account')">
                    Open account
                </button>
                <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="popover.open('billing')">
                    Open billing
                </button>
                <button class="demo-button demo-button-ghost h-8 px-3 text-xs" (click)="popover.close()">Close</button>
            </div>

            <ng-container [handle]="popover" rdxPopoverRoot>
                <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                    <div class="demo-popup relative w-80 p-4" rdxPopoverPopup>
                        <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                        <h2 class="demo-popover-title" rdxPopoverTitle>Detached handles</h2>
                        <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                            Both triggers live outside the root. Open another trigger to move this popup without closing
                            it first.
                        </p>
                        <button
                            class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                            aria-label="Close"
                            rdxPopoverClose
                        >
                            <svg aria-hidden="true" lucideX size="14" />
                        </button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPopoverDetachedComponent {
    protected readonly popover = createRdxPopoverHandle();
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
