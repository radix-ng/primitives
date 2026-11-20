# Checkbox

A control that allows the user to toggle between checked and not checked.

> Index — full source of each example is one click away in `../examples/checkbox--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Full keyboard navigation.
- ✅ Supports indeterminate state.
- ✅ Can be controlled or uncontrolled.
- ✅ Native form submission with an optional native input for constraint validation.
- ✅ Base UI state hooks: `data-checked`, `data-unchecked`, and `data-indeterminate`.

## Import

```typescript
import {
  RdxCheckboxRootDirective,
  RdxCheckboxButtonDirective,
  RdxCheckboxIndicatorDirective,
  RdxCheckboxIndicatorPresenceDirective,
  RdxCheckboxInputDirective
} from '@radix-ng/primitives/checkbox';
```

## Anatomy

Assemble the root, button trigger, and indicator.

```html
<div rdxCheckboxRoot>
  <button rdxCheckboxButton>
    <svg *rdxCheckboxIndicatorPresence rdxCheckboxIndicator lucideCheck />
  </button>
</div>
```

The root generates a native checkbox after browser rendering. It supports `required`, bubbling
`input` and `change` events, and `FormData` when it has a name. Add an `<input rdxCheckboxInput />`
to control the input's placement or include it in server-rendered HTML. The authored input takes
over automatically.

## Examples

- [Default](../examples/checkbox--default.md)
- [Labeling](../examples/checkbox--labeling.md)
- [Change events](../examples/checkbox--change-events.md)
- [Indeterminate](../examples/checkbox--indeterminate.md)
- [Keep mounted](../examples/checkbox--keep-mounted.md)
- [Template-driven forms](../examples/checkbox--template-driven-forms.md)
- [Reactive forms](../examples/checkbox--reactive-forms.md)
- [Validation](../examples/checkbox--validation.md)
- [Select all](../examples/checkbox--select-all.md)
- [Checkbox group](../examples/checkbox--checkbox-group.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/checkbox.json`
- Styling (parts + `data-*`): `references/styling-contract/checkbox.json`
