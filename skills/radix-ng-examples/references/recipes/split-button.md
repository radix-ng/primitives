# Split Button

#### A primary action paired with a menu of related actions, joined as one control.

A split button is not a primitive — it is a composition. The [Button](?path=/docs/primitives-button--docs)
primitive provides the primary action, and the [Menu](?path=/docs/primitives-menu--docs) primitive
provides the secondary actions in a dropdown. The two `<button>` elements share a rounded shell so they
look like one control while staying independently focusable and accessible.

```typescript
import { cn, demoButton, demoMenu } from '../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

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
    imports: [RdxButtonDirective, RdxMenuModule, LucideChevronDown],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="inline-flex rounded-md shadow-sm">
                <button rdxButton [class]="cn(b.base, b.primary, b.size.md, 'rounded-r-none')" (click)="run('Save')">
                    Save
                </button>

                <ng-container #root="rdxMenuRoot" rdxMenuRoot>
                    <button
                        aria-label="More save options"
                        rdxMenuTrigger
                        [class]="
                            cn(b.base, b.primary, b.size.icon, 'border-primary-foreground/20 rounded-l-none border-l')
                        "
                    >
                        <svg lucideChevronDown size="16"></svg>
                    </button>

                    @if (root.open()) {
                        <div sideOffset="6" align="end" rdxMenuPositioner [class]="m.positioner">
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item" (click)="run('Save and duplicate')">
                                    Save and duplicate
                                </button>
                                <button rdxMenuItem [class]="m.item" (click)="run('Save as template')">
                                    Save as template
                                </button>
                                <div rdxMenuSeparator [class]="m.separator"></div>
                                <button rdxMenuItem [class]="m.item" (click)="run('Save and close')">
                                    Save and close
                                </button>
                            </div>
                        </div>
                    }
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
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;

    protected readonly lastAction = signal('—');

    protected run(action: string): void {
        this.lastAction.set(action);
    }
}
```

## Composed from

- **[Button](?path=/docs/primitives-button--docs)** (`rdxButton`) — the primary action on the left.
- **[Menu](?path=/docs/primitives-menu--docs)** (`rdxMenuRoot` / `rdxMenuTrigger` / `rdxMenuPositioner` /
  `rdxMenuPopup` / `rdxMenuItem` / `rdxMenuSeparator`) — the chevron trigger and the dropdown of related
  actions.

## Anatomy

The two buttons sit inside one rounded shell. The primary button runs the default action; the chevron
button is the menu trigger. Mount the positioner with `@if (root.open())` so the popup leaves the DOM
when closed.

```html
<div class="inline-flex rounded-md shadow-sm">
    <button class="rounded-r-none" rdxButton>Save</button>

    <ng-container #root="rdxMenuRoot" rdxMenuRoot>
        <button class="rounded-l-none" aria-label="More save options" rdxMenuTrigger>
            <svg lucideChevronDown></svg>
        </button>

        @if (root.open()) {
            <div sideOffset="6" align="end" rdxMenuPositioner>
                <div rdxMenuPopup>
                    <button rdxMenuItem>Save and duplicate</button>
                    <button rdxMenuItem>Save as template</button>
                    <div rdxMenuSeparator></div>
                    <button rdxMenuItem>Save and close</button>
                </div>
            </div>
        }
    </ng-container>
</div>
```

## Examples

### Default

A primary "Save" action with a menu of related save actions. The primary button runs the default
action; the chevron opens the menu, and selecting an item runs that action and closes the menu.

```typescript
import { cn, demoButton, demoMenu } from '../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

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
    imports: [RdxButtonDirective, RdxMenuModule, LucideChevronDown],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="inline-flex rounded-md shadow-sm">
                <button rdxButton [class]="cn(b.base, b.primary, b.size.md, 'rounded-r-none')" (click)="run('Save')">
                    Save
                </button>

                <ng-container #root="rdxMenuRoot" rdxMenuRoot>
                    <button
                        aria-label="More save options"
                        rdxMenuTrigger
                        [class]="
                            cn(b.base, b.primary, b.size.icon, 'border-primary-foreground/20 rounded-l-none border-l')
                        "
                    >
                        <svg lucideChevronDown size="16"></svg>
                    </button>

                    @if (root.open()) {
                        <div sideOffset="6" align="end" rdxMenuPositioner [class]="m.positioner">
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item" (click)="run('Save and duplicate')">
                                    Save and duplicate
                                </button>
                                <button rdxMenuItem [class]="m.item" (click)="run('Save as template')">
                                    Save as template
                                </button>
                                <div rdxMenuSeparator [class]="m.separator"></div>
                                <button rdxMenuItem [class]="m.item" (click)="run('Save and close')">
                                    Save and close
                                </button>
                            </div>
                        </div>
                    }
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
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;

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

Once the menu is open it follows the [Menu](?path=/docs/primitives-menu--docs) keyboard model —
`ArrowUp` / `ArrowDown` move between items, `Home` / `End` jump to the first / last item, typeahead
matches item text, and `Escape` closes the menu and returns focus to the trigger.
