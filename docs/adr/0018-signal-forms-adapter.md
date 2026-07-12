# ADR 0018: Ship the Signal Forms Adapter (`[rdxSignalField]` + `[rdxSignalForm]`)

> **Live decision (reaffirmed 2026-06-21).** The full-transition alternative — drop CVA / Reactive /
> template support and retire `RdxFormRoot` — was explored in [ADR 0019](0019-signal-forms-only.md) and
> **rejected**: maintaining an existing CVA **and** Signal Forms on the same control is technically cheap (a control
> implements both contracts; `[formField]` precedence is CVA → custom-control → native, and the form still
> writes the `FormUiControl` surface into the directive either way), so there is no reason to hard-break
> the Reactive/template ecosystem for a one-month-old API. Existing CVAs stay **dual**; `select` gained
> the same dual contract on 2026-07-11, while `date-field`, `time-field`, and `editable` remain explicitly Signal-only. The
> core stays form-agnostic; Signal Forms ships as the **optional** adapter pair in
> `@radix-ng/primitives/signal-forms`.

- Status: Accepted
- Date: 2026-06-20 (implementation completed 2026-06-22)
- Decision owners: Radix NG maintainers
- Related: `packages/primitives/{field,form,core}`, new `packages/primitives/signal-forms`
- Supersedes the "defer" decision of **ADR 0004** (its revisit triggers are now met)

> **Implementation complete (updated 2026-07-11).** Both adapters shipped, and the optional `FormUiControl`
> surface (`invalid` / `pending` / `errors` / `touched` model + `touch` / `dirty`) now lands on **all 14 form
> controls** — input, radio, checkbox, switch, number-field, select, toggle-group, checkbox-group,
> slider, combobox, autocomplete, date-field, time-field, editable — not just the pilot five. The
> per-control duplication was factored into four reusable pieces in `@radix-ng/primitives/core`
> (`src/signal-forms/` + `src/accessor/`): **`RdxFormUiControlBase`** (an abstract `@Directive()` that declares the shared
> members once and builds `formUi`; controls `extends` it — inheritance keeps the inputs on the same
> directive as the `value`/`checked` model, which a host directive could not), **`injectNgControlState()`**
> (a lazy same-host Reactive/template-driven `NgControl` bridge over `AbstractControl.events`), **`createFormUiState()`**
> (the derivation + dual `markAsTouched` with an optional CVA bridge), and **`RdxFormUiStateHost`** +
> `provideFormUiState()` (a host directive for the `data-*` / `aria-invalid` / `focusout` reflection on
> self/group controls). The stable Angular-22 runtime gate is complete. Every control is runtime-covered
> for value binding and `FieldState.reset()`; reset restores the visible value and clears both Angular and
> control-owned touched/dirty state. All 11 Reactive/template-driven controls also reflect Angular-owned
> dirty/touched state and validation status/errors, including reset, pristine, untouched, pending, and
> disabled transitions. `PENDING` / `DISABLED` are neutral, while Angular errors normalize to
> `{ kind, message? }[]`. Select additionally ships a direct `ControlValueAccessor`, with
> runtime coverage for Reactive Forms, `ngModel`, disabled state, reset, cancellation, and multiple object
> values. The public Storybook matrix records which controls also retain a CVA.
> Opt-in Angular-owned submission is specified separately in ADR 0020.

## Context

ADR 0004 kept `Field` form-agnostic and **deferred** a Signal Forms adapter while
`@angular/forms/signals` was experimental. Every revisit trigger it listed has now fired:

