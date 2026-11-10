# Menubar

A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.

> Index — full source of each example is one click away in `../examples/menubar--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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

The structure follows Base UI's Menubar example. Each Menu Root owns a trigger and a Portal;
Positioner and Popup live inside that Portal. Submenus use the same structure inside their parent's
Popup. Angular's `ng-container` provides Root ownership, and `ng-template rdxMenuPortal` manages
mounting, exits and optional retention.

```html
<div rdxMenubarRoot>
  <ng-container rdxMenuRoot>
    <button rdxMenuTrigger>File</button>
    <ng-template rdxMenuPortal>
      <div align="start" sideOffset="4" rdxMenuPositioner>
        <div rdxMenuPopup>
          <div rdxMenuItem>New</div>
          <div rdxMenuItem>Open</div>
          <div rdxMenuItem>Save</div>
          <ng-container rdxMenuRoot>
            <div rdxMenuSubTrigger>Export</div>
            <ng-template rdxMenuPortal>
              <div side="inline-end" align="start" sideOffset="-4" alignOffset="-4" rdxMenuPositioner>
                <div rdxMenuPopup>
                  <div rdxMenuItem>PDF</div>
                  <div rdxMenuItem>PNG</div>
                  <div rdxMenuItem>SVG</div>
                </div>
              </div>
            </ng-template>
          </ng-container>
          <div rdxMenuSeparator></div>
          <div rdxMenuItem>Print</div>
        </div>
      </div>
    </ng-template>
  </ng-container>
  <ng-container rdxMenuRoot>
    <button rdxMenuTrigger>Edit</button>
    <ng-template rdxMenuPortal>
      <div align="start" sideOffset="4" rdxMenuPositioner>
        <div rdxMenuPopup>
          <div rdxMenuItem>Cut</div>
          <div rdxMenuItem>Copy</div>
          <div rdxMenuItem>Paste</div>
        </div>
      </div>
    </ng-template>
  </ng-container>
</div>
```

## Examples

- [Default](../examples/menubar--default.md)
- [Vertical](../examples/menubar--vertical.md)
- [Keep mounted](../examples/menubar--keep-mounted.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/menubar.json`
- Styling (parts + `data-*`): `references/styling-contract/menubar.json`
