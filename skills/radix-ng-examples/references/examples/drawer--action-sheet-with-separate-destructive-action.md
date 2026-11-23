# Drawer — Action sheet with separate destructive action

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

An iOS-style action sheet: grouped actions with a separated destructive action and a cancel button,
each closing the drawer.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
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
    selector: 'rdx-drawer-action-sheet',
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
        <div rdxDrawerRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDrawerTrigger>Photo options</button>

            <ng-template rdxDrawerPortal>
                <div
                    class="bg-foreground/50 fixed inset-0 z-50 transition-opacity duration-200 data-[closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                    rdxDrawerBackdrop
                ></div>

                <div
                    class="demo-drawer-popup demo-drawer-side-bottom after:ease fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] origin-top [transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)] flex-col [--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px] [transition:var(--transition-demo-drawer)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-y))))] after:border-0 after:bg-[inherit] after:transition-[height] after:duration-300 after:content-[''] focus:outline-none data-[closed]:[transform:translateY(100%)] data-[nested-drawer-open]:-translate-y-3 data-[nested-drawer-open]:scale-[0.965] data-[starting-style]:[transform:translateY(100%)] data-[swiping]:[transition:none] data-[swiping]:after:duration-0"
                    rdxDrawerPopup
                >
                    <div class="bg-muted mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full" aria-hidden="true"></div>

                    <div class="overflow-y-auto pb-2" rdxDrawerContent>
                        <h2 class="sr-only" rdxDrawerTitle>Photo options</h2>
                        <p class="text-muted-foreground px-6 py-3 text-center text-xs" rdxDrawerDescription>
                            Choose an action for this photo
                        </p>

                        <!-- Primary group of actions. -->
                        <div class="divide-border border-border flex flex-col divide-y border-y">
                            <button
                                class="text-foreground hover:bg-muted focus-visible:bg-muted block w-full px-4 py-3 text-center text-sm focus-visible:outline-none"
                                rdxDrawerClose
                            >
                                Save to Photos
                            </button>
                            <button
                                class="text-foreground hover:bg-muted focus-visible:bg-muted block w-full px-4 py-3 text-center text-sm focus-visible:outline-none"
                                rdxDrawerClose
                            >
                                Copy Link
                            </button>
                            <button
                                class="text-foreground hover:bg-muted focus-visible:bg-muted block w-full px-4 py-3 text-center text-sm focus-visible:outline-none"
                                rdxDrawerClose
                            >
                                Add to Album
                            </button>
                        </div>

                        <!-- Destructive action, set apart by a full-bleed spacer. -->
                        <div class="bg-muted h-2" aria-hidden="true"></div>
                        <button
                            class="text-foreground hover:bg-muted focus-visible:bg-muted border-border text-destructive block w-full border-b px-4 py-3 text-center text-sm font-medium focus-visible:outline-none"
                            rdxDrawerClose
                        >
                            Delete Photo
                        </button>

                        <div class="bg-muted h-2" aria-hidden="true"></div>
                        <button
                            class="text-foreground hover:bg-muted focus-visible:bg-muted block w-full px-4 py-3 text-center text-sm font-semibold focus-visible:outline-none"
                            rdxDrawerClose
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerActionSheetComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
