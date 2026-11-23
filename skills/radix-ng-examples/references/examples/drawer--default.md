# Drawer — Default

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A bottom sheet you can swipe down to dismiss, with an accessible title, description, and close buttons.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerRoot,
    RdxDrawerTitle,
    RdxDrawerTrigger,
    RdxDrawerViewport
} from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-default',
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerViewport,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose,
        LucideX
    ],
    template: `
        <div rdxDrawerRoot swipeDirection="right">
            <button class="demo-button demo-button-outline h-8 px-3" rdxDrawerTrigger>Open drawer</button>

            <ng-template rdxDrawerPortal>
                <div
                    class="motion-safe:ease-demo-drawer fixed inset-0 z-50 bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress,0)))] [--backdrop-opacity:0.2] data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute supports-[-webkit-touch-callout:none]:min-h-dvh motion-safe:transition-opacity motion-safe:duration-450 dark:[--backdrop-opacity:0.7]"
                    rdxDrawerBackdrop
                ></div>

                <div class="pointer-events-none fixed inset-0 z-50 flex justify-end overflow-clip" rdxDrawerViewport>
                    <div
                        class="border-foreground bg-background text-foreground motion-safe:ease-demo-drawer pointer-events-auto relative h-full w-80 max-w-[calc(100%-3rem)] [transform:translateX(var(--drawer-swipe-movement-x,0px))] border-l after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-x,0px))))] after:bg-inherit focus:outline-none data-ending-style:[transform:translateX(100%)] data-starting-style:[transform:translateX(100%)] data-swiping:transition-none data-swiping:select-none motion-safe:transition-transform motion-safe:duration-450"
                        rdxDrawerPopup
                    >
                        <div class="h-full overflow-y-auto overscroll-contain p-6" rdxDrawerContent>
                            <h2 class="mb-1 pe-8 text-base font-bold" rdxDrawerTitle>Swipe to dismiss</h2>
                            <p class="text-muted-foreground mb-6 text-sm" rdxDrawerDescription>
                                Swipe this panel to the right or press Escape to dismiss it.
                            </p>
                            <div class="flex flex-wrap justify-end gap-3">
                                <button class="demo-button demo-button-outline h-8 px-3" rdxDrawerClose>Cancel</button>
                                <button class="demo-button demo-button-outline h-8 px-3" rdxDrawerClose>Confirm</button>
                            </div>
                        </div>

                        <button
                            class="demo-button demo-button-ghost absolute top-3 right-3 size-8"
                            aria-label="Close"
                            rdxDrawerClose
                        >
                            <svg aria-hidden="true" lucideX size="16"></svg>
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerDefaultComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
