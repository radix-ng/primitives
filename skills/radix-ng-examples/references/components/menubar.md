# Menubar

#### A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.

Menubar coordinates a row of [Menu](?path=/docs/primitives-menu--docs) primitives. Each top-level
menu is a `rdxMenuRoot` with a standard `rdxMenuTrigger`; the menubar manages which one is open and wires
up Base UI-style Composite focus, arrow-key navigation, and hover-to-switch behavior between them.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import { cn, demoMenu, demoMenubar } from '../../storybook/styles';

@Component({
    selector: 'rdx-menubar-default',
    imports: [RdxMenuModule, RdxMenubarRoot, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [class]="mb.root" rdxMenubarRoot>
            <!-- File -->
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>File</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            New Tab
                            <span [class]="mb.shortcut">⌘ T</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            New Window
                            <span [class]="mb.shortcut">⌘ N</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>New Incognito Window</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <!-- Share submenu -->
                        <ng-container #shareSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                Share
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (shareSub.open()) {
                                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="m.popup" rdxMenuPopup>
                                        <button [class]="m.item" rdxMenuItem>Email Link</button>
                                        <button [class]="m.item" rdxMenuItem>Messages</button>
                                        <button [class]="m.item" rdxMenuItem>Notes</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Print…
                            <span [class]="mb.shortcut">⌘ P</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- Edit -->
            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Edit</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            Undo
                            <span [class]="mb.shortcut">⌘ Z</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Redo
                            <span [class]="mb.shortcut">⇧ ⌘ Z</span>
                        </button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Cut
                            <span [class]="mb.shortcut">⌘ X</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Copy
                            <span [class]="mb.shortcut">⌘ C</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Paste
                            <span [class]="mb.shortcut">⌘ V</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- View -->
            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>View</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <label [(checked)]="showBookmarks" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Always Show Bookmarks Bar
                        </label>
                        <label [(checked)]="showFullUrls" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Always Show Full URLs
                        </label>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Reload
                            <span [class]="mb.shortcut">⌘ R</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>
                            Force Reload
                            <span [class]="mb.shortcut">⇧ ⌘ R</span>
                        </button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Toggle Fullscreen</button>
                    </div>
                </div>
            </ng-container>

            <!-- Profiles -->
            <ng-container #profilesMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Profiles</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <div [(value)]="activeProfile" rdxMenuRadioGroup>
                            <label [class]="m.selectableItem" value="andy" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Andy
                            </label>
                            <label [class]="m.selectableItem" value="luis" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Luis
                            </label>
                        </div>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="cn(m.item, 'pl-8')" rdxMenuItem>Edit…</button>
                        <button [class]="cn(m.item, 'pl-8')" rdxMenuItem>Add Profile…</button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxMenubarDefaultComponent {
    protected readonly cn = cn;
    protected readonly mb = demoMenubar;
    protected readonly m = demoMenu;

    showBookmarks = signal(true);
    showFullUrls = signal(false);
    activeProfile = signal<string | undefined>('andy');
}
```

## Features

- ✅ Horizontal row of menus with a single open menu at a time.
- ✅ Open a menu by click or keyboard; once one is open, hovering a sibling trigger switches to it.
- ✅ ArrowLeft / ArrowRight move between triggers; ArrowDown / ArrowUp open the focused menu.
- ✅ Each menu reuses the full Menu primitive — items, checkbox/radio, submenus, separators.
- ✅ Escape closes the open menu and returns focus to its trigger.
- ✅ Headless — state is exposed via `data-state` and menu item state attributes; styling is up to the consumer.

## Import

```typescript
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
```

Or import the menubar parts through the module:

```typescript
import { RdxMenubarModule } from '@radix-ng/primitives/menubar';
```

## Anatomy

The menubar is a `rdxMenubarRoot` containing one `ng-container rdxMenuRoot` per menu. Inside each,
a standard `rdxMenuTrigger` opens a Menu popup. Keep the top-level popup mounted and hide it with
`data-closed` styles.

```html
<div rdxMenubarRoot>
  <!-- File -->
  <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
    <button rdxMenuTrigger>File</button>

    <div class="data-[closed]:hidden" align="start" sideOffset="4" rdxMenuPositioner>
      <div rdxMenuPopup>
        <button rdxMenuItem>New Tab</button>
        <div rdxMenuSeparator></div>

        <!-- submenu -->
        <ng-container #shareSub="rdxMenuRoot" rdxMenuRoot>
          <button rdxMenuSubTrigger>Share ›</button>
          @if (shareSub.open()) {
          <div side="right" align="start" rdxMenuPositioner>
            <div rdxMenuPopup>
              <button rdxMenuItem>Email Link</button>
            </div>
          </div>
          }
        </ng-container>

        <button rdxMenuItem>Print…</button>
      </div>
    </div>
  </ng-container>

  <!-- Edit -->
  <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
    <button rdxMenuTrigger>Edit</button>

    <div class="data-[closed]:hidden" align="start" sideOffset="4" rdxMenuPositioner>
      <div rdxMenuPopup>
        <button rdxMenuItem>Undo</button>
        <button rdxMenuItem>Redo</button>
      </div>
    </div>
  </ng-container>
</div>
```

## Examples

### Default

A four-menu bar (File, Edit, View, Profiles) with a submenu, checkbox items, and a radio group.
Click a trigger to open it, then hover the other triggers to switch, or use the arrow keys.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import { cn, demoMenu, demoMenubar } from '../../storybook/styles';

@Component({
    selector: 'rdx-menubar-default',
    imports: [RdxMenuModule, RdxMenubarRoot, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [class]="mb.root" rdxMenubarRoot>
            <!-- File -->
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>File</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            New Tab
                            <span [class]="mb.shortcut">⌘ T</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            New Window
                            <span [class]="mb.shortcut">⌘ N</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>New Incognito Window</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <!-- Share submenu -->
                        <ng-container #shareSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                Share
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (shareSub.open()) {
                                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="m.popup" rdxMenuPopup>
                                        <button [class]="m.item" rdxMenuItem>Email Link</button>
                                        <button [class]="m.item" rdxMenuItem>Messages</button>
                                        <button [class]="m.item" rdxMenuItem>Notes</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Print…
                            <span [class]="mb.shortcut">⌘ P</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- Edit -->
            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Edit</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>
                            Undo
                            <span [class]="mb.shortcut">⌘ Z</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Redo
                            <span [class]="mb.shortcut">⇧ ⌘ Z</span>
                        </button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Cut
                            <span [class]="mb.shortcut">⌘ X</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Copy
                            <span [class]="mb.shortcut">⌘ C</span>
                        </button>
                        <button [class]="m.item" rdxMenuItem>
                            Paste
                            <span [class]="mb.shortcut">⌘ V</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- View -->
            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>View</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <label [(checked)]="showBookmarks" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Always Show Bookmarks Bar
                        </label>
                        <label [(checked)]="showFullUrls" [class]="m.selectableItem" rdxMenuCheckboxItem>
                            <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                                <svg [size]="12" lucideCheck></svg>
                            </span>
                            Always Show Full URLs
                        </label>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>
                            Reload
                            <span [class]="mb.shortcut">⌘ R</span>
                        </button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>
                            Force Reload
                            <span [class]="mb.shortcut">⇧ ⌘ R</span>
                        </button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Toggle Fullscreen</button>
                    </div>
                </div>
            </ng-container>

            <!-- Profiles -->
            <ng-container #profilesMenu="rdxMenuRoot" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Profiles</button>

                <div [class]="cn(m.positioner, 'data-[closed]:hidden')" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <div [(value)]="activeProfile" rdxMenuRadioGroup>
                            <label [class]="m.selectableItem" value="andy" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Andy
                            </label>
                            <label [class]="m.selectableItem" value="luis" rdxMenuRadioItem>
                                <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                    <svg [size]="10" strokeWidth="5" lucideDot></svg>
                                </span>
                                Luis
                            </label>
                        </div>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="cn(m.item, 'pl-8')" rdxMenuItem>Edit…</button>
                        <button [class]="cn(m.item, 'pl-8')" rdxMenuItem>Add Profile…</button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxMenubarDefaultComponent {
    protected readonly cn = cn;
    protected readonly mb = demoMenubar;
    protected readonly m = demoMenu;

    showBookmarks = signal(true);
    showFullUrls = signal(false);
    activeProfile = signal<string | undefined>('andy');
}
```

## Accessibility

### Keyboard Interactions

| Key               | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `ArrowDown`       | Opens the focused trigger's menu and moves focus to the first item. |
| `ArrowUp`         | Opens the focused trigger's menu and moves focus to the last item.  |
| `ArrowRight`      | Moves to the next trigger. Opens it if a menu was already open.     |
| `ArrowLeft`       | Moves to the previous trigger. Opens it if a menu was already open. |
| `Home`            | Moves to the first trigger.                                         |
| `End`             | Moves to the last trigger.                                          |
| `Escape`          | Closes the open menu and returns focus to its trigger.              |
| `Enter` / `Space` | Activates the focused item (handled by the Menu primitive).         |

Triggers move through the shared Composite focus model: only one trigger is in the tab order at a time, and
arrow keys move focus between them without leaving the menubar. Disabled triggers are skipped.

## API Reference

### RdxMenubarRoot

The horizontal container. Provides the coordination context consumed by each `rdxMenuTrigger`.
Exposes `data-orientation`, `data-has-submenu-open`, and `role="menubar"`.

### Menu Trigger

Use the standard `rdxMenuTrigger` inside each top-level `rdxMenuRoot`. When it is a direct child
menu of `rdxMenubarRoot`, the menubar wires it for Composite focus, hover switching, and ArrowLeft /
ArrowRight navigation. There is no separate menubar trigger directive — the menu trigger reports its
interactions to the menubar through context, mirroring [Base UI](https://base-ui.com/react/components/menubar).

During hover-switching the trigger keeps focus (the popup opens without grabbing it), so the bar
stays keyboard-navigable. It also reports `role="menuitem"`. The menubar's Composite root owns tabindex:
the current trigger uses `tabindex="0"` and the other triggers use `tabindex="-1"`, so Tab enters
the menubar on a trigger rather than focusing the container.

| Data attribute | Value                  |
| -------------- | ---------------------- |
| `[data-state]` | `"open"` or `"closed"` |

### Menu parts

All other parts — `rdxMenuPositioner`, `rdxMenuPopup`, `rdxMenuItem`, `rdxMenuCheckboxItem`,
`rdxMenuRadioGroup`, `rdxMenuSubTrigger`, `rdxMenuSeparator`, … — come from the
[Menu](?path=/docs/primitives-menu--docs) primitive and behave identically here.
