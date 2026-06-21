# ADR 0004: Keep Field Form-Agnostic and Defer Signal Forms Adapter

> **Superseded by [ADR 0018](0018-signal-forms-adapter.md) (2026-06-20).** Its revisit triggers fired
> (Signal Forms stable in Angular 22, workspace baseline on 22.0.2): ADR 0018 records the decision to
> **build** the optional `[rdxSignalField]` + `[rdxSignalForm]` adapter pair while **keeping** this ADR's
> form-agnostic-core principle and dual CVA + Signal Forms controls. (The full-transition alternative —
> ADR 0019 — was explored and rejected; see its banner.) Only the "defer" stance here is closed.

- Status: Superseded by ADR 0018
- Date: 2026-06-03
- Amended: 2026-06-10 — adapter mechanism corrected to the implemented `RdxFieldState` provider seam
  (prep #4); `[formField]` discovery risk and the CVA fallback (Plan B) documented; the runtime spike
  promoted from optional to a **mandatory gate** before claiming Angular 22 / Signal Forms support;
  error-message flow gap recorded (picked up by the `add-form-root` change).
- Decision owners: Radix NG maintainers
- Related package: `packages/primitives/field`

## Context

`@radix-ng/primitives/field` groups a form control with accessible label, description, error message,
and field state. It is intentionally headless and does not own validation, value management, or form
submission. Consumers pass state into `rdxFieldRoot` through inputs such as `invalid`, `disabled`,
`required`, `dirty`, `touched`, `filled`, and `focused`.

Base UI's Field includes form-like behavior such as validation configuration and state derivation. That
shape fits React because Base UI needs to provide more of the form coordination itself. Angular already
has form systems for this layer:

- Reactive Forms and template-driven forms are stable Angular APIs.
- Signal Forms are available from `@angular/forms/signals`, but Angular documents them as experimental:
  <https://angular.dev/guide/forms/signals/overview>
- Signal Forms expose field state through signals and bind native controls with `[formField]`:
  <https://angular.dev/essentials/signal-forms>

Because Signal Forms are experimental and their API may change, making `@radix-ng/primitives/field`
depend directly on them would couple a stable primitive API to an unstable Angular API.

## Decision

Keep `Field` form-agnostic.

Do not add Signal Forms as a dependency of `@radix-ng/primitives/field` while Signal Forms are
experimental. Do not implement a Radix NG validation engine, schema layer, submit lifecycle, or
replacement for Angular Forms.

When Signal Forms become stable enough for this library's support policy, add Signal Forms integration
as an adapter or example layer rather than changing the core Field primitive. The adapter should map
Angular field state to existing `rdxFieldRoot` inputs and should not add competing state semantics.

## Preferred Current Usage

Reactive Forms, template-driven forms, and custom controls should pass state explicitly:

```html
<div
  rdxFieldRoot
  required
  [invalid]="control.invalid && (control.touched || submitted())"
  [dirty]="control.dirty"
  [touched]="control.touched"
  [disabled]="control.disabled"
>
  <label rdxFieldLabel>Email</label>
  <input rdxFieldControl [formControl]="control" />
  <p rdxFieldDescription>Use your account email.</p>
  <p rdxFieldError>Email is required.</p>
</div>
```

Signal Forms examples should use the same shape when added:

```html
<div rdxFieldRoot [invalid]="!email().valid()" [touched]="email().touched()" [disabled]="email().disabled()">
  <label rdxFieldLabel>Email</label>
  <input rdxFieldControl [formField]="email" />
  <p rdxFieldError>Email is required.</p>
</div>
```

The exact Signal Forms property names should be verified against the stable Angular API before any
adapter is implemented.

> **API drift — RESOLVED against stable Angular 22 (2026-06-11).** Signal Forms went **stable in
> 22.0.0 (June 2026)**. Verified: the binding directive is `[formField]`; `touched` stabilized as a
> plain **input** plus a separate **`touch: OutputRef<void>`** output (reverting 21.2.9's
> model/`touchedChange` approach — the drift this warning predicted happened, in the opposite
> direction). Radix NG controls ship the dual shape (`touched` model + `touch` output) covering both
> the installed 21.2.9 runtime and stable 22. Remaining stale names in `forms.docs.mdx` (`[field]`)
> are corrected by the `add-form-root` change's docs task. Final step: re-run the spike spec when the
> workspace baseline moves to Angular 22.

## Proposed Signal Forms Adapter Shape

The first Signal Forms integration should be a story/docs example. If repeated code appears across
examples, consider a small adapter directive.

Possible adapter:

```html
<div rdxFieldRoot [rdxSignalField]="loginForm.email">
  <label rdxFieldLabel>Email</label>
  <input rdxFieldControl [formField]="loginForm.email" />
  <p rdxFieldError>Email is required.</p>
</div>
```

The adapter may:

- read Signal Forms field state;
- own `invalid`, `disabled`, `required`, `dirty`, `touched`, `filled`, and `focused` — **not** by
  writing `rdxFieldRoot` inputs (a sibling directive cannot write another directive's `input()`s),
  but by registering an `RdxFieldState` provider through the field context's `setStateProvider`.
  This seam is already implemented (prep #4 in `signal-forms-readiness.md`): per-state precedence
  (a provided accessor wins, absent accessors fall back to inputs / DOM heuristic), partial ownership,
  and teardown via the returned previous provider;
- map Signal Forms validation errors into the field once `RdxFieldState` gains its optional
  `errors` accessor (gap recorded 2026-06-10; the `add-form-root` OpenSpec change adds the accessor and
  the `messages` exposure on `rdxFieldError`) — booleans alone cannot carry error _content_, and without
  this the "minimal migration" still hand-renders every message;
- keep using `RdxFieldControl` for ARIA relationships;
- stay optional and tree-shakeable.

The adapter must not:

- create or own the Signal Forms model;
- run validation itself;
- wrap or replace `[formField]`;
- change `RdxFieldRoot` input semantics;
- require Signal Forms for non-Signal-Forms consumers.

## Control Binding Risk and Plan B (added 2026-06-10)

This ADR covers the **state presentation** layer (Field). The migration's decisive risk lives one layer
below, in **value binding**, and is therefore explicitly recorded here so the ADR is not mistaken for a
full migration guarantee:

- Angular's custom-controls guide describes `[formField]` discovering a custom control when the **host
  component** implements `FormValueControl` / `FormCheckboxControl`. Every Radix NG control is an
  **attribute directive**; whether `[formField]` discovers a directive on the host is undocumented and
  unverified (readiness prep #5).
- On a native `<input rdxInput [formField]="…">`, `[formField]` may take the **native-input path** —
  writing `.value` directly, bypassing `rdxInput`'s `value` model and its cancelable `onValueChange`.
- If directive discovery does not work, every `implements RdxFormValueControl` in the codebase remains a
  compile-time declaration with no runtime effect, and the forms guide's promise that migration "changes
  only the binding expression" breaks for all non-native composite controls.

**Plan B — ControlValueAccessor interop.** The `FormField` API explicitly supports binding through a
`ControlValueAccessor` ("for backwards compatibility", less preferred). Radix NG form controls already
implement CVA, so even if structural discovery fails for directives, Signal Forms migration remains
possible through the CVA path — functional, at the cost of the signal-native binding. Fallback ladder:

1. structural discovery of the directive-based control (preferred; unverified);
2. CVA interop path (works today by contract; verify behavior parity in the spike);
3. thin host-component wrappers around the directives (last resort; API addition, not a break).

**Gate.** The runtime spike (readiness prep #5) is hereby promoted from "optional" to a **mandatory
gate**: no Angular 22 / Signal Forms compatibility claim, adapter, or docs update ships before a sandbox
has answered, per control archetype (native-input directive, composite directive, CVA), which rung of
the ladder actually binds.

### Spike outcome (2026-06-11, against experimental 21.2.9 — re-confirm on stable 22)

Runtime spike: 9 specs, all passing against 21.2.9. The spec is **archived at
`docs/spikes/signal-forms-spike.spec.ts`** (out of the test glob — it pinned the experimental API and we
already know stable 22 differs); copy it back into `packages/primitives/input/__tests__/` and re-run at
the Angular 22 workspace bump — that re-run is the remaining gate step. Combined with source reading of
`@angular/forms/fesm2022/signals.mjs` and `@angular/core`:

- **Rung 1 CONFIRMED — attribute directives ARE discovered.** Core's custom-control detection iterates
  **all directives on the node** (`initializeCustomControlStatus`, `directiveStart..directiveEnd`) and
  picks the first with a `value`/`checked` **model**. `<input rdxInput [formField]>` takes the
  custom-control path: the form writes the directive's `value` model (not raw `element.value`), and user
  input flows back to the field.
- **Precedence: CVA → custom control → native** (`FormField.ɵngControlCreate`). CVA is injected
  `{ self: true }`, so CVA-providing controls (switch, checkbox, radio, …) bind through the CVA rung —
  verified end-to-end with `button[rdxSwitchRoot]` (writeValue → `data-checked`; toggle → field value;
  blur → touched).
- **The form writes the whole `FormUiControl` surface into directives** via `setInputOnDirectives`
  (`errors`, `name`, `disabled`, `touched`, `readonly`, `minLength`, …) — the optional members added to
  controls are populated for real, including on the native rung.
- **`touched` must be a `model()`**: the implementation listens to the `touchedChange` output
  (`customControlCreate`); there is **no `touch` output** in the real contract (the earlier doc snapshot
  was wrong). `rdxInput.touched` and the `core` shim were corrected accordingly; `rdxSwitchRoot` also
  gained `(blur) → markAsTouched()` (previously only the hidden `rdxSwitchInput` marked touched — a gap
  that also affected Reactive Forms).
- **Rung 3 (wrapper components) is dead** — pruned from the ladder. Plan B (CVA) remains as the
  automatic path for CVA controls, not as a fallback.

The gate is satisfied for the 21.x experimental API. Remaining before a compatibility claim: re-run this
spec against stable Angular 22 and do the one-pass naming re-verification (drift warning above).

**Addendum (2026-06-11, same day): stable 22 contract diff.** Angular 22.0.0 (June 2026) stabilized
Signal Forms with one contract reversal relevant to the spike: `touched` is a plain input again and the
notification is a separate **`touch` output** (21.2.9 listens to a `touched` model's `touchedChange`
instead — and has no `touch`). Controls now ship **both** (`touched` model set on blur + `touch` output
emitted on blur), so the spike's blur assertion is designed to keep passing across the 22 bump. Stable 22
also adds an optional `reset()` control method, `markAsTouched()` marks descendants by default, and
`FormValueControl` interops with Reactive/template-driven forms **without CVA** — which strengthens the
dual CVA + `RdxFormValueControl` strategy (one contract eventually serves all three form systems). The
naming re-verification is done against the v22.0 API docs; only the runtime spike re-run on the actual
22 workspace bump remains.

## Consequences

### Positive

- `Field` stays usable with Reactive Forms, template-driven forms, Signal Forms, and custom controls.
- The primitive avoids depending on an experimental Angular API.
- Validation remains in Angular Forms, where Angular users expect it.
- Future Signal Forms integration can be added without breaking existing Field consumers.
- Storybook examples can show both stable Reactive Forms and future Signal Forms usage clearly.

### Negative / Risks

- Consumers must map form state into `rdxFieldRoot` inputs manually until an adapter exists.
- Signal Forms examples may lag behind Angular changes while the API is experimental.
- A future adapter may need revision if Signal Forms state names or directives change.
- Field cannot automatically infer all form state from every possible Angular form setup.

## Alternatives Considered

### Port Base UI Field Behavior Directly

This would make Field own validation and state derivation. It is not recommended for Angular because it
duplicates Angular Forms and risks conflicting with both Reactive Forms and Signal Forms.

### Add Signal Forms Dependency Now

This would make Signal Forms examples easier to write today but couples a primitive package to an
experimental API. It also risks forcing consumers onto Signal Forms even when they use Reactive Forms.

### Auto-detect Every Angular Form API

Field could try to inject `NgControl` and later Signal Forms field state automatically. This is useful
only when it remains opportunistic. It should not become the primary contract because hidden inference
can be surprising and incomplete.

## Migration Plan

1. Keep the initial `Field` primitive form-agnostic.
2. Maintain a Reactive Forms story that demonstrates explicit state mapping.
3. **Run the binding spike (mandatory gate, see "Control Binding Risk and Plan B")** — a throwaway
   sandbox on the experimental API answers the discovery question per control archetype and selects the
   fallback-ladder rung; re-run against stable Angular 22 before any compatibility claim.
4. Add a Signal Forms story only when the project is ready to depend on the current Angular version
   and the API shape is acceptable for examples.
5. If Signal Forms mapping repeats across examples, add an optional adapter directive in a separate
   implementation pass (registering an `RdxFieldState` provider, per the corrected contract above).
6. Re-evaluate whether the adapter belongs in `@radix-ng/primitives/field` or a separate entry point if
   it introduces a peer dependency or version constraint.

## Trigger for Revisit

Revisit this ADR when:

- Angular marks Signal Forms stable;
- the project upgrades to a version where Signal Forms are part of the supported baseline — at which
  point the binding spike and the one-pass API re-verification (drift warning above) become due
  **before** the version bump is announced as Signal Forms-compatible;
- the binding spike answers the discovery question (update "Control Binding Risk and Plan B" with the
  outcome and prune the dead rungs of the fallback ladder);
- multiple stories or consumers duplicate the same Signal Forms to Field state mapping;
- a consumer requests automatic Field integration with Signal Forms;
- `RdxFieldRoot` needs a new input that only exists to support Signal Forms;
- a form-level coordination primitive lands (the `add-form-root` OpenSpec change adds `RdxFormRoot` with
  an `RdxFormState` seam mirroring this ADR's field-level seam — the future adapter becomes a pair:
  `[rdxSignalField]` + `[rdxSignalForm]`).
