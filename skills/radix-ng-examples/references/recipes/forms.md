# Forms

#### Build accessible, headless forms with Radix NG `Field` / `Form` and the form library of your choice.

Radix NG ships the unstyled building blocks — `Form`, `Field`, `Input`, `Select`, `Checkbox`,
`RadioGroup`, `Switch` — and leaves state and validation to your form library. These recipes build the
**same** forms (a bug report, a complete issue form, and dynamic array fields) two ways, so you can pick
the engine your app already uses and keep identical accessible markup.

## Pick your form library

Start by selecting your library, then follow the guide to build forms with Radix NG and that library.
`target="_top"` is used so the links navigate the Storybook manager, not the docs iframe.

- <a href="./?path=/docs/recipes-forms-signal-forms--docs" target="_top">**Angular Signal Forms**</a> —
  the framework-native, signals-first engine. **Recommended** for Angular: the `rdxSignalField` adapter
  reports field state into `Field` automatically.
- <a href="./?path=/docs/recipes-forms-tanstack-form--docs" target="_top">**TanStack Form**</a> —
  headless form state, validated with **Zod**. A manual integration with `Field`.

## What's the same

Both recipes share identical, accessible markup built from the headless parts:

- `Form` / `Field` wire `for`, `aria-describedby`, `aria-invalid`, and a polite error region.
- The same controls — `Input`, textarea, `Select`, `RadioGroup`, `CheckboxGroup`, `Switch` — appear in
  both.
- Browser validation is disabled (`novalidate`) so the schema and the `Field` error region own the
  messaging.

Only the engine differs: **Signal Forms** owns value + validation through `form()` and `[formField]`,
while **TanStack Form** owns them through `injectForm` and `[tanstackField]` (validated with **Zod**).
