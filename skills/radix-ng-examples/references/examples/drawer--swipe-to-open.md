# Drawer — Swipe to open

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

An off-canvas `rdxDrawerSwipeArea` strip reveals the drawer as the pointer moves, then settles it
open or closed on release. This example mirrors
Base UI's right-edge swipe-area demo: the non-modal drawer portals back into a local,
`overflow-hidden` container and uses `rdxDrawerViewport` to position the popup inside it.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-swipe-to-open',
    imports: [...drawerImports],
    template: `
        <div
            class="border-border bg-background text-foreground relative min-h-80 w-full max-w-2xl overflow-hidden border"
            #portalContainer
        >
            <div [modal]="false" swipeDirection="right" rdxDrawerRoot>
                <div
                    class="border-primary bg-primary/10 absolute inset-y-0 right-0 z-[1] w-10 cursor-grab border-l-2 border-dashed data-[swiping]:cursor-grabbing"
                    rdxDrawerSwipeArea
                >
                    <span
                        class="text-primary pointer-events-none absolute top-1/2 right-0 z-0 mr-2 origin-center -translate-y-1/2 -rotate-90 text-xs font-bold tracking-[0.12em] whitespace-nowrap uppercase"
                    >
                        Swipe here
                    </span>
                </div>

                <div class="flex min-h-80 flex-col items-center justify-center gap-3 p-4 pr-16 text-center">
                    <p class="text-muted-foreground text-sm">Swipe from the right edge to open the drawer.</p>
                </div>

                <ng-template [container]="portalContainer" rdxDrawerPortal>
                    <div
                        [class]="
                            cn(
                                'bg-foreground/20 absolute inset-0 opacity-[calc(1-var(--drawer-swipe-progress))]',
                                'transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
                                d.overlayAnimated,
                                'data-[state=closed]:[animation-duration:450ms] data-[state=open]:[animation-duration:450ms]',
                                'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0'
                            )
                        "
                        rdxDrawerBackdrop
                    ></div>

                    <div class="absolute inset-0 z-20 flex items-stretch justify-end" rdxDrawerViewport>
                        <div
                            class="border-border bg-card text-card-foreground h-full w-80 max-w-[calc(100%-3rem)] [transform:translateX(var(--drawer-swipe-movement-x))] overflow-y-auto border-l p-6 shadow-lg outline-none [--drawer-swipe-movement-x:0px] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:[transform:translateX(100%)] data-[starting-style]:[transform:translateX(100%)] data-[swiping]:select-none data-[swiping]:[transition:none]"
                            rdxDrawerPopup
                        >
                            <div class="mx-auto w-full max-w-lg" rdxDrawerContent>
                                <h2 [class]="d.title" rdxDrawerTitle>Library</h2>
                                <p [class]="d.description" rdxDrawerDescription>
                                    Swipe from the edge whenever you want to jump back into your playlists.
                                </p>
                                <div [class]="d.footer">
                                    <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerSwipeToOpenComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```
