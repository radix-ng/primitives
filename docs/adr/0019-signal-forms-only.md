# ADR 0019: Standardize on Signal Forms — Remove CVA, Reactive/Template Support, and RdxFormRoot

> **REJECTED (2026-06-21).** Kept for the record. The full transition was considered and declined in
> favor of staying **dual** (CVA + Signal Forms), per [ADR 0018](0018-signal-forms-adapter.md). Reason:
> a control can implement both `ControlValueAccessor` and `FormValueControl`/`FormCheckboxControl` at once
> at low cost (proven — `switch` was already dual and works), and the form writes the `FormUiControl`
> surface into the directive regardless of the bound rung — so the rich Signal Forms surface is **not**
> lost by keeping CVA. Hard-breaking every Reactive/template-driven consumer to shed boilerplate for a
> one-month-old API was judged not worth it; CVA can be deprecated later once Signal Forms adoption is
> real. The form-family disposition below (keep `field`/`fieldset`, `form` overlaps Signal Forms) remains
> accurate regardless and informs the thin-`[rdxForm]` discussion.

- Status: Rejected (superseded by reaffirming ADR 0018)
- Date: 2026-06-20
- Decision owners: Radix NG maintainers
- Related packages: every form control entry, `packages/primitives/{field,form,core,signal-forms}`
- **Supersedes ADR 0004** (form-agnostic Field) and **re-scopes ADR 0018** (which assumed Signal Forms
  as an _optional, isolated_ adapter alongside CVA/Reactive support)

## Context

The decision chain so far:

- **ADR 0004** kept `Field` form-agnostic and deferred Signal Forms while it was experimental.
- **ADR 0018** (same day) decided to ship Signal Forms as an **optional** adapter pair
  (`[rdxSignalField]` + `[rdxSignalForm]`) in a dedicated `@radix-ng/primitives/signal-forms` entry,
  keeping the core free of `@angular/forms` so Reactive/template-driven and CVA consumers were untouched.
- The project now chooses to go **all-in on Signal Forms** and drop the classic form systems.

### Verified facts (2026-06-20, angular.dev)

- Signal Forms is stable in **Angular 22.0** (June 2026); binding directive is `[formField]`.
- Control contracts: `FormValueControl<T>` (`value = model<T>()`) / `FormCheckboxControl`
  (`checked = model<boolean>()`), both extending `FormUiControl` (optional `invalid`, `errors`,
  `touched` input + `touch: OutputRef<void>`, `dirty`, `disabled`, `required`, `readonly`, `name`,
  `min`/`max`/`minLength`/`maxLength`/`pattern`; optional `focus()`/`reset()`).
- **Decisive check:** a control implementing only `FormValueControl`/`FormCheckboxControl` is **not**
  usable with Reactive (`[formControl]`/`formControlName`) or template-driven (`ngModel`) forms — those
  still require `ControlValueAccessor`. There is **no** free "one contract serves all three systems"
  interop (the readiness-doc note claiming otherwise is inaccurate and is corrected by this ADR).

  → Therefore removing CVA genuinely removes Reactive/template-driven support. This is a hard break, not
  a cleanup.

### Current state being changed

- ~12 controls are **dual**: they provide CVA (`NG_VALUE_ACCESSOR` / `RdxControlValueAccessor`) **and**
  expose a `value`/`checked` model with `implements RdxFormValueControl`/`RdxFormCheckboxControl`.
- `core/src/signal-forms/form-control.ts` holds the **framework-free mirror shim** (built so controls
  could `implements` without importing `@angular/forms`).
- `field` and `form` carry provider seams (`RdxFieldState` / `RdxFormState` + `setStateProvider`).
- `@angular/forms` is an **optional** peer; the scaffolded `@radix-ng/primitives/signal-forms` entry
  hosts the optional adapters.

## Decision

From the next major, **Signal Forms is the only supported form-binding mechanism.** Concretely:

1. **Remove CVA from every control.** Drop `NG_VALUE_ACCESSOR` providers and `RdxControlValueAccessor`
   usage. Each control exposes its `value`/`checked` **model** plus the full `FormUiControl` optional
   surface, implementing the **real** `@angular/forms/signals` `FormValueControl<T>` /
   `FormCheckboxControl`.

2. **Drop the framework-free shim.** The isolation rationale is gone, so
   `core/src/signal-forms/form-control.ts` is removed (or thinned to re-exports) and controls import the
   real types. `@angular/forms` becomes a **required** peer; `@angular/core` narrows to `^22.0.0`.

3. **Retire `@radix-ng/primitives/form` (`RdxFormRoot`).** Angular's `form()` + `submit()` own the form
   layer (aggregate validity, submit lifecycle, server-error application, reset). _(Open sub-decision —
   recommendation below: keep a **thin** headless `[rdxForm]` for the DOM/a11y bits Signal Forms does not
   own: `novalidate`, aggregate `data-invalid/dirty/touched/submitting`, and DOM-ordered
   focus-first-invalid on a blocked submit.)_

4. **Couple `Field` to Signal Forms.** `Field` stops being form-agnostic: it reads the bound field's
   `FieldState` directly. The `RdxFieldState` provider seam is simplified or removed. _(Open sub-decision
   — recommendation below.)_

5. **Fold the integration into `field`/`form`; remove the separate adapter.** With the core no longer
   agnostic, the isolated `signal-forms` entry and the `[rdxSignalField]`/`[rdxSignalForm]` adapter
   directives lose their purpose. The just-scaffolded entry is repurposed or removed.

### Recommendations on the open sub-decisions

