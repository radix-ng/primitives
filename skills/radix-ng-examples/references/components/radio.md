# Radio Group

A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.

> Index — full source of each example is one click away in `../examples/radio--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Full keyboard navigation.
- ✅ Can be controlled or uncontrolled.

## Import

Get started with importing the directives:

```typescript
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioIndicatorPresenceDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
```

## Anatomy

```html
<div rdxRadioRoot name="density">
  <label>
    <span rdxRadioItem value="default">
      <span *rdxRadioIndicatorPresence rdxRadioIndicator></span>
      <input rdxRadioItemInput />
    </span>
    Default
  </label>
</div>
```

A named group submits the value of its mounted, enabled selected item. Add
`input[rdxRadioItemInput]` inside each item for native `required` validation,
`<label>` activation or native input/change events. Failed native validation focuses the
visible radio. Use `form="form-id"` on the group to associate it with a form elsewhere on
the page. Click, keyboard selection and Angular Forms work with or without item inputs.
See [Field composition](#field-composition) for shared form state and label wiring.

The item can attach to any element. When the host is a native `<button>` it is detected automatically:
`type="button"` and the native `disabled` attribute are applied for you — there is no `nativeButton`
input to set.

## Field composition

Import `RdxFieldRoot`, `RdxFieldLabel`, `RdxFieldDescription` and `RdxFieldItem` from
`@radix-ng/primitives/field` to associate a group label and description and give each item
its own label. Use a non-native label for the group and a native label for each item's input.

```html
<div rdxFieldRoot name="density">
    <span rdxFieldLabel>Density</span>
    <p rdxFieldDescription>Choose how much space to leave between rows.</p>

    <div rdxRadioRoot>
        <div rdxFieldItem>
            <span rdxRadioItem value="compact">
                <span rdxRadioIndicator></span>
                <input rdxRadioItemInput />
            </span>
            <label rdxFieldLabel>Compact</label>
        </div>
        <div rdxFieldItem>
            <span rdxRadioItem value="comfortable">
                <span rdxRadioIndicator></span>
                <input rdxRadioItemInput />
            </span>
            <label rdxFieldLabel>Comfortable</label>
        </div>
    </div>
</div>
```

The field's name takes precedence over the group's name. A disabled field disables the group,
and a disabled Field Item disables its radio. Each radio includes the group description and
its own Field Item description.

| Attribute      | Parts                                     | Present when                         |
| -------------- | ----------------------------------------- | ------------------------------------ |
| `data-valid`   | RadioGroup, RadioGroupItem, RadioIndicator | Field displays a valid state.        |
| `data-invalid` | RadioGroup, RadioGroupItem, RadioIndicator | Field displays an invalid state.      |
| `data-filled`  | RadioGroup, RadioGroupItem, RadioIndicator | Field has a selection.                |
| `data-focused` | RadioGroup, RadioGroupItem, RadioIndicator | An enabled radio has focus.           |
| `data-dirty`   | RadioGroup, RadioGroupItem, RadioIndicator | Field is dirty.                       |
| `data-touched` | RadioGroup, RadioGroupItem, RadioIndicator | Field is touched.                     |

## Examples

- [Default](../examples/radio--default.md)
- [Disabled](../examples/radio--disabled.md)
- [Template-driven forms](../examples/radio--template-driven-forms.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/radio.json`
- Styling (parts + `data-*`): `references/styling-contract/radio.json`
