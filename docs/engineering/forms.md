# Form composition

- `Input` is the headless native text input primitive (`input[rdxInput]`). It can be used standalone, but should be wrapped in `Field` when it needs a label, description, error text, or inherited invalid/disabled/required state.
- `Field` groups one control with its label, description, error message, and state. Use `rdxFieldRoot`, `rdxFieldLabel`, `rdxFieldDescription`, `rdxFieldError`, and either `rdxFieldControl` or a compatible control such as `rdxInput`. `rdxFieldRoot` takes a `name` (the key an enclosing `Form`'s `errors` map matches), registers with an optional enclosing `Form`, merges external errors into `invalidState`, and exposes matched messages via `rdxFieldError`'s `messages()`.
- `Fieldset` groups related fields with native `fieldset`/`legend` semantics. Use `fieldset[rdxFieldsetRoot]` and `legend[rdxFieldsetLegend]`; disabled state belongs on the root and is exposed to the legend with `data-disabled`.
- `Form` (`form[rdxFormRoot]`, entry `@radix-ng/primitives/form`) is the top layer: it maps server `errors` onto fields by `name` (clearing on edit, `onClearErrors`), intercepts submit (`onFormSubmit` with `FormData`-serialized values, focus first invalid), and resets field state on native reset. It owns no values/validation — `field` → `form` is the only dependency direction (Form never imports Field; keep it acyclic). A `RdxFormState` provider seam mirrors Field's `RdxFieldState` for a future Signal Forms `[rdxSignalForm]` adapter.
- For larger form demos, prefer composing `Form` → `Fieldset` → `Field` → `Input` so Storybook and `/primitives/components/*.md` examples show real accessible form structure.

Radio Group supplies browser `valueMissing` errors from authored `rdxRadioItemInput` elements
to its enclosing Field. In Form, Field refreshes the native constraint before the submit guard.
See the [Radio matrix](../../packages/primitives/radio/PARITY.md#native-required-constraints).

Field can supply portaled entries to Form alongside native `FormData`. Radio supplies its selected
entry, Checkbox supplies its checked value or `uncheckedValue`, and CheckboxGroup can supply multiple
entries under the Field name. The controls use this path for connected, enabled inputs with no native
owner or explicit `form` association.
The native form bridge lets the declaring Form reset editable selections in this scope. The bridge
waits for reset dispatch to finish so it respects cancellation.

Form chooses the first invalid control in DOM order, using the actual control or the visible
focus target supplied by a composite control. A registered invalid field without a target still
blocks submission. Nested Fields keep their labels, descriptions and validation state scoped to
their own controls.

See [Signal Forms readiness](signal-forms-readiness.md) before changing form controls. Public usage guidance is in [the forms handbook](../../apps/radix-storybook/docs/guides/forms.docs.mdx).
