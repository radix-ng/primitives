# ADR 0089: Separate parent-owned Radio selection from the editable form value

- Status: Accepted
- Date: 2026-11-19
- Decision owners: Radix NG maintainers
- Related: ADR 0018, ADR 0025, ADR 0081, `packages/primitives/radio/PARITY.md`

## Context

Base UI RadioGroup can request a selection while the parent retains its current value. The Angular
Radio group uses a writable `value` model for Signal Forms and provides a CVA for Reactive and
Template-driven Forms. A local write to that model can replace the last one-way binding value even
when the consumer ignored the request.

A native label can also select its radio input before the click handler runs. Canceling the request
must preserve the effective selection in both the visible item and native form serialization.

## Decision

Keep `value` as the editable Angular Forms model. Add `controlledValue` as the parent-owned input.
A defined value, including `null`, owns the selection. The readonly `currentValue` computed supplies
the selection to items, Composite and native form serialization. A controlled request reports
`onValueChange` and leaves both values to their owners. Removing the controlled value resumes the
editable model, with no new default initialization.

Run the cancelable request before writing the editable model or notifying its form adapter. When a
native radio click does not commit a local edit, cancel the default action and restore the checked
properties. A successful native input click supplies the browser's notifications. An accepted
visible-item edit publishes one `input` and one `change` on its authored radio input. Updates driven
by a parent, form or reset only synchronize native state.

## Consequences

Strict ownership consumers bind `[controlledValue]` and decide how to respond to
`onValueChange`. Form-bound consumers continue using `[(value)]`, CVA or `[formField]`.
Using two input names preserves the Angular form model contract and lets the selection stay
parent-owned without another writable selection store or a separate required form wrapper.

The browser fixture compares the resulting selection, request sequence and native FormData.
React forwards the host click to an internally generated input, while Angular retains the
originating event and identifies the visible item as the trigger. The fixture records event trust
and native notification details. See the [Radio matrix](../../packages/primitives/radio/PARITY.md#verification).
