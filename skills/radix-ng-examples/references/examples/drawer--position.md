# Drawer — Position

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Set `[swipeDirection]` and position the popup with CSS to anchor the drawer to any edge. The direction
controls the dismiss gesture; the visual side is consumer CSS.

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
    RdxDrawerSwipeDirection,
    RdxDrawerTitle,
    RdxDrawerTrigger
} from '@radix-ng/primitives/drawer';

type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

const SIDE_CLASSES = {
    bottom: "demo-drawer-side-bottom inset-x-0 bottom-0 max-h-[90vh] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-y))))] after:border-0 after:bg-[inherit] after:transition-[height] after:duration-300 after:ease after:content-[''] [--drawer-entry-transform:translateY(100%)]",
    top: "demo-drawer-side-top inset-x-0 top-0 max-h-[90vh] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-full after:h-[calc(3rem+max(0px,var(--drawer-swipe-movement-y)))] after:border-0 after:bg-[inherit] after:transition-[height] after:duration-300 after:ease after:content-[''] [--drawer-entry-transform:translateY(-100%)]",
    left: "demo-drawer-side-left inset-y-0 left-0 w-80 max-w-[90vw] after:pointer-events-none after:absolute after:inset-y-0 after:right-full after:w-[calc(3rem+max(0px,var(--drawer-swipe-movement-x)))] after:border-0 after:bg-[inherit] after:transition-[width] after:duration-300 after:ease after:content-[''] [--drawer-entry-transform:translateX(-100%)]",
    right: "demo-drawer-side-right inset-y-0 right-0 w-80 max-w-[90vw] after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-x))))] after:border-0 after:bg-[inherit] after:transition-[width] after:duration-300 after:ease after:content-[''] [--drawer-entry-transform:translateX(100%)]"
} as const satisfies Record<DrawerSide, string>;

const SIDES: { side: DrawerSide; swipeDirection: RdxDrawerSwipeDirection }[] = [
    { side: 'top', swipeDirection: 'up' },
    { side: 'right', swipeDirection: 'right' },
    { side: 'bottom', swipeDirection: 'down' },
    { side: 'left', swipeDirection: 'left' }
];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-sides',
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
        <div class="flex flex-wrap gap-3">
            @for (item of sides; track item.side) {
                <div [swipeDirection]="item.swipeDirection" rdxDrawerRoot>
                    <button class="demo-button demo-button-outline h-9 px-4 capitalize" rdxDrawerTrigger>
                        {{ item.side }}
                    </button>

                    <ng-template rdxDrawerPortal>
                        <div
                            class="bg-foreground/50 fixed inset-0 z-50 transition-opacity duration-200 data-[closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                            rdxDrawerBackdrop
                        ></div>

                        <div
                            class="demo-drawer-popup fixed z-50 flex origin-top [transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)] flex-col [--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px] [transition:var(--transition-demo-drawer)] focus:outline-none data-[closed]:[transform:var(--drawer-entry-transform)] data-[nested-drawer-open]:-translate-y-3 data-[nested-drawer-open]:scale-[0.965] data-[starting-style]:[transform:var(--drawer-entry-transform)] data-[swiping]:[transition:none] data-[swiping]:after:duration-0"
                            [class]="sideClasses[item.side]"
                            rdxDrawerPopup
                        >
                            <div class="overflow-y-auto p-6" rdxDrawerContent>
                                <h2 class="demo-dialog-title capitalize" rdxDrawerTitle>{{ item.side }} drawer</h2>
                                <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                    Swipe {{ item.swipeDirection }} to dismiss.
                                </p>

                                <div class="mt-6 flex justify-end gap-2">
                                    <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDrawerClose>
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </div>
            }
        </div>
    `
})
export class RdxDrawerSidesComponent {
    protected readonly sides = SIDES;
    protected readonly sideClasses = SIDE_CLASSES;
}
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