- **Signal Forms is stable.** Stabilized in Angular **22.0.0** (June 2026).
- **The workspace baseline moved to Angular 22** (`@angular/core` is `22.0.2` in `package.json`).
- The provider seams ADR 0004 specified are **already implemented** (readiness prep #1–#6):
  - `RdxFieldRoot` exposes `RdxFieldState` + `setStateProvider` / `hasStateProvider`; every `*State`
    computed resolves per-state (a registered accessor wins, else input / DOM heuristic). `RdxFieldState`
    has the optional `errors: () => RdxValidationError[]` content channel, surfaced through
    `RdxFieldError.messages()`.
  - `RdxFormRoot` exposes the form-level counterpart `RdxFormState` + `setStateProvider`
    (`invalid` / `dirty` / `touched` / `submitting` / `errorsFor`).
  - `core/src/signal-forms/form-control.ts` declares the framework-free mirror contracts
    (`RdxFormValueControl<T>`, `RdxFormCheckboxControl`, `RdxFormUiControl`, `RdxValidationError`); the
    five clean controls (`input`, `radio`, `number-field`, `switch`, `checkbox`) already `implements`
    them and compile.
  - The **binding spike passed** (archived at `docs/spikes/signal-forms-spike.spec.ts`): `[formField]`
    discovers **attribute directives** as custom controls (core scans all directives on the node and
    picks the first with a `value`/`checked` model), and the CVA path binds CVA-providing controls
    (switch/checkbox/radio). Precedence is **CVA → custom control → native**.

### Stable Angular 22 contract (verified against angular.dev, 2026-06-20)

- `value` / `checked` — `ModelSignal<T>` (the only required member; the two interfaces stay mutually
  exclusive via `checked?: undefined` / `value?: undefined`).
- `touched` — stable 22 reads a `touch: OutputRef<void>` output; the 21.x experimental API instead
  listens to a `touched` **model**'s `touchedChange`. Controls ship the **dual shape** (`touched = model()`
  set on interaction **plus** a `touch` output emitted alongside) so both API generations work.
- `errors` — `input<readonly ValidationError[]>`; `disabled`, `readonly`, `required`, `invalid`,
  `hidden`, `pending`, `dirty`, `name`, `min`, `max`, `minLength`, `maxLength`, `pattern` — all `input()`.
- Optional methods `focus(options?)` and `reset()`; every Radix NG control now participates in reset.
- Binding directive is `[formField]`; it detects the implemented interface and binds the signals.
- A control implementing only `FormValueControl` / `FormCheckboxControl` is **not** usable with Reactive /
  template-driven forms — those still require `ControlValueAccessor`, so controls keep CVA (dual).

This ADR records the decision to **build** the adapter, not to re-derive the readiness analysis — see
`.claude/skills/project-knowledge/references/signal-forms-readiness.md` for the full conformance matrix.

## Decision

Ship a Signal Forms integration as an **optional, tree-shakeable adapter layer**, on these four choices:

### 1. A dedicated entry: `@radix-ng/primitives/signal-forms`

