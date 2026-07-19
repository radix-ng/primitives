# Menu

A headless dropdown menu anchored to a trigger button.

> Index — full source of each example is one click away in `../examples/menu--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Opens and closes from a trigger button with click or arrow-key interaction.
- ✅ Supports uncontrolled state, `defaultOpen`, and two-way binding with `[(open)]`.
- ✅ `onOpenChange` reports the new `open` state together with `reason`, `trigger`, and source `event`.
- ✅ Positions the popup with the shared Floating UI-based Popper primitive.
- ✅ Optional visual arrow connecting the popup to its trigger (`rdxMenuArrow`).
- ✅ Optional backdrop overlay behind the popup (`rdxMenuBackdrop`).
- ✅ Closes on Escape (restoring focus to the trigger), outside pointer interaction, and Tab.
- ✅ Full keyboard navigation: ArrowDown, ArrowUp, Home, End, and character typeahead.
- ✅ Focus loop at list boundaries, configurable with `loopFocus`.
- ✅ Includes disabled items in keyboard navigation while preventing activation.
- ✅ `closeOnClick` per item — defaults to `true` for regular items, `false` for checkbox, radio, and link items.
- ✅ Checkbox items toggle state independently; radio groups enforce single selection.
- ✅ Grouped items with optional group labels and visual separators.
- ✅ Nested submenus via `rdxMenuSubTrigger` — opens on hover (100 ms delay) with safe-polygon traversal, click, or ArrowRight; closes on ArrowLeft.
- ✅ CSS transition lifecycle via `data-starting-style` / `data-ending-style` and `(onOpenChangeComplete)`.
- ✅ All collision, side, and alignment metadata exposed via `data-side` / `data-align`.
- ✅ `data-highlighted` on the focused item and `data-disabled` on disabled items.

## Import

```typescript
import {
    RdxMenuArrow,
    RdxMenuBackdrop,
    RdxMenuCheckboxItem,
    RdxMenuCheckboxItemIndicator,
    RdxMenuGroup,
    RdxMenuGroupLabel,
    RdxMenuItem,
    RdxMenuLinkItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRadioGroup,
    RdxMenuRadioItem,
    RdxMenuRadioItemIndicator,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    RdxMenuViewport
} from '@radix-ng/primitives/menu';
```

Or import all parts through the module:

```typescript
import { RdxMenuModule } from '@radix-ng/primitives/menu';
```

## Anatomy

Apply the directives to your own markup. `rdxMenuPortal` is a **structural** directive: it teleports
the popup into `document.body` while the menu is open and keeps it mounted until the closed-state exit
keyframes finish. Use `*rdxMenuPortal` on the positioner for the common single-root case, or the
explicit `<ng-template rdxMenuPortal>` form (shown below) when an optional `rdxMenuBackdrop` makes the
content multi-root.

```html
<ng-container #root="rdxMenuRoot" rdxMenuRoot>
    <button rdxMenuTrigger>Open</button>

    <ng-template rdxMenuPortal>
        <!-- optional backdrop — a sibling root, before the positioner -->
        <div rdxMenuBackdrop></div>

        <div sideOffset="4" rdxMenuPositioner>
            <div rdxMenuPopup>
                <span rdxMenuArrow></span>

                <!-- regular item -->
                <button rdxMenuItem>New Tab</button>

                <!-- link item — does not close by default -->
                <a rdxMenuLinkItem href="/settings">Settings</a>

                <div rdxMenuSeparator></div>

                <!-- checkbox item — does not close the menu -->
                <label rdxMenuCheckboxItem>
                    <span rdxMenuCheckboxItemIndicator></span>
                    Show Bookmarks
                </label>

                <!-- radio group — items do not close the menu by default -->
                <div rdxMenuRadioGroup>
                    <label value="grid" rdxMenuRadioItem>
                        <span rdxMenuRadioItemIndicator></span>
                        Grid View
                    </label>
                    <label value="list" rdxMenuRadioItem>
                        <span rdxMenuRadioItemIndicator></span>
                        List View
                    </label>
                </div>

                <div rdxMenuSeparator></div>

                <!-- group with a label -->
                <div rdxMenuGroup>
                    <span rdxMenuGroupLabel>Section</span>
                    <button rdxMenuItem>Item</button>
                </div>

                <div rdxMenuSeparator></div>

                <!-- submenu: wrap trigger + popup in a nested rdxMenuRoot -->
                <ng-container #sub="rdxMenuRoot" rdxMenuRoot>
                    <button rdxMenuSubTrigger>More options ›</button>

                    <div *rdxMenuPortal side="right" align="start" sideOffset="4" rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>Sub item A</button>
                            <button rdxMenuItem>Sub item B</button>
                        </div>
                    </div>
                </ng-container>
            </div>
        </div>
    </ng-template>
</ng-container>
```

## Examples

- [Default](../examples/menu--default.md)
- [Radio items](../examples/menu--radio-items.md)
- [Checkbox items](../examples/menu--checkbox-items.md)
- [With labels](../examples/menu--with-labels.md)
- [Nested submenus](../examples/menu--nested-submenus.md)
- [Arrow](../examples/menu--arrow.md)
- [Backdrop](../examples/menu--backdrop.md)
- [Viewport (animated resize)](../examples/menu--viewport-animated-resize.md)
- [Keep mounted](../examples/menu--keep-mounted.md)
- [Custom return focus (`finalFocus`)](../examples/menu--custom-return-focus-finalfocus.md)
- [CSS animations](../examples/menu--css-animations.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/menu.json`
- Styling (parts + `data-*`): `references/styling-contract/menu.json`
