# OTP Field

A headless one-time-code control built from one native input per character.

> Index — full source of each example is one click away in `../examples/otp-field--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.2.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Renders independently focusable native inputs for each character and a hidden form control for submission and validation.
- ✅ Supports controlled and uncontrolled values, normalization, numeric or text validation, masking, and one-time-code autofill.
- ✅ Distributes typing and pasted text across slots, with keyboard navigation between characters.
- ✅ Integrates with Reactive Forms, `ngModel`, and Angular Signal Forms.
- ✅ Exposes completion, invalid-input, and cancellable value-change events.
- ✅ Supports visual grouping and separators without imposing styles or layout.

## Import

```ts
import { RdxOtpFieldInput, RdxOtpFieldModule, RdxOtpFieldRoot, RdxOtpFieldSeparator } from '@radix-ng/primitives/otp-field';
```

## Anatomy

Apply `rdxOtpFieldRoot` to a wrapper, then add one `rdxOtpFieldInput` native input for each character. A separator is optional and purely presentational.

```html
<div rdxOtpFieldRoot [length]="6" name="verificationCode" [autoComplete]="'one-time-code'">
  <input rdxOtpFieldInput />
  <input rdxOtpFieldInput aria-label="Character 2 of 6" />
  <input rdxOtpFieldInput aria-label="Character 3 of 6" />
  <input rdxOtpFieldInput aria-label="Character 4 of 6" />
  <input rdxOtpFieldInput aria-label="Character 5 of 6" />
  <input rdxOtpFieldInput aria-label="Character 6 of 6" />
</div>
```

The root's `length` is required and should match the number of slot inputs. Slot indices follow DOM order, including inputs nested in layout wrappers. The first slot receives the root `id`; later slots receive numbered ids.

## Examples

- [Basic numeric code](../examples/otp-field--basic-numeric-code.md)
- [Groups and separator](../examples/otp-field--groups-and-separator.md)
- [Character validation](../examples/otp-field--character-validation.md)
- [Uppercase normalization](../examples/otp-field--uppercase-normalization.md)
- [Placeholders](../examples/otp-field--placeholders.md)
- [Masked entry](../examples/otp-field--masked-entry.md)
- [Reactive Forms](../examples/otp-field--reactive-forms.md)
- [Template-driven forms](../examples/otp-field--template-driven-forms.md)
- [Signal Forms](../examples/otp-field--signal-forms.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/otp-field.json`
- Styling (parts + `data-*`): `references/styling-contract/otp-field.json`
