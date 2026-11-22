# Drawer — Virtual keyboard

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Add `rdxDrawerVirtualKeyboardProvider` to the drawer viewport for mobile bottom-sheet forms. It writes
`--drawer-keyboard-inset` on the viewport, keeps the focused keyboard input visible as
`visualViewport` changes, adds temporary scroll slack to the nearest drawer scroller, and avoids
handling the parent drawer while a nested drawer is open. Use the CSS variable in viewport padding or
popup max-height.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerDescription,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerRoot,
    RdxDrawerTitle,
    RdxDrawerTrigger,
    RdxDrawerViewport,
    RdxDrawerVirtualKeyboardProvider
} from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-virtual-keyboard',
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerViewport,
        RdxDrawerVirtualKeyboardProvider,
        RdxDrawerPopup,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose
    ],
    template: `
        <div rdxDrawerRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDrawerTrigger>Edit delivery</button>

            <ng-template rdxDrawerPortal>
                <div
                    class="bg-foreground/50 fixed inset-0 z-50 transition-opacity duration-200 data-[closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                    rdxDrawerBackdrop
                ></div>

                <div
                    class="fixed inset-0 z-50 flex items-end justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+var(--drawer-keyboard-inset,0px))] transition-[padding-bottom] duration-200"
                    rdxDrawerViewport
                    rdxDrawerVirtualKeyboardProvider
                >
                    <div
                        class="border-border bg-card text-card-foreground max-h-[min(82vh,calc(100vh-var(--drawer-keyboard-inset,0px)-2rem))] w-full max-w-lg [transform:translateY(var(--drawer-swipe-movement-y))] overflow-hidden rounded-t-xl border px-0 pt-3 shadow-lg outline-none [transition:var(--transition-demo-drawer-keyboard)] data-[ending-style]:[transform:translateY(100%)] data-[starting-style]:[transform:translateY(100%)] data-[swiping]:select-none data-[swiping]:[transition:none]"
                        rdxDrawerPopup
                    >
                        <div class="bg-muted mx-auto mb-4 h-1 w-10 rounded-full"></div>

                        <form
                            class="max-h-[inherit] [scroll-padding-bottom:calc(var(--drawer-keyboard-inset,0px)+4rem)] overflow-y-auto px-6 pb-6"
                        >
                            <div class="mb-5">
                                <h2 class="demo-dialog-title" rdxDrawerTitle>Delivery details</h2>
                                <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                    Confirm the address and contact fields before placing the order.
                                </p>
                            </div>

                            <div class="grid gap-4">
                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Name</span>
                                    <input class="demo-input h-9 w-full px-3" value="Ada Lovelace" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Phone</span>
                                    <input class="demo-input h-9 w-full px-3" inputmode="tel" value="+1 415 555 0142" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Street address</span>
                                    <input class="demo-input h-9 w-full px-3" value="12 Market Street" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Apartment</span>
                                    <input class="demo-input h-9 w-full px-3" placeholder="Optional" />
                                </label>

                                <label class="grid gap-1.5">
                                    <span class="text-foreground text-sm font-medium">Delivery notes</span>
                                    <textarea
                                        class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                                    >
Leave at reception if nobody answers.</textarea
                                    >
                                </label>
                            </div>

                            <div class="bg-card sticky bottom-0 mt-6 flex justify-end gap-2 border-t py-4">
                                <button
                                    class="demo-button demo-button-outline h-8 px-3 text-xs"
                                    type="button"
                                    rdxDrawerClose
                                >
                                    Cancel
                                </button>
                                <button
                                    class="demo-button demo-button-primary h-8 px-3 text-xs"
                                    type="button"
                                    rdxDrawerClose
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerVirtualKeyboardComponent {}
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
