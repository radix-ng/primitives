# Toolbar

A container for grouping a set of controls, such as buttons, toggle groups or menus.

> Index — full source of each example is one click away in `../examples/toolbar--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Full keyboard navigation with composite focus.
- ✅ Horizontal and vertical orientation.
- ✅ Disabling the toolbar or a group cascades to its items.
- ✅ Composes with Toggle Group, Menu, Tooltip, NumberField and more.

## Import

```typescript
import {
    RdxToolbarRoot,
    RdxToolbarButton,
    RdxToolbarLink,
    RdxToolbarInput,
    RdxToolbarGroup,
    RdxToolbarSeparator
} from '@radix-ng/primitives/toolbar';
```

The API follows [Base UI Toolbar](https://base-ui.com/react/components/toolbar): a `Root` owning
composite focus over `Button`, `Link`, `Input`, `Group` and `Separator` parts.

## Anatomy

```html
<div rdxToolbarRoot>
    <div rdxToolbarGroup>
        <button rdxToolbarButton></button>
        <button rdxToolbarButton></button>
    </div>
    <div rdxToolbarSeparator></div>
    <input rdxToolbarInput />
    <a rdxToolbarLink></a>
</div>
```

Stack a toolbar part on another primitive's trigger/input to compose it — e.g.
`<button rdxToolbarButton rdxMenuTrigger>` or `<input rdxToolbarInput rdxNumberFieldInput>`.
Use `rdxToggleGroupWithoutFocus` for toggle groups inside a toolbar so the toggles share the toolbar's
composite focus. Disabled state from `rdxToolbarRoot` or `rdxToolbarGroup` cascades into those toggle
groups and their items.

## Examples

- [Vertical](../examples/toolbar--vertical.md)
- [Disabled](../examples/toolbar--disabled.md)
- [Using with Menu](../examples/toolbar--using-with-menu.md)
- [Using with Tooltip](../examples/toolbar--using-with-tooltip.md)
- [Using with NumberField](../examples/toolbar--using-with-numberfield.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/toolbar.json`
- Styling (parts + `data-*`): `references/styling-contract/toolbar.json`
