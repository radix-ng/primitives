# Toggle

A two-state button that can be either on or off.

> Index — full source of each example is one click away in `../examples/toggle--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Full keyboard navigation.
- ✅ Works standalone or as an item of a Toggle Group.

## Import

```typescript
import { RdxToggle } from '@radix-ng/primitives/toggle';
```

The API follows [Base UI Toggle](https://base-ui.com/react/components/toggle): a single `Toggle`
part used either on its own or inside a `[rdxToggleGroup]`.

## Anatomy

```html
<button rdxToggle aria-label="Toggle italic">
    <icon />
</button>
```

When placed inside a `[rdxToggleGroup]`, give each toggle a stable `value` — its pressed state is then
derived from the group's value and it joins the group's composite focus. In dev mode, a grouped toggle
without `value` emits a warning because it cannot participate in group value changes.

## Examples

- [Pressed by default](../examples/toggle--pressed-by-default.md)
- [Controlled](../examples/toggle--controlled.md)
- [Disabled](../examples/toggle--disabled.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/toggle.json`
- Styling (parts + `data-*`): `references/styling-contract/toggle.json`
