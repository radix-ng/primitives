# Context Menu

#### A menu that appears at the pointer on right click (or touch long-press), built on the Menu primitive.

Context Menu reuses the full [Menu](?path=/docs/primitives-menu--docs) primitive for its popup,
items, submenus, checkbox/radio items, and separators. The only difference is the trigger: instead
of a button that anchors the popup to itself, `rdxContextMenuTrigger` opens the menu at the pointer
position on a right click or long-press.

```typescript
import { cn, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                rdxContextMenuTrigger
                [class]="
                    cn(
                        'border-border text-muted-foreground flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed text-sm select-none',
                        'data-[popup-open]:bg-muted data-[popup-open]:border-solid'
                    )
                "
            >
                Right click here
            </div>

            <div *rdxMenuPortal rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">
                        Back
                        <span [class]="shortcut">⌘ [</span>
                    </button>
                    <button rdxMenuItem [class]="m.item" [disabled]="true">
                        Forward
                        <span [class]="shortcut">⌘ ]</span>
                    </button>
                    <button rdxMenuItem [class]="m.item">
                        Reload
                        <span [class]="shortcut">⌘ R</span>
                    </button>

                    <!-- More Tools submenu -->
                    <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                            More Tools
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>
                        <div
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                            [class]="m.positioner"
                        >
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item">Save Page As…</button>
                                <button rdxMenuItem [class]="m.item">Create Shortcut…</button>
                                <button rdxMenuItem [class]="m.item">Name Window…</button>
                            </div>
                        </div>
                    </ng-container>

                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showBookmarks">
                        <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                            <svg lucideCheck [size]="12"></svg>
                        </span>
                        Show Bookmarks
                        <span [class]="shortcut">⌘ B</span>
                    </label>
                    <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showFullUrls">
                        <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                            <svg lucideCheck [size]="12"></svg>
                        </span>
                        Show Full URLs
                    </label>

                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <div rdxMenuRadioGroup [(value)]="person">
                        <div rdxMenuGroupLabel [class]="m.groupLabel">People</div>
                        <label value="pedro" rdxMenuRadioItem [class]="m.selectableItem">
                            <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                <svg strokeWidth="5" lucideDot [size]="10"></svg>
                            </span>
                            Pedro Duarte
                        </label>
                        <label value="colm" rdxMenuRadioItem [class]="m.selectableItem">
                            <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                <svg strokeWidth="5" lucideDot [size]="10"></svg>
                            </span>
                            Colm Tuite
                        </label>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxContextMenuDefaultComponent {
    protected readonly cn = cn;
    protected readonly m = demoMenu;
    protected readonly shortcut = 'ml-auto pl-4 text-xs text-muted-foreground';

    showBookmarks = signal(true);
    showFullUrls = signal(false);
    person = signal<string | undefined>('pedro');
}
```

## Features

- ✅ Opens at the pointer on right click; on touch, opens after a long-press.
- ✅ Suppresses the native browser context menu.
- ✅ Reuses every Menu popup part — items, submenus, checkbox/radio items, groups, separators.
- ✅ Opened by pointer, the popup is focused with no item highlighted; opened by keyboard, the first item is highlighted.
- ✅ Full keyboard navigation once open (ArrowDown / ArrowUp / Home / End / typeahead).
- ✅ Closes on Escape, outside pointer interaction, and item selection — restoring focus.
- ✅ Headless — state is exposed via `data-popup-open` / `data-pressed`; styling is up to the consumer.

## Import

```typescript
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
```

Or import the context-menu parts through the module:

```typescript
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
```

## Anatomy

Wrap the trigger area and the Menu popup in a `rdxContextMenuRoot`. The popup is assembled from the
standard Menu parts and positioned at the pointer, so `rdxMenuPositioner` needs no `anchor`.

```html
<ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
  <div rdxContextMenuTrigger>Right click here</div>

  <div *rdxMenuPortal rdxMenuPositioner>
    <div rdxMenuPopup>
      <button rdxMenuItem>Back</button>
      <button rdxMenuItem>Reload</button>

      <div rdxMenuSeparator></div>

      <!-- submenu -->
      <ng-container #sub="rdxMenuRoot" rdxMenuRoot>
        <button rdxMenuSubTrigger>More Tools ›</button>
        <div *rdxMenuPortal side="right" align="start" rdxMenuPositioner>
          <div rdxMenuPopup>
            <button rdxMenuItem>Save Page As…</button>
          </div>
        </div>
      </ng-container>
    </div>
  </div>
</ng-container>
```

