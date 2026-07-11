# ADR 0022: Use `null` for Empty Signal Date and Time Fields

- Status: Accepted
- Date: 2026-07-11
- Decision owners: Radix NG maintainers
- Related packages: `core`, `date-field`, `time-field`, `signal-forms`

## Context

Date Field and Time Field originally exposed `DateValue | undefined` and `TimeValue | undefined` value
models. That is a reasonable optional-input shape, but it is not a stable empty leaf in Angular Signal
Forms.

Angular's public `FieldTree` type maps object properties through `MaybeFieldTree<T>`. When a property is
`undefined`, the child itself is `undefined`; there is no callable field state for `[formField]` or
`rdxSignalField` to bind. The cross-control integration matrix reproduced this with an initially empty
date/time model. A populated initial value worked, which had hidden the problem in the earlier
per-control value and reset specs.

Every other control already has a concrete empty form value: `''` for text, `[]` for groups, `false` for
checkbox controls, or `null` for nullable scalar controls. Date and Time Field were the only controls
without one.

## Decision

Use `null` as the only public empty value for Date Field and Time Field:

- Date Field exposes `value = model<DateValue | null>(null)`.
- Time Field exposes `value = model<TimeValue | null>(null)`.
- Segment deletion writes `null`, and the Time Field edit buffer maps an empty internal value back to
  `null`.
- `placeholder` remains `DateValue | undefined` / `TimeValue | undefined`. It is optional presentation
  configuration, not a child form value; the roots continue to derive an always-defined internal
  placeholder for segment math.
- Signal Forms examples and the public integration matrix use `null` for initially empty date/time
  model properties.

No adapter manufactures a missing child field. Angular remains the owner of the form tree and Radix NG
uses the value semantics that Angular already defines.

## Base UI Parity and Angular Divergence

The current Base UI reference has no Date Field or Time Field primitive to mirror. `null` is consistent
with Base UI's nullable controlled Select value and with Radix NG's existing Radio Group, Number Field,
Select, and Combobox form values. The decision is primarily Angular-native: `undefined` means an absent
optional path, while `null` means a present empty scalar leaf.

## Alternatives Considered

### Accept both `null` and `undefined`

Rejected. A wider type would preserve the exact state that makes the child `FieldTree` disappear and
would continue to advertise an unsafe empty value for Signal Forms.

### Normalize `undefined` inside `rdxSignalField`

Rejected. The adapter receives a co-located `FormField`; when the child is `undefined`, Angular cannot
create that directive state in the first place. Rebuilding or wrapping Angular's form tree would be
duplicated, foreign form machinery.

### Require an initially populated date/time

Rejected. Optional date and time fields are common, and Signal Forms must support them without a fake
placeholder value entering the application model.

## Consequences

- This is a breaking value-type change for Date Field and Time Field consumers.
- An empty Signal Forms model remains structurally stable and can be validated, touched, reset, and
  submitted through the normal Angular lifecycle.
- Direct two-way bindings must replace `undefined` with `null`; placeholder bindings do not change.
- The executable 14-control Signal Field matrix now includes initially empty nullable date/time paths.

## Migration

```ts
// Before
readonly model = signal<{ date: DateValue | undefined }>({ date: undefined });

// After
readonly model = signal<{ date: DateValue | null }>({ date: null });
```

Apply the same replacement to `TimeValue`. Reset with `field().reset(null)` when the desired reset value
is empty.