- **Form layer — keep a thin `[rdxForm]`, don't delete outright.** `novalidate`, the aggregate `data-*`
  attributes, and focus-first-invalid in DOM order are headless/a11y concerns Signal Forms does not
  provide. Recommendation: reduce `RdxFormRoot` to a thin directive that reads the Signal Forms form
  state and delegates submit to `submit()`, rather than removing the entry. (Alternative: delete and let
  consumers wire these themselves — rejected as a DX regression.)

- **Field integration — start with an explicit root input, evolve to control-forwarded.** Simplest first
  cut: `rdxFieldRoot` takes `[field]="form.email"` and reads `FieldState`. Better end-state: the control
  directive (`rdxInput`, …) that already carries `[formField]` forwards its `FieldState` up to `Field`
  via context, so the field is bound **once** on the control. Recommendation: ship the explicit input
  first, then move to control-forwarding (no second user-facing break).

## Consequences

### Positive

- One contract across the library. Large net deletion: no CVA boilerplate across ~12 controls, no shim,
  no dual-`touched`, no `RdxFormRoot` server-error/clear-on-edit machinery.
- Aligned with Angular's stated direction; simpler mental model and docs (one forms story, not three).
- Controls' value typing stops being distorted by CVA round-tripping.

### Negative / Risks

- **Hard break:** every Reactive/template-driven consumer loses form binding and must migrate to Signal
  Forms. No incremental path for holdouts.
- **Betting on a brand-new API:** Signal Forms shipped stable only in 22.0 (June 2026); real-world
  adoption and edge-case hardening are immature. The library's entire form story now rides on it.
- Wide migration surface: every control + its specs + stories + docs + skills bundle changes at once.
- Potential community pushback from teams not yet on Signal Forms / still on Angular < 22.

### Mitigations

- Ship as a clearly communicated **major** with a migration guide; keep the last CVA-supporting release
  on a maintenance line.
- If Reactive demand persists, a CVA compat layer can return later as a **separate, opt-in** entry
  (the inverse of this ADR), without re-coupling the core.

## Alternatives Considered

- **Keep the dual CVA + model strategy (ADR 0018).** Rejected by this decision — chosen full transition.
- **Drop only `RdxFormRoot`, keep CVA on controls.** Rejected (the narrower "moderate" scope was
  declined in favor of the full transition).
- **Bake Signal Forms into Field but keep CVA elsewhere.** Inconsistent half-measure; rejected.

## Migration Plan

1. **Gate:** re-run the archived spike on stable Angular 22 — confirm `value`/`checked` model binding and
   the `FormUiControl` writes (`errors`/`name`/`disabled`/…) on the directive path.
2. **core:** remove/relocate the shim; switch to real `@angular/forms/signals` types. Bump peers:
   `@angular/forms` required, `@angular/core` `^22`.
3. **Controls (per archetype — native-input, composite, checkbox/switch):** remove CVA; ensure the
   `value`/`checked` model; add the full `FormUiControl` surface (`invalid`/`errors`/`touched`+`touch`/
   `dirty`/`disabled`/`required`/`readonly`/`name`/limits); rewrite specs off CVA.
4. **Field:** couple to Signal Forms (explicit `[field]` input first), simplify the state seam, keep the
   ARIA wiring (`controlId`, label/description/error associations) intact.
5. **Form:** reduce `RdxFormRoot` to the thin `[rdxForm]` (or delete per the sub-decision).
6. **signal-forms entry:** fold integration into `field`/`form`; remove the adapter directives + entry if
   redundant; update `tsconfig.base.json` paths and `packages/primitives/package.json` peers.
7. **Stories/docs:** rewrite all forms examples to Signal Forms only; update `forms.docs.mdx`; run
   `pnpm skills:build`.
8. **Docs hygiene:** update `signal-forms-readiness.md`; correct the inaccurate "FormValueControl interops
   with Reactive without CVA" note.

## Worklist

### Form-family entries (the a11y layer — orthogonal to value binding)

| Entry                                                  | Role                                                                                         | Disposition                                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `field` (root / control / label / description / error) | ARIA associations (label↔control↔description↔error), `data-*` state                          | **Keep.** Signal Forms does not provide this. Re-point state source from the agnostic seam to reading `FieldState` directly. |
| `fieldset` (root / legend)                             | native `<fieldset>`/`<legend>` + disabled-as-a-group                                         | **Keep, ~unchanged.** No CVA and no value — pure DOM/a11y semantics SF does not replace.                                     |
| `form` (`RdxFormRoot`)                                 | submit interception, server errors by `name`, focus-first-invalid, reset, aggregate `data-*` | **Retire / reduce to a thin `[rdxForm]`** — `form()`/`submit()` cover most of it.                                            |

### Controls — strip CVA, leave a clean `FormValueControl` / `FormCheckboxControl`

```
switch  checkbox-root  checkbox-group  radio  number-field
combobox  autocomplete  slider  toggle-group
core/accessor/control-value-accessor.ts   ← RdxControlValueAccessor helper
core/accessor/provide-value-accessor.ts   ← remove once every control is off CVA
```

`input` is **already** CVA-free (native input + `value` model, batch-#4 done) → it is the reference
implementation. Pilot order: **`switch`** (simplest `FormCheckboxControl`) → the rest by archetype.

## Trigger for Revisit

- Signal Forms adoption stalls, or a breaking Signal Forms API change lands before this ships;
- strong, sustained demand for Reactive/template interop — revisit adding a CVA compat entry (opt-in,
  separate, non-core);
- the thin `[rdxForm]` proves to duplicate Signal Forms enough to delete it outright.
