# Context Menu

#### A menu that appears at the pointer on right click (or touch long-press), built on the Menu primitive.

Context Menu reuses the full [Menu](?path=/docs/primitives-menu--docs) primitive for its popup,
items, submenus, checkbox/radio items, and separators. The only difference is the trigger: instead
of a button that anchors the popup to itself, `rdxContextMenuTrigger` opens the menu at the pointer
position on a right click or long-press.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                [class]="
                    cn(
                        'border-border text-muted-foreground flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed text-sm select-none',
                        'data-[state=open]:bg-muted data-[state=open]:border-solid'
                    )
                "
                rdxContextMenuTrigger
            >
                Right click here
            </div>

            @if (root.menuRoot.open()) {
                <div [class]="m.positioner" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            Back
                            <span [class]="shortcut">⌘ [</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>
                            Forward
                            <span [class]="shortcut">⌘ ]</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Reload
                            <span [class]="shortcut">⌘ R</span>
                        </button>

                        <!-- More Tools submenu -->
                        <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                More Tools
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (moreSub.open()) {
                                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="m.popup" rdxMenuPopup>
                                        <button [class]="m.item" rdxMenuItem>Save Page As…</button>
                                        <button [class]="m.item" rdxMenuItem>Create Shortcut…</button>
                                        <button [class]="m.item" rdxMenuItem>Name Window…</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <label [(checked)]="showBookmarks" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Show Bookmarks
                            <span [class]="shortcut">⌘ B</span>
                        </label>
                        <label [(checked)]="showFullUrls" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Show Full URLs
                        </label>

                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <div [class]="m.groupLabel" rdxMenuGroupLabel>People</div>
                        <div [(value)]="person" rdxMenuRadioGroup>
                            <label [class]="m.selectableItem" value="pedro" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Pedro Duarte
                            </label>
                            <label [class]="m.selectableItem" value="colm" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Colm Tuite
                            </label>
                        </div>
                    </div>
                </div>
            }
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
- ✅ Headless — state is exposed via `data-state`; styling is up to the consumer.

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

    @if (root.menuRoot.open()) {
        <div rdxMenuPositioner>
            <div rdxMenuPopup>
                <button rdxMenuItem>Back</button>
                <button rdxMenuItem>Reload</button>

                <div rdxMenuSeparator></div>

                <!-- submenu -->
                <ng-container #sub="rdxMenuRoot" rdxMenuRoot>
                    <button rdxMenuSubTrigger>More Tools ›</button>
                    @if (sub.open()) {
                        <div side="right" align="start" rdxMenuPositioner>
                            <div rdxMenuPopup>
                                <button rdxMenuItem>Save Page As…</button>
                            </div>
                        </div>
                    }
                </ng-container>
            </div>
        </div>
    }
</ng-container>
```

## Examples

### Default

A right-click area with shortcuts, a disabled item, a submenu, checkbox items, and a radio group.
Right-click the dashed area to open the menu at the pointer.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                [class]="
                    cn(
                        'border-border text-muted-foreground flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed text-sm select-none',
                        'data-[state=open]:bg-muted data-[state=open]:border-solid'
                    )
                "
                rdxContextMenuTrigger
            >
                Right click here
            </div>

            @if (root.menuRoot.open()) {
                <div [class]="m.positioner" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            Back
                            <span [class]="shortcut">⌘ [</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>
                            Forward
                            <span [class]="shortcut">⌘ ]</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Reload
                            <span [class]="shortcut">⌘ R</span>
                        </button>

                        <!-- More Tools submenu -->
                        <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                More Tools
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (moreSub.open()) {
                                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="m.popup" rdxMenuPopup>
                                        <button [class]="m.item" rdxMenuItem>Save Page As…</button>
                                        <button [class]="m.item" rdxMenuItem>Create Shortcut…</button>
                                        <button [class]="m.item" rdxMenuItem>Name Window…</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <label [(checked)]="showBookmarks" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Show Bookmarks
                            <span [class]="shortcut">⌘ B</span>
                        </label>
                        <label [(checked)]="showFullUrls" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Show Full URLs
                        </label>

                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <div [class]="m.groupLabel" rdxMenuGroupLabel>People</div>
                        <div [(value)]="person" rdxMenuRadioGroup>
                            <label [class]="m.selectableItem" value="pedro" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Pedro Duarte
                            </label>
                            <label [class]="m.selectableItem" value="colm" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Colm Tuite
                            </label>
                        </div>
                    </div>
                </div>
            }
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

## Keyboard interactions

When opened with a pointer (right click / long-press) the popup itself receives focus and no item
is highlighted; pressing ArrowDown / ArrowUp then moves into the items. When opened from the
keyboard (the Menu key / <kbd>Shift</kbd> + <kbd>F10</kbd>) the first item is highlighted right
away. Otherwise the popup behaves exactly like a [Menu](?path=/docs/primitives-menu--docs):
ArrowDown / ArrowUp move between items, Home / End jump to the first / last item, typeahead matches
item text, and Escape closes the menu.

## API Reference

### RdxContextMenuRoot

Groups all parts of the context menu and provides the Menu context consumed by the popup. Composes
the Menu primitive, so it forwards the `open` (two-way), `modal`, `loopFocus`, and
`highlightItemOnHover` inputs and the `onOpenChange` / `onOpenChangeComplete` outputs from
`rdxMenuRoot`.

### RdxContextMenuTrigger

The area that opens the menu on right click or touch long-press. Exposes `data-state`
(`"open"` / `"closed"`) and `data-disabled`.

### Menu parts

All other parts — `rdxMenuPositioner`, `rdxMenuPopup`, `rdxMenuItem`, `rdxMenuCheckboxItem`,
`rdxMenuRadioGroup`, `rdxMenuSubTrigger`, `rdxMenuSeparator`, … — come from the
[Menu](?path=/docs/primitives-menu--docs) primitive and behave identically here.
