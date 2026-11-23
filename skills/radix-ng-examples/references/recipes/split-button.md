# Split Button

#### A primary action paired with a menu of related actions, joined as one control.

A split button is not a primitive — it is a composition. The [Button](../components/button.md)
primitive provides the primary action, and the [Menu](../components/menu.md) primitive
provides the secondary actions in a dropdown. The two `<button>` elements share a rounded shell so they
look like one control while staying independently focusable and accessible.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

/**
 * Split Button — a primary action joined to a menu of related actions.
 *
 * Composition only: the `button` primitive drives the primary action, and the `menu` primitive
 * (Root / Trigger / Positioner / Popup / Item) drives the secondary actions. The two `<button>`
 * elements share a rounded shell so they read as one control while staying independently focusable.
 */
@Component({
    selector: 'split-button-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxButtonDirective,
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator,
        LucideChevronDown
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="inline-flex rounded-md shadow-sm">
                <button class="demo-button demo-button-primary h-9 rounded-r-none px-4" (click)="run('Save')" rdxButton>
                    Save
                </button>

                <ng-container rdxMenuRoot>
                    <button
                        class="demo-button demo-button-primary border-primary-foreground/20 size-9 rounded-l-none border-l p-0"
                        aria-label="More save options"
                        rdxMenuTrigger
                    >
                        <svg lucideChevronDown size="16"></svg>
                    </button>

                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        *rdxMenuPortal
                        sideOffset="6"
                        align="end"
                        rdxMenuPositioner
                    >
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save and duplicate')"
                                rdxMenuItem
                            >
                                Save and duplicate
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save as template')"
                                rdxMenuItem
                            >
                                Save as template
                            </button>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save and close')"
                                rdxMenuItem
                            >
                                Save and close
                            </button>
                        </div>
                    </div>
                </ng-container>
            </div>

            <p class="text-muted-foreground text-sm">
                Last action:
                <span class="text-foreground font-medium">{{ lastAction() }}</span>
            </p>
        </div>
    `
})
export class SplitButtonExample {
    protected readonly lastAction = signal('—');

    protected run(action: string): void {
        this.lastAction.set(action);
    }
}
```

## Composed from

- **[Button](../components/button.md)** (`rdxButton`) — the primary action on the left.
- **[Menu](../components/menu.md)** (`rdxMenuRoot` / `rdxMenuTrigger` / `rdxMenuPositioner` /
  `rdxMenuPopup` / `rdxMenuItem` / `rdxMenuSeparator`) — the chevron trigger and the dropdown of related
  actions.

## Anatomy

The two buttons sit inside one rounded shell. The primary button runs the default action; the chevron
button is the menu trigger. Mount the positioner with the structural `*rdxMenuPortal` so the popup
teleports into `document.body` while open and animates out before unmounting. Bind each item's action to
`(onSelect)` (not `(click)`) so keyboard activation records it too.

```html
<div class="inline-flex rounded-md shadow-sm">
    <button class="rounded-r-none" rdxButton>Save</button>

    <ng-container rdxMenuRoot>
        <button class="rounded-l-none" aria-label="More save options" rdxMenuTrigger>
            <svg lucideChevronDown></svg>
        </button>

        <div *rdxMenuPortal sideOffset="6" align="end" rdxMenuPositioner>
            <div rdxMenuPopup>
                <button (onSelect)="run('Save and duplicate')" rdxMenuItem>Save and duplicate</button>
                <button (onSelect)="run('Save as template')" rdxMenuItem>Save as template</button>
                <div rdxMenuSeparator></div>
                <button (onSelect)="run('Save and close')" rdxMenuItem>Save and close</button>
            </div>
        </div>
    </ng-container>
</div>
```

## Examples

<a href="../guides/styling.md#copy-an-example-into-your-app" target="_top">Example setup</a>

### Default

A primary "Save" action with a menu of related save actions. The primary button runs the default
action; the chevron opens the menu, and selecting an item runs that action and closes the menu.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

/**
 * Split Button — a primary action joined to a menu of related actions.
 *
 * Composition only: the `button` primitive drives the primary action, and the `menu` primitive
 * (Root / Trigger / Positioner / Popup / Item) drives the secondary actions. The two `<button>`
 * elements share a rounded shell so they read as one control while staying independently focusable.
 */
@Component({
    selector: 'split-button-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxButtonDirective,
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator,
        LucideChevronDown
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="inline-flex rounded-md shadow-sm">
                <button class="demo-button demo-button-primary h-9 rounded-r-none px-4" (click)="run('Save')" rdxButton>
                    Save
                </button>

                <ng-container rdxMenuRoot>
                    <button
                        class="demo-button demo-button-primary border-primary-foreground/20 size-9 rounded-l-none border-l p-0"
                        aria-label="More save options"
                        rdxMenuTrigger
                    >
                        <svg lucideChevronDown size="16"></svg>
                    </button>

                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        *rdxMenuPortal
                        sideOffset="6"
                        align="end"
                        rdxMenuPositioner
                    >
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save and duplicate')"
                                rdxMenuItem
                            >
                                Save and duplicate
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save as template')"
                                rdxMenuItem
                            >
                                Save as template
                            </button>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save and close')"
                                rdxMenuItem
                            >
                                Save and close
                            </button>
                        </div>
                    </div>
                </ng-container>
            </div>

            <p class="text-muted-foreground text-sm">
                Last action:
                <span class="text-foreground font-medium">{{ lastAction() }}</span>
            </p>
        </div>
    `
})
export class SplitButtonExample {
    protected readonly lastAction = signal('—');

    protected run(action: string): void {
        this.lastAction.set(action);
    }
}
```

## Accessibility

Keep the menu trigger a separate, focusable `<button>` from the primary action, and give it an
`aria-label` (its only content is an icon). Each is independently reachable by keyboard, and the menu
itself follows the WAI-ARIA menu button pattern provided by the Menu primitive.

### Keyboard Interactions

| Key                     | Description                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| `Tab`                   | Moves focus between the primary action and the menu trigger.                      |
| `Enter` / `Space`       | Activates the focused button — runs the primary action, or opens the menu.        |
| `ArrowDown` / `ArrowUp` | When the trigger is focused, opens the menu and focuses the first / last item.     |

Once the menu is open it follows the [Menu](../components/menu.md) keyboard model —
`ArrowUp` / `ArrowDown` move between items, `Home` / `End` jump to the first / last item, typeahead
matches item text, and `Escape` closes the menu and returns focus to the trigger.

## Example files

Install `@lucide/angular` when an example imports it.
