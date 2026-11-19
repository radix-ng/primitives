# Drawer — State

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Own the open state with `[(open)]` and drive it from anywhere — buttons outside the drawer open and
close it alongside the trigger.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxDrawerBackdrop,
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
    selector: 'rdx-drawer-controlled',
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Drawer is {{ open() ? 'open' : 'closed' }}</p>

            <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="open.set(true)">
                Open from outside
            </button>

            <div [(open)]="open" rdxDrawerRoot>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDrawerTrigger>Open drawer</button>

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
                            <h2 class="demo-dialog-title" rdxDrawerTitle>Controlled drawer</h2>
                            <p class="text-muted-foreground mt-1.5 text-sm" rdxDrawerDescription>
                                The open state is owned by the component and bound with
                                <code>[(open)]</code>
                                .
                            </p>

                            <div class="mt-6 flex justify-end gap-2">
                                <button
                                    class="demo-button demo-button-primary h-8 px-3 text-xs"
                                    (click)="open.set(false)"
                                >
                                    Close from outside
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerControlledComponent {
    protected readonly open = signal(false);
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
