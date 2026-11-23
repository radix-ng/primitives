# Drawer — Detached triggers

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Create a shared handle with `createRdxDrawerHandle()` when triggers live outside `rdxDrawerRoot`. The
handle also supports imperative `open(id)`, `toggle(id)`, and `close()`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    createRdxDrawerHandle,
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerRoot,
    RdxDrawerTitle,
    RdxDrawerTrigger
} from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-detached',
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose
    ],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button class="demo-button demo-button-outline h-9 px-4" id="cart" [handle]="handle" rdxDrawerTrigger>
                    Cart
                </button>
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    id="account"
                    [handle]="handle"
                    rdxDrawerTrigger
                >
                    Account
                </button>
            </div>

            <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="handle.open('account')">
                Open account imperatively
            </button>

            <div [handle]="handle" rdxDrawerRoot>
                <ng-template rdxDrawerPortal>
                    <div
                        class="bg-foreground/50 fixed inset-0 z-50 transition-opacity duration-200 data-[closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                        rdxDrawerBackdrop
                    ></div>

                    <div
                        class="demo-drawer-popup demo-drawer-side-right after:ease fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] origin-top [transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)] flex-col [--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px] [transition:var(--transition-demo-drawer)] after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-x))))] after:border-0 after:bg-[inherit] after:transition-[width] after:duration-300 after:content-[''] focus:outline-none data-[closed]:[transform:translateX(100%)] data-[nested-drawer-open]:-translate-y-3 data-[nested-drawer-open]:scale-[0.965] data-[starting-style]:[transform:translateX(100%)] data-[swiping]:[transition:none] data-[swiping]:after:duration-0"
                        rdxDrawerPopup
                    >
                        <div class="overflow-y-auto p-6" rdxDrawerContent>
                            <h2 class="demo-dialog-title" rdxDrawerTitle>Detached triggers</h2>
                            <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                The triggers and this drawer are connected with
                                <code>createRdxDrawerHandle()</code>
                                rather than DOM nesting.
                            </p>

                            <div class="mt-6 flex justify-end gap-2">
                                <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDrawerClose>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerDetachedComponent {
    protected readonly handle = createRdxDrawerHandle();
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
