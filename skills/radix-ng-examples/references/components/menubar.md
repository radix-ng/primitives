# Menubar

#### A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.

Menubar coordinates a row of [Menu](?path=/docs/primitives-menu--docs) primitives. Each top-level
menu is a `rdxMenuRoot` with a standard `rdxMenuTrigger`; the menubar manages which one is open and wires
up Base UI-style Composite focus, arrow-key navigation, and hover-to-switch behavior between them.

```typescript
import { cn, demoMenu, demoMenubar } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';

@Component({
    selector: 'rdx-menubar-default',
    imports: [RdxMenuModule, RdxMenubarRoot, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div rdxMenubarRoot [class]="mb.root">
            <!-- File -->
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">File</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">
                            New Tab
                            <span [class]="mb.shortcut">⌘ T</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            New Window
                            <span [class]="mb.shortcut">⌘ N</span>
                        </button>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">New Incognito Window</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>

                        <!-- Share submenu -->
                        <ng-container #shareSub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                                Share
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (shareSub.open()) {
                                <div side="right" align="start" sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                                    <div rdxMenuPopup [class]="m.popup">
                                        <button rdxMenuItem [class]="m.item">Email Link</button>
                                        <button rdxMenuItem [class]="m.item">Messages</button>
                                        <button rdxMenuItem [class]="m.item">Notes</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Print…
                            <span [class]="mb.shortcut">⌘ P</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- Edit -->
            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">Edit</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">
                            Undo
                            <span [class]="mb.shortcut">⌘ Z</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Redo
                            <span [class]="mb.shortcut">⇧ ⌘ Z</span>
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Cut
                            <span [class]="mb.shortcut">⌘ X</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Copy
                            <span [class]="mb.shortcut">⌘ C</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Paste
                            <span [class]="mb.shortcut">⌘ V</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- View -->
            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">View</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showBookmarks">
                            <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                                <svg lucideCheck [size]="12"></svg>
                            </span>
                            Always Show Bookmarks Bar
                        </label>
                        <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showFullUrls">
                            <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                                <svg lucideCheck [size]="12"></svg>
                            </span>
                            Always Show Full URLs
                        </label>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Reload
                            <span [class]="mb.shortcut">⌘ R</span>
                        </button>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">
                            Force Reload
                            <span [class]="mb.shortcut">⇧ ⌘ R</span>
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Toggle Fullscreen</button>
                    </div>
                </div>
            </ng-container>

            <!-- Profiles -->
            <ng-container #profilesMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">Profiles</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <div rdxMenuRadioGroup [(value)]="activeProfile">
                            <label value="andy" rdxMenuRadioItem [class]="m.selectableItem">
                                <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                    <svg strokeWidth="5" lucideDot [size]="10"></svg>
                                </span>
                                Andy
                            </label>
                            <label value="luis" rdxMenuRadioItem [class]="m.selectableItem">
                                <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                    <svg strokeWidth="5" lucideDot [size]="10"></svg>
                                </span>
                                Luis
                            </label>
                        </div>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="cn(m.item, 'pl-8')">Edit…</button>
                        <button rdxMenuItem [class]="cn(m.item, 'pl-8')">Add Profile…</button>
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
- ✅ Headless — state is exposed via `data-popup-open` and menu item state attributes; styling is up to the consumer.

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
import { cn, demoMenu, demoMenubar } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';

@Component({
    selector: 'rdx-menubar-default',
    imports: [RdxMenuModule, RdxMenubarRoot, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div rdxMenubarRoot [class]="mb.root">
            <!-- File -->
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">File</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">
                            New Tab
                            <span [class]="mb.shortcut">⌘ T</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            New Window
                            <span [class]="mb.shortcut">⌘ N</span>
                        </button>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">New Incognito Window</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>

                        <!-- Share submenu -->
                        <ng-container #shareSub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                                Share
                                <span class="text-muted-foreground text-xs">›</span>
                            </button>
                            @if (shareSub.open()) {
                                <div side="right" align="start" sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                                    <div rdxMenuPopup [class]="m.popup">
                                        <button rdxMenuItem [class]="m.item">Email Link</button>
                                        <button rdxMenuItem [class]="m.item">Messages</button>
                                        <button rdxMenuItem [class]="m.item">Notes</button>
                                    </div>
                                </div>
                            }
                        </ng-container>

                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Print…
                            <span [class]="mb.shortcut">⌘ P</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- Edit -->
            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">Edit</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">
                            Undo
                            <span [class]="mb.shortcut">⌘ Z</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Redo
                            <span [class]="mb.shortcut">⇧ ⌘ Z</span>
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Cut
                            <span [class]="mb.shortcut">⌘ X</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Copy
                            <span [class]="mb.shortcut">⌘ C</span>
                        </button>
                        <button rdxMenuItem [class]="m.item">
                            Paste
                            <span [class]="mb.shortcut">⌘ V</span>
                        </button>
                    </div>
                </div>
            </ng-container>

            <!-- View -->
            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">View</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showBookmarks">
                            <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                                <svg lucideCheck [size]="12"></svg>
                            </span>
                            Always Show Bookmarks Bar
                        </label>
                        <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showFullUrls">
                            <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                                <svg lucideCheck [size]="12"></svg>
                            </span>
                            Always Show Full URLs
                        </label>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">
                            Reload
                            <span [class]="mb.shortcut">⌘ R</span>
                        </button>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">
                            Force Reload
                            <span [class]="mb.shortcut">⇧ ⌘ R</span>
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Toggle Fullscreen</button>
                    </div>
                </div>
            </ng-container>

            <!-- Profiles -->
            <ng-container #profilesMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger [class]="mb.trigger">Profiles</button>

                <div align="start" sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'data-[closed]:hidden')">
                    <div rdxMenuPopup [class]="m.popup">
                        <div rdxMenuRadioGroup [(value)]="activeProfile">
                            <label value="andy" rdxMenuRadioItem [class]="m.selectableItem">
                                <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                    <svg strokeWidth="5" lucideDot [size]="10"></svg>
                                </span>
                                Andy
                            </label>
                            <label value="luis" rdxMenuRadioItem [class]="m.selectableItem">
                                <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                    <svg strokeWidth="5" lucideDot [size]="10"></svg>
                                </span>
                                Luis
                            </label>
                        </div>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="cn(m.item, 'pl-8')">Edit…</button>
                        <button rdxMenuItem [class]="cn(m.item, 'pl-8')">Add Profile…</button>
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

| Data attribute      | Present when                  |
| ------------------- | ----------------------------- |
| `[data-popup-open]` | This trigger's menu is open.  |
| `[data-pressed]`    | The trigger is pressed.       |
| `[data-disabled]`   | The trigger is disabled.      |

The menubar root exposes `data-orientation`, `data-modal` (when modal), and `data-has-submenu-open`
(present only while a nested submenu is open).

### Menu parts

All other parts — `rdxMenuPositioner`, `rdxMenuPopup`, `rdxMenuItem`, `rdxMenuCheckboxItem`,
`rdxMenuRadioGroup`, `rdxMenuSubTrigger`, `rdxMenuSeparator`, … — come from the
[Menu](?path=/docs/primitives-menu--docs) primitive and behave identically here.
