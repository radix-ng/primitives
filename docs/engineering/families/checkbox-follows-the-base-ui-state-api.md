# Checkbox follows the Base UI state API

The Checkbox exposes `data-checked`, `data-unchecked` and `data-indeterminate`. The visible native
button uses `disabled`. A separate `readOnly` input keeps it focusable and prevents edits.

Checkbox retains the editable `checked` model for Angular Forms and exposes `controlledChecked`
for parent-owned requests. CheckboxGroup offers the corresponding `value` and `controlledValue`.
Mixed presentation follows the `indeterminate` input or the group's select-all state.

The indicator's `keepMounted` input retains its layout after the shared exit lifecycle.
See the [Checkbox matrix](../../../packages/primitives/checkbox/PARITY.md) for the paired comparisons
and Angular-specific contracts.
