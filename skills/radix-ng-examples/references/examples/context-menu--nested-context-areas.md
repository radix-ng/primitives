# Context Menu — Nested context areas

> One example from the [Context Menu](../components/context-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The nearest context area owns a right-click or touch long-press. It consumes the native gesture even
when an application cancels opening, so the parent area cannot issue a second request.
Submenus use the standard Menu parts: Escape closes the deepest submenu and selection closes the chain.

Canceling an outside close keeps the current area session and anchor. A gesture can produce separate
pointerdown/mousedown requests; keep your veto policy active until retry is allowed.

```typescript
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-areas',
    imports: [
        RdxContextMenuRoot,
        RdxContextMenuTrigger,
        RdxMenuRoot,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid max-w-full gap-4">
            <ng-container rdxContextMenuRoot>
                @if (nested()) {
                    <div
                        class="demo-menu-context-area data-[popup-open]:bg-muted flex grid min-h-28 min-w-40 items-center justify-center gap-4 p-4 p-6 data-[popup-open]:border-solid"
                        tabindex="0"
                        rdxContextMenuTrigger
                    >
                        Outer area
                        <div
                            class="demo-menu-context-area data-[popup-open]:bg-muted flex min-h-28 min-w-40 items-center justify-center p-4 data-[popup-open]:border-solid"
                            tabindex="0"
                            rdxContextMenuTrigger
                        >
                            Inner area
                        </div>
                    </div>
                } @else {
                    <div class="grid gap-4 sm:grid-cols-2">
                        <div
                            class="demo-menu-context-area data-[popup-open]:bg-muted flex min-h-28 min-w-40 items-center justify-center p-4 data-[popup-open]:border-solid"
                            tabindex="0"
                            rdxContextMenuTrigger
                        >
                            First area
                        </div>
                        <div
                            class="demo-menu-context-area data-[popup-open]:bg-muted flex min-h-28 min-w-40 items-center justify-center p-4 data-[popup-open]:border-solid"
                            tabindex="0"
                            rdxContextMenuTrigger
                        >
                            Second area
                        </div>
                    </div>
                }
                <ng-template rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        side="right"
                        align="start"
                        sideOffset="4"
                        rdxMenuPositioner
                    >
                        <div
                            class="demo-menu-popup min-w-44! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <div
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="selected.set('Open')"
                                rdxMenuItem
                            >
                                Open
                            </div>
                            <div
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="selected.set('Duplicate')"
                                rdxMenuItem
                            >
                                Duplicate
                            </div>
                            <ng-container rdxMenuRoot>
                                <div
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border data-[popup-open]:bg-muted relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuSubTrigger
                                >
                                    Share
                                    <svg class="size-4 shrink-0" lucideChevronRight></svg>
                                </div>
                                <ng-template rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        side="right"
                                        align="start"
                                        sideOffset="8"
                                        alignOffset="-4"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-menu-popup min-w-40! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                            rdxMenuPopup
                                        >
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                (onSelect)="selected.set('Copy link')"
                                                rdxMenuItem
                                            >
                                                Copy link
                                            </div>
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                (onSelect)="selected.set('Send by email')"
                                                rdxMenuItem
                                            >
                                                Send by email
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground text-sm">Right-click an area to open the shared menu.</p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxContextMenuAreasComponent {
    readonly nested = input(false);
    protected readonly selected = signal('none');
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
