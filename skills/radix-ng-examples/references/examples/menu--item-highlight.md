# Menu — Item highlight

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Use `(onItemHighlighted)` to preview the current command as the user navigates. `$event` contains
`item` (the native element, or `undefined` after clearing), `label`, `reason` and the original native
`event`. The reason is `keyboard` for arrows/typeahead, `pointer` for hover/leave, and `none` for
opening, closing or collection changes. Changes without native input carry a generic `Event`.

The label uses the item's explicit `label` input, falling back to its text content. Repeating the
same item does not emit again. Replacing the element at the same index does emit; changing only
its label does not. Each nested Root reports its own highlighted item.

The event type narrows with `reason`: checking `keyboard` gives a `KeyboardEvent`, and `pointer`
gives a `MouseEvent | PointerEvent`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuItemHighlightedEvent,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-highlight-example',
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid w-80 gap-4">
            <ng-container (onItemHighlighted)="highlight.set($event)" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Command preview</button>
                <div
                    class="z-50 data-[closed]:pointer-events-none"
                    *rdxMenuPortal
                    align="start"
                    sideOffset="4"
                    rdxMenuPositioner
                >
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            Open file
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            [disabled]="true"
                            rdxMenuItem
                        >
                            Save file
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            label="Export document"
                            rdxMenuItem
                        >
                            Export…
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            Print document
                        </button>
                    </div>
                </div>
            </ng-container>
            <p class="text-muted-foreground text-sm">Use arrow keys, type a command, or hover to preview an item.</p>
            <output class="grid gap-1 text-sm">
                <span>Highlighted: {{ highlight()?.label ?? 'none' }}</span>
                <span class="text-muted-foreground">Reason: {{ highlight()?.reason ?? 'none' }}</span>
            </output>
        </section>
    `
})
export class RdxMenuHighlightExampleComponent {
    protected readonly highlight = signal<RdxMenuItemHighlightedEvent | undefined>(undefined);
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
