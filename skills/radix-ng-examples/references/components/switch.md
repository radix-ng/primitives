# Switch

A control that allows the user to toggle between checked and not checked.

> Index — full source of each example is one click away in `../examples/switch--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Full keyboard navigation.
- ✅ Supports disabled, read-only and required states.
- ✅ Native form submission with an optional native input for constraint validation.

## Import

```typescript
import { RdxSwitchRoot, RdxSwitchThumb, RdxSwitchInput } from '@radix-ng/primitives/switch';
```

The API follows [Base UI Switch](https://base-ui.com/react/components/switch): a `Root` with a
`Thumb`, plus an optional hidden `Input` for native browser behavior.

## Anatomy

```html
<button rdxSwitchRoot [(checked)]="checked">
    <input rdxSwitchInput />
    <span rdxSwitchThumb></span>
</button>
```

A named root submits without `[rdxSwitchInput]`. Include the optional input when you also need native
constraint validation. Use `uncheckedValue` when the off state should submit a value; otherwise it is
omitted like a native unchecked checkbox.

## Examples

- [Preselection](../examples/switch--preselection.md)
- [Disabled](../examples/switch--disabled.md)
- [Read-only](../examples/switch--read-only.md)
- [Reactive Forms](../examples/switch--reactive-forms.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/switch.json`
- Styling (parts + `data-*`): `references/styling-contract/switch.json`
