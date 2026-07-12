# ADR 0020: Opt-in Angular Signal Forms Submit Delegation

- Status: Accepted
- Date: 2026-07-11
- Decision owners: Radix NG maintainers
- Related: ADR 0018, `packages/primitives/{form,field,signal-forms,core}`

## Context

`RdxFormRoot` mirrors Base UI Form: it records a submit attempt, blocks an actually invalid form,
focuses the first invalid registered control, and emits `onFormSubmit` only for a valid form. Its
validation and external-error presentation stay form-system-agnostic.

Angular 22 Signal Forms now has a stable, framework-native `submit()` lifecycle. It marks interactive
fields touched, applies the configured validator policy, prevents concurrent submission, drives the
`submitting()` signal, and attaches returned submission errors to their target `FieldTree`. Recreating
that machinery in Radix NG would duplicate Angular and make the adapter the validation owner, contrary
to ADR 0018.

Changing `[rdxSignalForm]` to delegate every submit would also break existing 1.x consumers that use it
only as a state adapter together with `(onFormSubmit)`: both paths could run user side effects.

Base UI's Field data contract has `data-valid` / `data-invalid` but no pending attribute. A pending async
validator is not invalid, and must not be presented as valid either. Angular already exposes
`field().pending()` for application UI.

## Decision

1. Add a boolean `rdxSignalSubmit` input to `RdxSignalForm`. It is opt-in and defaults to `false`.
2. With `rdxSignalSubmit`, `RdxSignalForm` registers a submit delegate that calls Angular's public
   `submit(fieldTree)`. The configured Signal Forms `submission.action` is required.
3. `RdxFormRoot` still owns the native form element and submit-attempt presentation. When an adapter
   returns a delegated submission Promise, it does not run its synchronous validity guard and does not
   emit `onFormSubmit`. After Angular resolves `false`, it focuses the first actually invalid registered
   field, preserving Base UI's focus behavior.
4. Without `rdxSignalSubmit`, the existing Base UI-style `(onFormSubmit)` path is unchanged.
5. Carry Angular's `pending` state through the internal form-control and Field state seams only to
   preserve tri-state validity. Pending publishes neither `data-valid` nor `data-invalid`. Do not add a
   Radix-specific `data-pending`; consumers render progress from Angular's `pending()` signal.
6. Keep `RdxFormRoot[errors]` as the Base UI-compatible external-error channel. In the delegated Signal
   Forms path, returned submission errors are the preferred Angular-native channel and clear on edit
   according to Angular's lifecycle. Registry invalidity that is not owned by the Signal Forms provider
   (including `RdxFormRoot[errors]`) still blocks before delegation, so a visible external error cannot
   silently pass through to the Angular action.

## Consequences

- Signal Forms owns validation and asynchronous submission; Radix NG owns accessible presentation and
  Base UI-compatible focus/error behavior.
- Existing 1.x submit handlers do not change unless the consumer opts in.
- A delegated form must configure `submission.action`; Angular's own diagnostic is surfaced if it does
  not.
- `data-submitting` remains the already-shipped Form adapter state. No new pending data attribute is
  added to the Base UI-facing contract.
- A future major may make Angular submission delegation the default for `[rdxSignalForm]` after a
  deprecation period for the legacy combination.