## Examples

### Default

A right-click area with shortcuts, a disabled item, a submenu, checkbox items, and a radio group.
Right-click the dashed area to open the menu at the pointer.

```typescript
import { cn, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                rdxContextMenuTrigger
                [class]="
                    cn(
                        'border-border text-muted-foreground flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed text-sm select-none',
                        'data-[popup-open]:bg-muted data-[popup-open]:border-solid'
                    )
                "
            >
                Right click here
            </div>

            <div *rdxMenuPortal rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">
                        Back
                        <span [class]="shortcut">⌘ [</span>
                    </button>
                    <button rdxMenuItem [class]="m.item" [disabled]="true">
                        Forward
                        <span [class]="shortcut">⌘ ]</span>
                    </button>
                    <button rdxMenuItem [class]="m.item">
                        Reload
                        <span [class]="shortcut">⌘ R</span>
                    </button>

                    <!-- More Tools submenu -->
                    <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                            More Tools
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>
                        <div
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                            [class]="m.positioner"
                        >
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item">Save Page As…</button>
                                <button rdxMenuItem [class]="m.item">Create Shortcut…</button>
                                <button rdxMenuItem [class]="m.item">Name Window…</button>
                            </div>
                        </div>
                    </ng-container>

                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showBookmarks">
                        <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                            <svg lucideCheck [size]="12"></svg>
                        </span>
                        Show Bookmarks
                        <span [class]="shortcut">⌘ B</span>
                    </label>
                    <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showFullUrls">
                        <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                            <svg lucideCheck [size]="12"></svg>
                        </span>
                        Show Full URLs
                    </label>

                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <div rdxMenuRadioGroup [(value)]="person">
                        <div rdxMenuGroupLabel [class]="m.groupLabel">People</div>
                        <label value="pedro" rdxMenuRadioItem [class]="m.selectableItem">
                            <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                <svg strokeWidth="5" lucideDot [size]="10"></svg>
                            </span>
                            Pedro Duarte
                        </label>
                        <label value="colm" rdxMenuRadioItem [class]="m.selectableItem">
                            <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                <svg strokeWidth="5" lucideDot [size]="10"></svg>
                            </span>
                            Colm Tuite
                        </label>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxContextMenuDefaultComponent {
    protected readonly cn = cn;
    protected readonly m = demoMenu;
    protected readonly shortcut = 'ml-auto pl-4 text-xs text-muted-foreground';

    showBookmarks = signal(true);
    showFullUrls = signal(false);
    person = signal<string | undefined>('pedro');
}
```

## Accessibility

### Keyboard Interactions

When opened with a pointer (right click / long-press) the popup itself receives focus and no item
is highlighted; pressing `ArrowDown` / `ArrowUp` then moves into the items. When opened from the
keyboard (the Menu key / `Shift` + `F10`) the first item is highlighted right
away. Otherwise the popup behaves exactly like a [Menu](?path=/docs/primitives-menu--docs):
`ArrowDown` / `ArrowUp` move between items, `Home` / `End` jump to the first / last item, typeahead matches
item text, and `Escape` closes the menu.

## API Reference

### RdxContextMenuRoot

Groups all parts of the context menu and provides the Menu context consumed by the popup. Composes
the Menu primitive, so it forwards the `open` (two-way), `modal`, `loopFocus`, and
`highlightItemOnHover` inputs and the `onOpenChange` / `onOpenChangeComplete` outputs from
`rdxMenuRoot`.

### RdxContextMenuTrigger

The area that opens the menu on right click or touch long-press.

**Data attributes**

| Attribute           | Present when                          |
| ------------------- | ------------------------------------- |
| `data-popup-open`   | The context menu is open.             |
| `data-pressed`      | The trigger is pressed.               |
| `data-disabled`     | The trigger is disabled.              |

### Menu parts

All other parts — `rdxMenuPositioner`, `rdxMenuPopup`, `rdxMenuItem`, `rdxMenuCheckboxItem`,
`rdxMenuRadioGroup`, `rdxMenuSubTrigger`, `rdxMenuSeparator`, … — come from the
[Menu](?path=/docs/primitives-menu--docs) primitive and behave identically here.
