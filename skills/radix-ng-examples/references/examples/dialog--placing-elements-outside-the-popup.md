# Dialog — Placing elements outside the popup

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Make the popup a transparent `pointer-events-none` frame and opt its children back into pointer events
individually, so elements such as a close button can sit outside the visible content card while the gaps
around it stay dismissable.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger,
    RdxDialogViewport
} from '@radix-ng/primitives/dialog';

/**
 * Placing elements outside the popup — a 1-1 port of the Base UI "uncontained" dialog.
 *
 * The `rdxDialogPopup` is a transparent positioning frame that fills the viewport; its children opt
 * into pointer events individually — the content card and a `Close` button rendered *outside* (above)
 * the card. Keeping the button inside the popup means it stays in the focus trap and is Tab-reachable,
 * even though it sits outside the visible card. Dismiss via Escape, the close button, or pressing the
 * dimmed area around the frame.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-uncontained',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogViewport,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div rdxDialogRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>

                <div class="fixed inset-0 z-50 grid place-items-center px-4 py-12 xl:py-6" rdxDialogViewport>
                    <!-- Transparent frame: pointer-events-none so the gaps around the card stay dismissable. -->
                    <div
                        class="group/popup pointer-events-none relative flex h-full w-full max-w-[70rem] justify-center transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 xl:max-w-none"
                        rdxDialogPopup
                    >
                        <!-- Rendered outside the card, above its top-right corner. -->
                        <button
                            class="border-border bg-background text-foreground hover:bg-muted pointer-events-auto absolute -top-10 right-0 flex size-8 items-center justify-center rounded-md border shadow-sm xl:top-0"
                            aria-label="Close"
                            rdxDialogClose
                        >
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>

                        <div
                            class="border-border bg-card text-card-foreground pointer-events-auto h-full w-full max-w-[70rem] rounded-md border p-6 shadow-sm transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[starting-style]/popup:scale-105"
                        >
                            <h2 class="demo-dialog-title" rdxDialogTitle>Uncontained dialog</h2>
                            <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                                The close button lives in the popup but is rendered outside this card, above its
                                top-right corner.
                            </p>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogUncontainedComponent {}
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
