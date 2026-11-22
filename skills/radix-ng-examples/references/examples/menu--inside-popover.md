# Menu — Inside Popover

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Declare Menu inside Popover's popup so portaled commands keep their floating ancestry. Escape
closes the submenu, Menu, then Popover. Selecting an item preserves Popover; clicking outside both
surfaces closes both in the default trap-focus mode. Modal popover blocks outside interaction and
page scrolling, and outside presses dismiss one layer at a time. Keep menu mounted and Defer menu exit demonstrate Menu's
exit controls.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { injectId } from '@radix-ng/primitives/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    type RdxMenuOpenChange
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
    selector: 'rdx-menu-in-popover',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
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
        RdxPopoverClose,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid gap-4">
            <div class="flex flex-wrap gap-4 text-sm">
                <label class="flex items-center gap-2">
                    <input [checked]="modal()" (change)="modal.set($any($event.target).checked)" type="checkbox" />
                    Modal popover
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep menu mounted
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer menu exit
                </label>
            </div>
            <ng-container [modal]="modal() ? true : 'trap-focus'" rdxPopoverRoot>
                <button class="demo-button demo-button-outline h-9 w-fit px-4" rdxPopoverTrigger>
                    Workspace tools
                </button>
                <ng-template rdxPopoverPortal>
                    <div class="z-50" align="start" sideOffset="8" rdxPopoverPositioner>
                        <div class="demo-surface relative w-80 p-4" rdxPopoverPopup>
                            <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                            <h2 class="demo-popover-title" rdxPopoverTitle>Workspace commands</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                Escape closes the deepest layer. Modal popover also dismisses one layer per outside
                                press.
                            </p>
                            <div class="my-4 grid gap-3">
                                <label class="text-sm font-medium" [for]="nameId">Workspace name</label>
                                <input class="demo-input h-9 w-full px-3" [id]="nameId" value="Design system" />
                                <ng-container
                                    #menu="rdxMenuRoot"
                                    (onOpenChange)="change($event)"
                                    (onOpenChangeComplete)="complete($event)"
                                    rdxMenuRoot
                                >
                                    <button
                                        class="demo-button demo-button-outline h-8 w-fit px-3 text-xs"
                                        rdxMenuTrigger
                                    >
                                        Actions
                                    </button>
                                    <ng-template [keepMounted]="keep()" rdxMenuPortal>
                                        <div
                                            class="z-50 data-[closed]:pointer-events-none"
                                            align="start"
                                            sideOffset="4"
                                            rdxMenuPositioner
                                        >
                                            <div
                                                class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out w-56 min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                                                rdxMenuPopup
                                            >
                                                <button
                                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                    (onSelect)="selected.set('Rename')"
                                                    rdxMenuItem
                                                >
                                                    Rename
                                                </button>
                                                <ng-container rdxMenuRoot>
                                                    <button
                                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                        rdxMenuSubTrigger
                                                    >
                                                        Share
                                                        <svg
                                                            class="ms-auto"
                                                            aria-hidden="true"
                                                            lucideChevronRight
                                                            size="16"
                                                        />
                                                    </button>
                                                    <ng-template [keepMounted]="keep()" rdxMenuPortal>
                                                        <div
                                                            class="z-50 data-[closed]:pointer-events-none"
                                                            side="right"
                                                            align="start"
                                                            sideOffset="4"
                                                            rdxMenuPositioner
                                                        >
                                                            <div
                                                                class="demo-menu-popup w-48 min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                                                rdxMenuPopup
                                                            >
                                                                <button
                                                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                                    (onSelect)="selected.set('Copy link')"
                                                                    rdxMenuItem
                                                                >
                                                                    Copy link
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </ng-template>
                                                </ng-container>
                                                <button
                                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                    (onSelect)="selected.set('Archive')"
                                                    rdxMenuItem
                                                >
                                                    Archive
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                    @if (defer()) {
                                        <button
                                            class="demo-button demo-button-ghost h-8 w-fit px-3 text-xs"
                                            (click)="menu.unmount()"
                                            type="button"
                                        >
                                            Finish menu exit
                                        </button>
                                    }
                                </ng-container>
                                <output class="text-muted-foreground text-sm">Selected: {{ selected() }}</output>
                                <output class="text-muted-foreground text-sm">
                                    Menu completed: {{ completed().join(' → ') || 'none' }}
                                </output>
                            </div>
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxPopoverClose>
                                Close workspace
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuInPopoverComponent {
    protected readonly p = {
        positioner: 'z-50',
        popup: 'demo-surface relative w-80 p-4',
        popupAnimated:
            'data-[open]:animate-popover-popup-in data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out',
        backdrop: 'fixed inset-0 bg-foreground/10',
        arrow: 'text-card demo-arrow my-px',
        title: 'demo-popover-title',
        description: 'mt-1 text-sm text-muted-foreground',
        close: 'demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0'
    };
    protected readonly nameId = injectId('rdx-menu-workspace-name-');
    protected readonly modal = signal(false);
    protected readonly keep = signal(false);
    protected readonly defer = signal(false);
    protected readonly selected = signal('none');
    protected readonly completed = signal<string[]>([]);
    protected change(change: RdxMenuOpenChange) {
        if (!change.open && this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completed.update((values) => [...values, open ? 'open' : 'closed']);
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
