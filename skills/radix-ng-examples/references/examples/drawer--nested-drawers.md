# Drawer — Nested drawers

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Drawers stack on top of each other — each level's content hosts the trigger for the next. Nesting is
detected through the dialog hierarchy, so every parent gains `data-nested-drawer-open` (and
`--nested-drawers`) and recedes behind the one in front.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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

/**
 * A self-recursive drawer: each level's content hosts the trigger for the next level, so drawers
 * stack on top of each other. Nesting is detected through the dialog hierarchy, so every parent
 * gains `data-nested-drawer-open` and recedes behind the one in front (see `.demo-drawer-popup`).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-nested',
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
            <button
                class="demo-button h-9 px-4"
                [class]="level() === 1 ? 'demo-button-primary' : 'demo-button-outline'"
                rdxDrawerTrigger
            >
                {{ level() === 1 ? 'Open drawer' : 'Open drawer ' + level() }}
            </button>

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

                    <div class="overflow-y-auto p-6" rdxDrawerContent>
                        <h2 class="demo-dialog-title" rdxDrawerTitle>Drawer level {{ level() }}</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                            @if (level() < max()) {
                                Open another to stack it on top — this one scales back and peeks behind it.
                            } @else {
                                Deepest level. Swipe down or press Escape to peel the stack back one at a time.
                            }
                        </p>

                        <div class="mt-6 flex justify-end gap-2">
                            @if (level() < max()) {
                                <rdx-drawer-nested [level]="level() + 1" [max]="max()" />
                            }
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDrawerClose>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerNestedComponent {
    /** Current depth (1 = the root drawer). */
    readonly level = input(1);
    /** How many levels can be stacked. */
    readonly max = input(4);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
