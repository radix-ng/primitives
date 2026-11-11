# Context Menu

A menu that appears at the pointer on right click (or touch long-press), built on the Menu primitive.

> Index — full source of each example is one click away in `../examples/context-menu--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Opens at the pointer on right click; on touch, opens after a long-press.
- ✅ Suppresses the native browser context menu.
- ✅ Reuses every Menu popup part — items, submenus, checkbox/radio items, groups, separators.
- ✅ Native pointer and keyboard context-menu opening focus the popup without highlighting an item; arrow keys enter the list.
- ✅ Full keyboard navigation once open (ArrowDown / ArrowUp / Home / End / typeahead).
- ✅ Closes on Escape, outside pointer interaction, and item selection — restoring focus.
- ✅ Headless — state is exposed via `data-popup-open` / `data-pressed`; styling is up to the consumer.

Long-press waits 500 ms by default. Moving more than 10 px on either axis, native cancellation,
or a second finger cancels the pending request. Diagonal movement within 10 px per axis remains
eligible. A touch anchor is 10 × 10 px; pointer/keyboard context-menu events use a point anchor.

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

- [Default](../examples/context-menu--default.md)
- [Shared menu across areas](../examples/context-menu--shared-menu-across-areas.md)
- [Nested context areas](../examples/context-menu--nested-context-areas.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/context-menu.json`
- Styling (parts + `data-*`): `references/styling-contract/context-menu.json`
