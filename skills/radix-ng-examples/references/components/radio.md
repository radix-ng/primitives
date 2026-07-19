# Radio Group

A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.

> Index — full source of each example is one click away in `../examples/radio--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Full keyboard navigation.
- ✅ Can be controlled or uncontrolled.

## Import

Get started with importing the directives:

```typescript
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
```

## Anatomy

```html
<div rdxRadioRoot name="density">
  <label>
    <span rdxRadioItem value="default">
      <span rdxRadioIndicator></span>
      <input rdxRadioItemInput />
    </span>
    Default
  </label>
</div>
```

A named group participates in native `FormData` without item inputs. Add the optional
`input[rdxRadioItemInput]` part inside each item when you also need native constraint validation,
`<label>` activation, or native input/change events. Selection through the group (click, keyboard,
`ngModel`/reactive forms) works with or without it.

The item can attach to any element. When the host is a native `<button>` it is detected automatically:
`type="button"` and the native `disabled` attribute are applied for you — there is no `nativeButton`
input to set.

## Examples

- [Default](../examples/radio--default.md)
- [Disabled](../examples/radio--disabled.md)
- [Template-driven forms](../examples/radio--template-driven-forms.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/radio.json`
- Styling (parts + `data-*`): `references/styling-contract/radio.json`
