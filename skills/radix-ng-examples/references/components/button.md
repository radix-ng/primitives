# Button

A button, or any element that should behave like one.

> Index — full source of each example is one click away in `../examples/button--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Works on a native `<button>` or any other element (`<a>`, `<span>`, …).
- ✅ Exposes state via the `data-disabled` attribute for styling.
- ✅ `focusableWhenDisabled` keeps the control in the tab order (uses `aria-disabled`).
- ✅ Adds button semantics and keyboard activation to non-button hosts.

## Import

```typescript
import { RdxButtonDirective } from '@radix-ng/primitives/button';
```

## Anatomy

Button is a single directive — apply `rdxButton` to a native `<button>` or to any element you want
to behave like a button.

```html
<button rdxButton>...</button>

<!-- or on any other host -->
<a rdxButton href="...">...</a>
```

Standalone Button activates Space on keyup. With `rdxCompositeItem` or `rdxToolbarButton`, it uses
the item's roving tabindex and activates Space on keydown. Toolbar group/root disabled state is
inherited when both `rdxToolbarButton` and `rdxButton` are applied to the same element.

Consumer `keydown` / `keyup` handlers run before Button's keyboard behavior. Preventing Enter
keydown or standalone Space keyup cancels activation; composite Space follows its keydown policy.

Explicit `role` and `tabindex` override the defaults, including disabled and roving tab order.
For dynamic values, bind `[role]` and `[tabIndex]`: `null` removes the attribute and `undefined`
restores the default. An explicit tab index makes the application responsible for the tab order.

## Examples

- [Variants](../examples/button--variants.md)
- [Sizes](../examples/button--sizes.md)
- [Disabled](../examples/button--disabled.md)
- [As link](../examples/button--as-link.md)
- [Loading](../examples/button--loading.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/button.json`
- Styling (parts + `data-*`): `references/styling-contract/button.json`
