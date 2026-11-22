# Popover — Controlled

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind `[(open)]` when application state should open or close the popover programmatically. This
example also includes the optional backdrop part.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverBackdrop,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverBackdrop,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex items-center gap-2">
                <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="open.set(true)">
                    Open externally
                </button>
                <button class="demo-button demo-button-ghost h-8 px-3 text-xs" (click)="open.set(false)">
                    Close externally
                </button>
            </div>

            <p class="text-muted-foreground text-xs">State: {{ open() ? 'open' : 'closed' }}</p>

            <ng-container [(open)]="open" rdxPopoverRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxPopoverTrigger>Toggle popover</button>

                <ng-template rdxPopoverPortal>
                    <div class="bg-foreground/10 fixed inset-0" rdxPopoverBackdrop></div>
                    <div class="z-50" sideOffset="8" rdxPopoverPositioner>
                        <div class="demo-surface relative w-80 p-4" rdxPopoverPopup>
                            <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                            <h2 class="demo-popover-title" rdxPopoverTitle>Controlled state</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                The root uses Angular two-way binding with a signal.
                            </p>
                            <button
                                class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                                aria-label="Close"
                                rdxPopoverClose
                            >
                                <svg aria-hidden="true" lucideX size="14" />
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
    `
})
export class RdxPopoverControlledComponent {
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
