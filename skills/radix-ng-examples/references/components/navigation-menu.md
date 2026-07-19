# Navigation Menu

A collection of links and menus for website navigation.

> Index — full source of each example is one click away in `../examples/navigation-menu--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ A single shared popup, anchored to the active trigger with the Floating UI-based Popper primitive.
- ✅ Content morphs between items, exposing `data-activation-direction` and a `data-previous` snapshot for slide animations.
- ✅ Opens on hover with configurable `delay` / `closeDelay`, and a polygon grace area that keeps the popup reachable.
- ✅ `value` / `defaultValue` model with `onValueChange`, `onOpenChange`, and `onOpenChangeComplete` outputs.
- ✅ Keyboard navigation between triggers and top-level links (arrow keys) via the shared Composite primitive.
- ✅ Enter / Space / entry arrow keys open a trigger and move focus into its content; arrows / Home / End navigate the open panel.
- ✅ Horizontal and vertical orientations and LTR / RTL layouts.
- ✅ Nested navigation menus; selecting a nested link also closes the parent menu.
- ✅ Closes on Escape and outside pointer interaction, restoring focus to the trigger.
- ✅ Keeps the popup mounted while CSS exit keyframes finish, with opt-in persistent mounting through `keepMounted` / `forceMount`.
- ✅ Exposes state, transition, placement, and size attributes and CSS variables for styling.

## Import

```typescript
import {
    RdxNavigationMenuArrow,
    RdxNavigationMenuBackdrop,
    RdxNavigationMenuContent,
    RdxNavigationMenuIcon,
    RdxNavigationMenuItem,
    RdxNavigationMenuLink,
    RdxNavigationMenuList,
    RdxNavigationMenuPopup,
    RdxNavigationMenuPortal,
    RdxNavigationMenuPositioner,
    RdxNavigationMenuRoot,
    RdxNavigationMenuTrigger,
    RdxNavigationMenuViewport
} from '@radix-ng/primitives/navigation-menu';
```

Or import all parts through the module:

```typescript
import { RdxNavigationMenuModule } from '@radix-ng/primitives/navigation-menu';
```

## Anatomy

Apply the parts to your own markup. Each item's `*rdxNavigationMenuContent` template is rendered into
the shared `rdxNavigationMenuViewport`. `rdxNavigationMenuPortal` is a **structural** directive: it
teleports the popup into `document.body` while the menu is open and keeps it mounted until the
closed-state exit keyframes finish. Add `[keepMounted]="true"` when the portal should stay in the DOM
even while closed. Use `*rdxNavigationMenuPortal` on the positioner for the common single-root case,
or the explicit `<ng-template rdxNavigationMenuPortal>` form shown below when an optional
`rdxNavigationMenuBackdrop` makes the content multi-root.

```html
<nav rdxNavigationMenuRoot>
    <ul rdxNavigationMenuList>
        <li rdxNavigationMenuItem value="products">
            <button rdxNavigationMenuTrigger>
                Products
                <svg rdxNavigationMenuIcon></svg>
            </button>

            <ng-container *rdxNavigationMenuContent>
                <a rdxNavigationMenuLink href="#">Analytics</a>
            </ng-container>
        </li>

        <li rdxNavigationMenuItem>
            <a rdxNavigationMenuLink href="#">Pricing</a>
        </li>
    </ul>

    <ng-template rdxNavigationMenuPortal>
        <div rdxNavigationMenuBackdrop></div>
        <div sideOffset="8" rdxNavigationMenuPositioner>
            <div rdxNavigationMenuPopup>
                <svg rdxNavigationMenuArrow></svg>
                <div rdxNavigationMenuViewport></div>
            </div>
        </div>
    </ng-template>
</nav>
```

## Examples

- [Default](../examples/navigation-menu--default.md)
- [Vertical](../examples/navigation-menu--vertical.md)
- [Right to left](../examples/navigation-menu--right-to-left.md)
- [Links only](../examples/navigation-menu--links-only.md)
- [Custom links](../examples/navigation-menu--custom-links.md)
- [Large menus](../examples/navigation-menu--large-menus.md)
- [Nested submenus](../examples/navigation-menu--nested-submenus.md)
- [Nested inline submenus](../examples/navigation-menu--nested-inline-submenus.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/navigation-menu.json`
- Styling (parts + `data-*`): `references/styling-contract/navigation-menu.json`