The adapters live in a new secondary entry, **not** in `field` / `form`. Only this entry imports
`@angular/forms/signals` and declares the `@angular/forms` peer dependency. `field`, `form`, and the
control entries stay free of any `@angular/forms` coupling, so a Reactive- or template-forms consumer of
`rdxInput` / `rdxCheckbox` never pulls Signal Forms into their dependency graph. (This realizes ADR 0004
step 6 — "re-evaluate whether the adapter belongs in `field` or a separate entry if it introduces a peer
dependency": it does, so it gets its own entry.)

### 2. Support Angular 21 and 22 (no break); controls stay dual

Keep the library peers at `^21.0.0 || ^22.0.0` for both `@angular/core` **and** `@angular/forms`.
Controls keep `ControlValueAccessor` (Reactive / template-driven forms — stable on 21 and 22) **and** the
Signal Forms control contract; a control implements both at once. `touched` uses the **dual shape**
(`touched = model<boolean>()` set on interaction **plus** `touch = output<void>()`), covering the 21.x
`touchedChange` listener and the stable-22 `touch` output. `@angular/forms` is an **optional** peer:
non-form primitives don't pull it, the CVA controls need it on 21+22, and the opt-in `signal-forms` entry
needs the stable-22 `@angular/forms/signals` API — a soft, documented constraint (npm cannot express a
per-entry peer range).

(An earlier draft proposed dropping 21 / going Signal-Forms-only; that is recorded and **rejected** in
[ADR 0019](0019-signal-forms-only.md) — keeping CVA dual is cheap and avoids breaking the Reactive
ecosystem for a one-month-old API.)

### 3. Keep the framework-free shim in `core` (union-typed, covers 21 + 22)

Controls keep `implements RdxFormValueControl<T>` / `RdxFormCheckboxControl` against the **local** shim
(`core/src/signal-forms/form-control.ts`). Its `touched` stays union-typed
(`ModelSignal | InputSignal | OutputRef`) so the dual shape type-checks on both API generations; `errors`
stays `RdxValidationError[]`. The real `@angular/forms/signals` types are imported **only** inside the
`signal-forms` entry. Rationale: the shim is a compile-time guard against API drift (a control renaming
`value → modelValue` still fails `tsc`) that costs nothing at runtime and keeps the
`@angular/forms/signals` typing out of the control entries' public `.d.ts`.

### 4. Scope: adapters + the five conformant controls

This ADR delivers:

- the `[rdxSignalField]` + `[rdxSignalForm]` adapter pair;
- integration with the five already-conformant pilot controls: **input, radio, number-field, switch,
  checkbox**;
- Storybook stories + docs example (Signal Forms tab in the forms guide) + `skills:build` regen.

The shared `invalid` / `errors` / `touched` / `dirty` batch (readiness collisions #4) across the
remaining controls (select, combobox, autocomplete, toggle-group, checkbox-group, date/time-field,
editable, slider) was tracked as follow-up here. **Update (2026-06-22): that follow-up is complete** —
batch-#4 now ships on all 14 controls via the shared `RdxFormUiControlBase` / `createFormUiState` /
`RdxFormUiStateHost` mechanism (see the implementation note at the top of this ADR).

### Adapter design

Both adapters are thin: they read Signal Forms field state and **register a provider** through the
existing seam. They never own the model, never run validation, never wrap `[formField]`.

```html
<!-- field-level: the field is bound ONCE, on [formField]; rdxSignalField reads it from there -->
<div rdxFieldRoot>
  <label rdxFieldLabel>Email</label>
  <input rdxInput [formField]="loginForm.email" rdxSignalField />
  <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
</div>
```

`[rdxSignalField]` (selector `[formField][rdxSignalField]` — same host as the control, **not** the field
root, so there is **no duplicate binding**):

- reads the bound field's state from the co-located `[formField]` directive (`inject(FormField).state()`),
  and registers an `RdxFieldState` on the **ancestor** field context via `setStateProvider({ invalid,
disabled, required, dirty, touched, errors })` (e.g. `invalid: () => state().invalid()`,
  `errors: () => state().errors().map(…)`);
- leaves `filled` / `focused` to Field's DOM heuristic (partial ownership — the seam already supports it);
- on destroy rolls the slot back to the previous provider via `clearStateProvider(provider, previous)` —
  an **identity-checked** teardown that no-ops if a newer adapter already owns the slot (create-before-
  destroy during a view swap), so the old adapter's destroy can't clobber the new one.

`[rdxSignalForm]` (same host as `form[rdxFormRoot]`):

- registers an `RdxFormState` via the form context's `setStateProvider({ invalid, dirty, touched,
submitting, errorsFor })`;
- while it owns `errorsFor`, `RdxFormRoot`'s own `errors`-input + clear-on-edit machinery is inert by
  design (Signal Forms' `submit()` owns server-error application); the submit guard reads
  `provider.invalid()`, but first-invalid **focus** still uses the DOM-ordered field registry;
- must let an explicit `Field.name` win, since Signal Forms' path-derived names may not match server
  error keys.

The adapters **must not**: create or own the Signal Forms model; run validation; wrap or replace
`[formField]`; change `RdxFieldRoot` / `RdxFormRoot` input semantics; or be required by non-Signal-Forms
consumers.

## Consequences

### Positive

- Signal Forms becomes first-class without touching the headless core: `field` / `form` stay
  framework-agnostic and usable with Reactive, template-driven, Signal Forms, and custom controls.
- The `@angular/forms` peer is isolated to one opt-in entry; tree-shakeable.
- The shim keeps catching control-API regressions on CI while keeping the `@angular/forms/signals` typing
  out of the control entries.
- Additive, non-breaking: the dual control keeps Reactive / template-driven forms working unchanged on
  both Angular 21 and 22, with Signal Forms layered on top.

### Negative / Risks

- The dual `touched` shape (`model` + `touch` output) and CVA must be carried while Angular 21 is
  supported — slightly more per-control code than a 22-only control would need.
- The shim must be kept in sync with the real contract by hand (mitigated: it is a strict subset and
  `implements` against the real types is exercised inside the `signal-forms` entry's own specs).
- ~~The 🟡 controls bind through CVA until their batch-#4 lands.~~ **Resolved (2026-06-22):** batch-#4
  ships on all controls; every control now exposes the full optional `FormUiControl` surface.

## Alternatives Considered

- **Put adapters in `field` / `form` and add `@angular/forms` there.** Rejected: forces the Signal Forms
  peer onto every Field/Form consumer, including Reactive-only ones.
- **Flip the whole library to real `@angular/forms/signals` imports now.** Rejected for this pass: makes
  `@angular/forms` a peer of ~10 control entries for a compile-time `implements` that the shim already
  provides for free. Revisit if the shim drifts or if the real `ValidationError` union is needed in core.
- **Drop Angular 21 / go Signal-Forms-only.** Rejected — see [ADR 0019](0019-signal-forms-only.md).
  Keeping CVA dual on `^21 || ^22` is cheap and avoids hard-breaking the Reactive ecosystem; the cost is
  the dual `touched` shape, which is minor.
- **Stories-only, no adapter directives (ADR 0004's first option).** Rejected: the per-field mapping is
  repeated enough across controls that the directive pays for itself, and the seams to host it already
  exist.

## Implementation Plan

1. **Gate:** copy `docs/spikes/signal-forms-spike.spec.ts` into `packages/primitives/input/__tests__/`
   and re-run against stable Angular 22; confirm discovery + CVA precedence unchanged.
2. **Controls (pilot five — input, radio, checkbox, switch, number-field):** add the optional
   `FormUiControl` surface — `invalid` / `errors` / `touched` (dual `model` + `touch` output) / `dirty`,
   reflected as `data-*` + `aria-invalid`. Keep CVA.
3. **Shim:** keep `core/src/signal-forms/form-control.ts` union-typed (covers both API generations);
   re-confirm the five `implements` compile.
4. **Peer:** keep `@angular/core` at `^21.0.0 || ^22.0.0` and add `@angular/forms` at the same range as an
   **optional** peer (`peerDependenciesMeta`). No `ng-add` change — `@angular/forms` is Angular-family /
   opt-in; document that the `signal-forms` entry itself needs stable Angular 22.
5. **New entry:** scaffold `packages/primitives/signal-forms/` (`ng-package.json`, `index.ts`, register
   `@radix-ng/primitives/signal-forms` in `tsconfig.base.json` paths); implement `[rdxSignalField]` +
   `[rdxSignalForm]` importing the real `@angular/forms/signals` API.
6. **Add specs** for both adapters (provider registration, teardown/restore, `name`-wins, errors→messages).
7. **Stories + docs:** Signal Forms examples; correct stale `[field]`/`[control]` names in
   `forms.docs.mdx` to `[formField]`; `pnpm skills:build`.
8. Update `signal-forms-readiness.md` (mark prep #3/#5 closed against stable 22; move batch-#4 to the
   follow-up section).

## Trigger for Revisit

- ~~batch-#4 lands across the 🟡 controls~~ — **done (2026-06-22):** all 14 controls are fully
  conformant via `RdxFormUiControlBase` / `createFormUiState` / `RdxFormUiStateHost`;
- **the Angular-22 gate** — at the baseline bump, re-run the archived spike against stable 22 and swap
  the `core` shim (`form-control.ts`) for real `@angular/forms/signals` imports (then this Alternative
  "flip the whole library" is reconsidered);
- the shim drifts from the real contract, or the real `ValidationError` union is needed in `core`;
- Angular changes the Signal Forms control contract or the `[formField]` discovery rules.
