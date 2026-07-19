# Toggle Group

A set of two-state buttons that can be toggled on or off.

> Index — full source of each example is one click away in `../examples/toggle-group--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Full keyboard navigation with composite focus.
- ✅ Supports horizontal and vertical orientation.
- ✅ Single or multiple pressed items.
- ✅ Can be controlled or uncontrolled.
- ✅ Native form serialization for named groups.

## Import

```typescript
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';
import { RdxToggle } from '@radix-ng/primitives/toggle';
```

The API follows [Base UI Toggle Group](https://base-ui.com/react/components/toggle-group): a
`ToggleGroup` whose children are plain `Toggle` items. The group `value` is always an array.

## Anatomy

```html
<div rdxToggleGroup [value]="['center']" aria-label="Text alignment">
    <button rdxToggle value="left"></button>
    <button rdxToggle value="center"></button>
    <button rdxToggle value="right"></button>
</div>
```

## Examples

- [Native forms](../examples/toggle-group--native-forms.md)
- [Multiple](../examples/toggle-group--multiple.md)
- [Disabled](../examples/toggle-group--disabled.md)
- [Two-way binding](../examples/toggle-group--two-way-binding.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/toggle-group.json`
- Styling (parts + `data-*`): `references/styling-contract/toggle-group.json`
