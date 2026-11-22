# Menu — Pointer gestures

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Set `openOnHover` on the trigger to open after `delay`; `closeDelay` and the grace area protect
travel into the popup. Hover opening focuses the popup without highlighting a command. Clicking
promotes an open hover menu to `trigger-press`, so moving away keeps it open. A press before the
hover delay also keeps its press lifetime. Hover dismissal reports `trigger-hover` with the native
mouse event; it does not restore focus to the trigger.

Hold the primary mouse button, move onto a command, and release after the 200 ms opening guard to
select it. Disabled commands may receive hover focus but cannot activate. Checkbox/radio and
`closeOnClick=false` items keep their usual stay-open behavior.

Touch taps work with hover opening enabled. Tapping a submenu trigger opens it; tapping it again
closes that child. Disabled items stay available to keyboard navigation and do not take pointer focus.
The trigger's `data-pressed` remains set while its menu is open; use native `:active` for physical
press feedback. Change details preserve the original browser event, so a touch activation may report
its compatibility `mousedown` rather than a PointerEvent.

Submenu hover uses entry delay and pointer-rest intent. A canceled opening can leave the other
intent pending; an accepted opening consumes it.

Submenus protect diagonal travel, including RTL. After entering the submenu, moving outside it
does not dismiss it; hovering another parent item closes that branch.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-pointer',
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex max-w-sm flex-col gap-4">
            <p class="text-muted-foreground text-sm">
                Hover to open. Click to keep it open, or hold the mouse button, drag onto a command and release.
            </p>
            <ng-container rdxMenuRoot>
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    [openOnHover]="true"
                    [delay]="180"
                    [closeDelay]="80"
                    rdxMenuTrigger
                >
                    Commands
                </button>
                <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="8" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="selected.set('New tab')"
                            rdxMenuItem
                        >
                            New tab
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            [disabled]="true"
                            rdxMenuItem
                        >
                            Unavailable
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="selected.set('Save page')"
                            rdxMenuItem
                        >
                            Save page
                        </button>
                    </div>
                </div>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                {{ selected() || 'No command selected' }}
            </output>
        </div>
    `
})
export class RdxMenuPointerComponent {
    protected readonly selected = signal('');
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
