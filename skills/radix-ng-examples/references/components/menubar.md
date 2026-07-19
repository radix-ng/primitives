# Menubar

A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.

> Index — full source of each example is one click away in `../examples/menubar--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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

- [Default](../examples/menubar--default.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/menubar.json`
- Styling (parts + `data-*`): `references/styling-contract/menubar.json`
