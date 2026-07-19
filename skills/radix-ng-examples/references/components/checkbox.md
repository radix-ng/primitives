# Checkbox

A control that allows the user to toggle between checked and not checked.

> Index — full source of each example is one click away in `../examples/checkbox--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

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
  RdxCheckboxInputDirective
} from '@radix-ng/primitives/checkbox';
```

## Anatomy

Assemble the root, button trigger, and indicator. The native input is optional.

```html
<div rdxCheckboxRoot>
  <button rdxCheckboxButton>
    <svg rdxCheckboxIndicator lucideCheck />
  </button>
  <input rdxCheckboxInput />
</div>
```

A named root participates in `FormData` even without `[rdxCheckboxInput]`. Include the input when you
also need native constraint validation or mirrored native input/change events.

## Examples

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
