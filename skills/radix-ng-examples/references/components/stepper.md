# Stepper

A set of steps that are used to indicate progress through a multi-step process.

> Index — full source of each example is one click away in `../examples/stepper--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Supports horizontal/vertical orientation.
- ✅ Supports linear/non-linear activation.
- ✅ Full keyboard navigation.

## Anatomy

Import all parts and piece them together.

```html
<div rdxStepperRoot >
    <div rdxStepperItem >
        <div rdxStepperSeparator></div>
        <button rdxStepperTrigger>
            <div rdxStepperIndicator></div>
        </button>

        <h4 rdxStepperTitle></h4>
        <p rdxStepperDescription></p>
    </div>
</div>
```

## Examples

- [Vertical](../examples/stepper--vertical.md)
- [Navigation](../examples/stepper--navigation.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/stepper.json`
- Styling (parts + `data-*`): `references/styling-contract/stepper.json`
