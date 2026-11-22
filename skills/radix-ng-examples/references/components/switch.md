# Switch

A control that allows the user to toggle between checked and not checked.

> Index — full source of each example is one click away in `../examples/switch--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Full keyboard navigation.
- ✅ Supports disabled, read-only and required states.
- ✅ Native form submission, constraint validation, and reset.

## Import

```typescript
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';
```

The API follows [Base UI Switch](https://base-ui.com/react/components/switch) with a `Root` and
`Thumb` on consumer-provided elements.

## Anatomy

```html
<button id="alerts" rdxSwitchRoot name="alerts" [(checked)]="checked">
    <span rdxSwitchThumb></span>
</button>
<label for="alerts">Alerts</label>
```

The root creates a native checkbox beside the button after browser rendering. The input supplies
native `required` validation and bubbling `input` and `change` events. Set `name` for form submission,
`form` for an explicit form owner, and `uncheckedValue` to submit a value in the off state.

## Examples

- [Preselection](../examples/switch--preselection.md)
- [Disabled](../examples/switch--disabled.md)
- [Read-only](../examples/switch--read-only.md)
- [Reactive Forms](../examples/switch--reactive-forms.md)
- [Field](../examples/switch--field.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/switch.json`
- Styling (parts + `data-*`): `references/styling-contract/switch.json`
