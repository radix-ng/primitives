# Drawer — Swipe to open

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

An off-canvas `rdxDrawerSwipeArea` strip reveals the drawer as the pointer moves, then settles it
open or closed on release. This example mirrors
Base UI's right-edge swipe-area demo: the non-modal drawer portals back into a local,
`overflow-hidden` container and uses `rdxDrawerViewport` to position the popup inside it.

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
    RdxDrawerSwipeArea,
    RdxDrawerTitle,
    RdxDrawerViewport
} from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-swipe-to-open',
    imports: [
        RdxDrawerRoot,
        RdxDrawerSwipeArea,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerViewport,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose
    ],
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
                        class="bg-foreground/20 ease-demo-drawer-swipe absolute inset-0 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-(--duration-demo-drawer-swipe) data-[closed]:opacity-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                        rdxDrawerBackdrop
                    ></div>

                    <div class="absolute inset-0 z-20 flex items-stretch justify-end" rdxDrawerViewport>
                        <div
                            class="border-border bg-card text-card-foreground h-full w-80 max-w-[calc(100%-3rem)] [transform:translateX(var(--drawer-swipe-movement-x))] overflow-y-auto border-l p-6 shadow-lg outline-none [--drawer-swipe-movement-x:0px] [transition:var(--transition-demo-drawer-swipe)] data-[ending-style]:[transform:translateX(100%)] data-[starting-style]:[transform:translateX(100%)] data-[swiping]:select-none data-[swiping]:[transition:none]"
                            rdxDrawerPopup
                        >
                            <div class="mx-auto w-full max-w-lg" rdxDrawerContent>
                                <h2 class="demo-dialog-title" rdxDrawerTitle>Library</h2>
                                <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                    Swipe from the edge whenever you want to jump back into your playlists.
                                </p>
                                <div class="mt-6 flex justify-end gap-2">
                                    <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDrawerClose>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerSwipeToOpenComponent {}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
