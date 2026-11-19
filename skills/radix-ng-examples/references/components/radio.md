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
See [Option values](#option-values) for numbers, objects and arrays.
See [Native input refs](#native-input-refs) for access to authored inputs.

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

The group uses its explicit `aria-labelledby`, the Field label, or the enclosing Fieldset's
`legend[rdxFieldsetLegend]`, in that order. Import `RdxFieldsetRoot` and `RdxFieldsetLegend` from
`@radix-ng/primitives/fieldset` to share a legend with related controls.

| Attribute      | Parts                                     | Present when                         |
| -------------- | ----------------------------------------- | ------------------------------------ |
| `data-valid`   | RadioGroup, RadioGroupItem, RadioIndicator | Field displays a valid state.        |
| `data-invalid` | RadioGroup, RadioGroupItem, RadioIndicator | Field displays an invalid state.      |
| `data-filled`  | RadioGroup, RadioGroupItem, RadioIndicator | Field has a selection.                |
| `data-focused` | RadioGroup, RadioGroupItem, RadioIndicator | An enabled radio has focus.           |
| `data-dirty`   | RadioGroup, RadioGroupItem, RadioIndicator | Field is dirty.                       |
| `data-touched` | RadioGroup, RadioGroupItem, RadioIndicator | Field is touched.                     |

## Option values

Give each item a distinct value. Numbers and strings are separate values, and objects and arrays
compare by reference. Reuse the same object or array in the item binding and the selected value.
`null` represents no selection. Use `[value]` for a value with a type other than string.

```ts
import { Component, signal } from '@angular/core';
import { RdxRadioGroupDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';

interface StorageOption {
    id: string;
    label: string;
}

@Component({
    selector: 'storage-options',
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective],
    template: `
        <div [controlledValue]="selected()" (onValueChange)="selected.set($event.value)" rdxRadioRoot aria-label="Storage">
            @for (option of options; track option.id) {
                <button [value]="option" rdxRadioItem>{{ option.label }}</button>
            }
        </div>
    `
})
export class StorageOptions {
    protected readonly options: StorageOption[] = [
        { id: 'standard', label: 'Standard' },
        { id: 'premium', label: 'Premium' }
    ];
    protected readonly selected = signal<StorageOption | null>(this.options[0] ?? null);
}
```

The Angular form model and `onValueChange` retain the original value.
Use `RdxRadioValueChangeEvent<StorageOption>` when annotating an object-valued handler.
A native form submits one entry for the selection. Strings pass through, and other values
are serialized as JSON where possible. Two distinct items can produce the same submitted string.
Give independent groups separate form owners or distinct names if they use native radio inputs.

## Native input refs

Bind `[inputRef]` on `rdxRadioRoot` for the group's representative native radio input,
or on `rdxRadioItem` for that item's own input.

```ts
import { Component, signal } from '@angular/core';
import { RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective } from '@radix-ng/primitives/radio';

@Component({
    selector: 'density-options',
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        <div [inputRef]="setInput" rdxRadioRoot defaultValue="compact" aria-label="Density">
            <span rdxRadioItem value="compact">Compact<input rdxRadioItemInput /></span>
            <span rdxRadioItem value="comfortable">Comfortable<input rdxRadioItemInput /></span>
        </div>
    `
})
export class DensityOptions {
    readonly nativeInput = signal<HTMLInputElement | null>(null);
    protected readonly setInput = (element: HTMLInputElement | null) => this.nativeInput.set(element);
}
```

The group forwards the enabled selected input when available. On initialization and clearing,
it can use the first eligible authored input. Removing or disabling the forwarded input releases
the binding. A selected input or a newly eligible registration can then take its place.

Both directives expose a readonly `nativeInput()` signal. The input comes from
`input[rdxRadioItemInput]`. The group's generated form-data fallback does not appear in either ref.
Callbacks run after browser rendering. When the element or callback changes, the old binding
receives `null` or runs the cleanup function its callback returned.

## Examples

- [Default](../examples/radio--default.md)
- [Disabled](../examples/radio--disabled.md)
- [Template-driven forms](../examples/radio--template-driven-forms.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/radio.json`
- Styling (parts + `data-*`): `references/styling-contract/radio.json`
