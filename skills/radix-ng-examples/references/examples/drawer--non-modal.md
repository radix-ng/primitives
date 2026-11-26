# Drawer — Non-modal

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Set `[modal]="false"` to keep page scrolling and outside pointer interactions available while the
drawer is open; there is no backdrop in this mode.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
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
    selector: 'rdx-drawer-non-modal',
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the drawer is open, and
                there is no backdrop.
            </p>

            <div [modal]="false" rdxDrawerRoot>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDrawerTrigger>Open non-modal drawer</button>

                <ng-template rdxDrawerPortal>
                    <div
                        class="demo-drawer-popup demo-drawer-side-bottom after:ease fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] origin-top [transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)] flex-col transition-opacity duration-200 [--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px] [transition:var(--transition-demo-drawer)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-y))))] after:border-0 after:bg-[inherit] after:transition-[height] after:duration-300 after:content-[''] focus:outline-none data-[closed]:[transform:translateY(100%)] data-[closed]:opacity-0 data-[nested-drawer-open]:-translate-y-3 data-[nested-drawer-open]:scale-[0.965] data-[starting-style]:[transform:translateY(100%)] data-[starting-style]:opacity-0 data-[swiping]:duration-0 data-[swiping]:[transition:none] data-[swiping]:after:duration-0"
                        rdxDrawerPopup
                    >
                        <div class="bg-muted mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full" aria-hidden="true"></div>

                        <div class="overflow-y-auto p-6" rdxDrawerContent>
                            <h2 class="demo-dialog-title" rdxDrawerTitle>Non-modal drawer</h2>
                            <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                Keep interacting with the rest of the page; the counter below still works.
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

            <button
                class="demo-button demo-button-secondary h-8 px-3 text-xs"
                (click)="outsideClicks.update((count) => count + 1)"
            >
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDrawerNonModalComponent {
    protected readonly outsideClicks = signal(0);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
