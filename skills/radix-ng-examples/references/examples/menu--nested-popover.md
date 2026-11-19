# Menu — Nested Popover

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Combine `rdxMenuItem` and `rdxPopoverTrigger` with `closeOnClick=false` to keep the item and its
Popover Root available while editing. Escape from the editor returns to the item, then closes
Menu. Trap focus in editor optionally keeps keyboard navigation inside Popover.
With Keep mounted, the example also resets the editor's `open` state when Menu closes. Retaining
the Menu portal preserves its nested Root and state; hiding Menu alone does not close Popover.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';
import {
    RdxPopoverArrow,
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
    selector: 'rdx-menu-nested-popover',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid gap-4">
            <label class="flex items-center gap-2 text-sm">
                <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                Keep mounted
            </label>
            <label class="flex items-center gap-2 text-sm">
                <input [checked]="trap()" (change)="trap.set($any($event.target).checked)" type="checkbox" />
                Trap focus in editor
            </label>
            <ng-container (openChange)="closeEditorOnMenuClose($event)" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 w-fit px-4" rdxMenuTrigger>Quick actions</button>
                <ng-template [keepMounted]="keep()" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" align="start" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup w-56 min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <ng-container [(open)]="editorOpen" [modal]="trap() ? 'trap-focus' : false" rdxPopoverRoot>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    [closeOnClick]="false"
                                    rdxMenuItem
                                    rdxPopoverTrigger
                                >
                                    Quick rename…
                                </button>
                                <ng-template rdxPopoverPortal>
                                    <div class="z-50" side="right" align="start" sideOffset="8" rdxPopoverPositioner>
                                        <div class="demo-surface relative grid w-80 gap-4 p-4" rdxPopoverPopup>
                                            <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                                            <h2 class="demo-popover-title" rdxPopoverTitle>Quick rename</h2>
                                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                                Use Escape in the editor to return to the menu.
                                            </p>
                                            <div class="grid gap-2">
                                                <label class="text-sm font-medium" [for]="nameId">Document name</label>
                                                <input
                                                    class="demo-input h-9 w-full px-3"
                                                    [id]="nameId"
                                                    value="Project notes"
                                                />
                                            </div>
                                            <div class="flex justify-end gap-2">
                                                <button
                                                    class="demo-button demo-button-outline h-8 px-3 text-xs"
                                                    rdxPopoverClose
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    class="demo-button demo-button-primary h-8 px-3 text-xs"
                                                    rdxPopoverClose
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                rdxMenuItem
                            >
                                Duplicate
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                rdxMenuItem
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuNestedPopoverComponent {
    protected readonly nameId = injectId('rdx-menu-nested-name-');
    protected readonly keep = signal(false);
    protected readonly trap = signal(false);
    protected readonly editorOpen = signal(false);

    protected closeEditorOnMenuClose(open: boolean): void {
        if (!open) this.editorOpen.set(false);
    }
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
