---
name: signal-forms-readiness
description: Conformance matrix and backlog for adopting Angular Signal Forms (@angular/forms/signals) across Radix NG form controls
metadata:
  type: project
---

# Signal Forms readiness

Tracks how close each Radix NG form control is to Angular **Signal Forms**
(`@angular/forms/signals`, stable in Angular 22) and what prep can land on
Angular 21 today.

## Background

Signal Forms is a **parallel mechanism to `ControlValueAccessor`**, not a
replacement that we plug into. The `[field]` directive discovers the control on
its host, detects which interface it structurally implements, and binds form
state through signals:

- `FormValueControl<T>` — control exposes `value = model<T>()`. For text inputs,
  selects, radios, sliders, date/number fields — anything editing a single value.
- `FormCheckboxControl` — control exposes `checked = model<boolean>()`. A control
  implementing this **must NOT** also expose a `value` member.

Both extend `FormUiControl`, which adds optional state as plain signals:

| Kind       | Names                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model()`  | `value` / `checked` (the only required member)                                                                                                                                                       |
| `input()`  | `disabled`, `readonly`, `required`, `invalid`, `hidden`, `pending`, `touched`, `dirty`, `errors` (`ValidationError[]`), `disabledReasons`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `name` |
| `output()` | `touch` (`OutputRef<void>` — control notifies the form it was touched)                                                                                                                               |

> Verified against `angular.dev/api/forms/signals/FormValueControl` (June 2026):
> `touched`/`dirty` are **inputs** the form writes into (not `model()`s the control
> owns), and the touched **notification** is a separate `touch` output. The two
> interfaces are mutually exclusive at the type level — `FormValueControl` declares
> `checked?: undefined` and `FormCheckboxControl` declares `value?: undefined`, so a
> control carrying the wrong member fails to compile.

CVA stays for Reactive/Template forms; a control can implement **both** CVA and
`FormValueControl`/`FormCheckboxControl` at once, enabling additive migration.

Prerequisite for shipping real integration: **Angular 22** (the API is
experimental in 21). Everything in [Prep work](#prep-work-doable-on-angular-21)
is version-independent.

## Conformance matrix

| Control (file)                                                      | Target interface                       | Required signal                    | Optional already present                                         | Missing                                                                         | Collisions / risk                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------- | -------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **checkbox-root** (`checkbox/src/checkbox-root.ts`)                 | `FormCheckboxControl`                  | `checked = model<boolean>` ✅      | `disabled`, `readonly`, `required`, `name`                       | `invalid`, `errors`, `touched`, `dirty`                                         | 🟢 **`implements RdxFormCheckboxControl` ✅** (compiles) — `value` split (#1) + `indeterminate` split (#2): `checked` is now `model<boolean>`, mixed state moved to a separate `indeterminate = model<boolean>`                                     |
| **checkbox-group** (`checkbox/src/checkbox-group.ts`)               | `FormValueControl<string[]>`           | `value = model` ✅                 | `disabled`                                                       | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name`         | —                                                                                                                                                                                                                                                   |
| **switch-root** (`switch/src/switch-root.ts`)                       | `FormCheckboxControl`                  | `checked = model<boolean>` ✅      | `disabled`, `required`, `readonly`, `name`                       | `invalid`, `errors`, `touched`, `dirty`                                         | 🟢 **`implements RdxFormCheckboxControl` ✅** (compiles) — `value` collision resolved by the #2 split (`submitValue`, aliased `value`); `checked` is already `model<boolean>`                                                                       |
| **radio-root** (`radio/src/radio-root.directive.ts`)                | `FormValueControl<string \| null>`     | `value = model` ✅                 | `disabled`, `readonly`, `required`, `name`                       | `invalid`, `errors`, `touched`, `dirty`                                         | 🟢 most ready — **`implements RdxFormValueControl<string \| null>` ✅** (compiles)                                                                                                                                                                  |
| **select-root** (`select/src/select-root.ts`)                       | `FormValueControl<AcceptableValue…>`   | `value = model` ✅                 | `disabled`                                                       | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name`         | —                                                                                                                                                                                                                                                   |
| **toggle-group** (`toggle-group/src/toggle-group-base.ts`)          | `FormValueControl<string[]>`           | `value = model<string[]>` ✅       | `disabled`                                                       | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name`         | —                                                                                                                                                                                                                                                   |
| **slider-root** (`slider/src/slider-root.ts`)                       | `FormValueControl<number \| number[]>` | `value = model` ✅                 | `disabled`, `min`, `max`, `name`, `form`                         | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`                 | 🟢 Base UI rewrite renamed `modelValue`→`value`, added `name`/`form`, uses `core` `_IdGenerator`; value is a `number \| number[]` union (single/range)                                                                                              |
| **number-field-root** (`number-field/src/number-field-root.ts`)     | `FormValueControl<number \| null>`     | `value = model<number \| null>` ✅ | `disabled`, `readonly`, `required`, `min`, `max`, `name`, `form` | `invalid`, `errors`, `touched`, `dirty`                                         | 🟢 Base UI rewrite — **`implements RdxFormValueControl<number \| null>` ✅** (compiles); `null` = empty value, added `name`/`form` + hidden `[rdxNumberFieldHiddenInput]`, uses `core` `_IdGenerator`. `readOnly`→`readonly` to match the interface |
| **input** (`input/src/input.directive.ts`)                          | `FormValueControl<RdxInputValue>`      | `value = model` ✅                 | `disabled`, `required`, **`invalid`** ✅                         | `readonly`, `errors`, `touched`, `dirty`, `minLength/maxLength/pattern`, `name` | 🟢 only control that already has `invalid` — **`implements RdxFormValueControl<RdxInputValue \| undefined>` ✅** (compiles)                                                                                                                         |
| **date-field-root** (`date-field/src/date-field-root.directive.ts`) | `FormValueControl<DateValue>`          | `value = model` ✅                 | `disabled`, `readonly`                                           | `required`, `invalid`, `errors`, `touched`, `dirty`, `name`, `min/max`          | —                                                                                                                                                                                                                                                   |
| **time-field-root** (`time-field/src/time-field-root.directive.ts`) | `FormValueControl<TimeValue>`          | `value = model` ✅                 | `disabled`, `readonly`                                           | `required`, `invalid`, `errors`, `touched`, `dirty`, `name`, `min/max`          | —                                                                                                                                                                                                                                                   |
| **editable-root** (`editable/src/editable-root.ts`)                 | `FormValueControl<string>`             | `value = model<string>` ✅         | `disabled`, `readonly`, `required`, `maxLength`                  | `invalid`, `errors`, `touched`, `dirty`, `name`, `minLength`, `pattern`         | —                                                                                                                                                                                                                                                   |

## Collisions to resolve by design (Angular 21)

1. ✅ **Forbidden-`value` member — RESOLVED for checkbox + switch (#2).**
   `FormCheckboxControl` forbids a `value` member (it reserves `value` for
   `FormValueControl` via `value?: undefined`). Both controls exposed
   `value = input('on')` as the native HTML submit value, which broke
   `implements` with `TS2416: Type 'InputSignal<string>' is not assignable to
type 'undefined'`.
   **Fix applied:** rename the TS member to `submitValue` while keeping the
   public binding via `input<string>('on', { alias: 'value' })`. The class no
   longer has a `value` property (satisfies `value?: undefined`); consumers'
   `[value]` templates are unchanged (Base UI parity — Base UI's Checkbox.Root
   keeps a public `value` prop); the context key stays `value`, so the hidden
   `*-input`/button parts are untouched. This is the established repo idiom
   (`RdxControlValueAccessor.valueInput`/`value`, roving-focus `*Input` aliases).
   Verified: `nx build primitives` green, switch + checkbox suites pass (38),
   plus new switch specs asserting `[value]` still reaches the hidden input.
2. ✅ **checkbox `indeterminate` — RESOLVED (clean break, Base UI parity).**
   `checked` is now `model<boolean>` and mixed state lives in a separate
   `indeterminate = model<boolean>`, so checkbox `implements
RdxFormCheckboxControl` and compiles. Effective state is split into
   `checkedState`/`indeterminateState` computeds (the group `parent` derives
   both from `group.parentState()`); `state`/button `aria-checked`/hidden
   input/indicator/presence all read the two booleans. Toggle resolves an
   indeterminate click to `checked = true` and clears `indeterminate`.
   `CheckedState`/`getState`/`isIndeterminate` remain as **internal** helpers for
   the group's tri-state `parentState`. **Breaking:** `[checked]="'indeterminate'"`
   → `[indeterminate]="true"`; migrated the `checkbox-indeterminate` /
   `checkbox-select-all` / `checkbox-presence` stories and the root spec.
   Verified: `nx build primitives` + `build-storybook` green, checkbox suite
   29 passing (incl. a new orthogonality spec). The design that produced this:

   **Design (Base UI parity).** Base UI models indeterminate as a _separate_
   `indeterminate: boolean` prop with `checked: boolean` (verified at
   base-ui.com/react/components/checkbox, June 2026), which is exactly the
   `FormCheckboxControl` shape. Target:
   - `checked = model<boolean>(false)` (was `CheckedState`) — the CVA `valueInput`
     aliased to `checked` becomes `boolean`; this also makes Reactive Forms see a
     plain `boolean` instead of the odd `CheckedState`.
   - `indeterminate = model<boolean>(false)` — **new, orthogonal**, not part of
     the submitted value, so no CVA channel.
   - `onCheckedChange` keeps emitting `boolean` (already does).

   **Effective state** (context-exposed computeds; group parent state is _derived_,
   not a settable model, so it can't simply "be a boolean" — split how the root
   consumes it):
   - `checkedState: Signal<boolean>` — parent → `group.parentState() === true`;
     child → `group.value().includes(name)`; standalone → `!!cva.value()`.
   - `indeterminateState: Signal<boolean>` — parent → `group.parentState() ===
'indeterminate'`; else → `this.indeterminate()`.
   - `state` (`data-state`) → `indeterminateState() ? 'indeterminate' :
checkedState() ? 'checked' : 'unchecked'`.
   - `CheckedState`/`getState`/`isIndeterminate` stay as **internal** helpers for
     `group.parentState()` — only the public `checked` member changes type.

   **Consumer parts to update:** `button` `aria-checked` → `indeterminate() ?
'mixed' : checked()`; `input` → `input.indeterminate = indeterminate()`;
   `indicator` `[hidden]` → `!checked() && !indeterminate()` and presence
   `present` → `checked() || indeterminate()`.

   **Toggle semantics:** clicking an indeterminate checkbox resolves to
   `checked = true` **and** clears `indeterminate` (native + Base UI behavior);
   the `[(indeterminate)]` model writes back so a controlled consumer stays in
   sync. Standalone non-indeterminate click flips the boolean as today.

   **Open wiring nuance to resolve in implementation:** today the root declares
   both `checked = model<CheckedState>()` _and_ a hostDirective alias
   `inputs: ['value:checked']` — i.e. `[checked]` binds to two inputs and the
   effective state is read from the CVA, not the model. Consolidate to a single
   source (CVA as the boolean checked source for Reactive Forms; public `checked`
   model synced to it) while adding the separate `indeterminate` model.

   ⚠️ **Breaking public API change** (decision: clean break, applied).
   `[checked]="'indeterminate'"` → `[indeterminate]="true"`; `checked`'s type
   narrowed `CheckedState → boolean`. Ship under a major version / changelog note.

3. ✅ **slider — resolved by the Base UI rewrite.** `modelValue` was renamed to
   `value = model<number | number[]>()` (with `name`/`form` added and the CDK
   `_IdGenerator` swapped for the `core` one), so the control now satisfies
   `FormValueControl`'s required signal. Remaining gap is only the shared
   `invalid`/`errors`/`touched`/`dirty` batch (#4). Nuance: the value is a
   `number | number[]` union (single thumb vs range), so `FormValueControl<T>` is
   parameterised on the union rather than a fixed shape.
4. 🟡 **Most controls lack `invalid`/`errors`/`touched`/`dirty`.** Homogeneous
   batch — close it with one shared pattern (see prep #3).

## Readiness ranking

- 🟢 **radio, input, number-field, switch, checkbox** — `implements` applied and
  compiles. radio/input/number-field via prep #3; **switch** via the `value`
  split (#1); **checkbox** via the `value` split (#1) + `indeterminate` split (#2).
- 🟡 **select, toggle-group, checkbox-group, date/time-field, editable, slider** — need `invalid/errors/touched/dirty` (+ `required/name` where missing; slider may also add optional `required`/`readonly`).
- 🔴 none of the structural blockers remain — what's left is the homogeneous
  `invalid/errors/touched/dirty` batch (collisions #4) across the 🟡 controls.

## Open question (not answered by the matrix)

All these controls are **directives**; Signal Forms examples are **components**.
Whether `[field]` binds to a directive-based control via DI is the key technical
risk — resolved only by a spike (prep #5).

## Prep work doable on Angular 21

Ordered by value/risk:

1. **Inventory + matrix** — this document. Keep it the living backlog.
2. ✅ **Resolve the structural collisions** (collisions #1 + #2) — **done.** The
   `value` split (`submitValue`/`value` alias) landed switch + checkbox; the
   checkbox `indeterminate` split (separate `model<boolean>`) then cleared
   checkbox's last blocker. Both now `implements RdxFormCheckboxControl`.
3. ✅ **Local shim interfaces in `core`** — **done.**
   `core/src/signal-forms/form-control.ts` declares `RdxFormValueControl<T>`,
   `RdxFormCheckboxControl`, the shared `RdxFormUiControl` base, an
   `RdxFormStateInput<T>` helper (`InputSignal<T> | InputSignalWithTransform`),
   and a placeholder `RdxValidationError` — all **without importing**
   `@angular/forms/signals`. Exported from the `core` barrel. The two control
   interfaces are mutually exclusive (`checked?: undefined` / `value?: undefined`)
   so the wrong member fails `tsc`. Applied `implements` to the three clean
   pilots — **radio, input, number-field** — and `pnpm primitives:build` passes.
   Attempting it on **switch** surfaced an un-recorded `value` collision (its
   `value = input('on')` triggered `TS2416`); that was then resolved by the #2
   split, so switch now `implements RdxFormCheckboxControl` too. Swap the shim
   for the real `@angular/forms/signals` imports once the baseline moves to
   Angular 22.
4. ✅ **Decouple `Field` from the native `.value` heuristic** — **done.**
   `field-root.ts` now exposes an `RdxFieldState` interface (optional
   `() => boolean` accessors for `invalid/disabled/required/dirty/touched/
filled/focused`) and the context gains `setStateProvider(provider | null)`
   plus a `hasStateProvider` signal. Each `*State` computed resolves
   **per-state**: a registered provider's accessor wins, otherwise it falls
   back to the existing root input / DOM-derived value. This lets a future
   `[rdxSignalField]` adapter (ADR 0004) feed authoritative form state in —
   including **partial ownership** (own `invalid/touched/dirty` from Signal
   Forms, leave `filled/focused` to the DOM heuristic) — without changing
   `RdxFieldRoot`'s input semantics or coupling Field to `@angular/forms`.
   `setStateProvider` returns the previous provider for clean teardown.
   The DOM heuristic in `rdxFieldControl`/`rdxInput` is untouched and stays the
   default; provider precedence simply makes its writes inert for owned states.
   Covered by 5 new specs in `field.directive.spec.ts`. Version-independent.
5. **Learning spike (not for merge)** — Signal Forms exists as experimental in 21. Build a throwaway sandbox to confirm `[field]` discovery against a
   directive-based control. Experimental API may differ from stable 22.
6. **Remove CDK from the form path** — `BooleanInput` from `@angular/cdk/coercion`
   (`control-value-accessor.ts:1`, `field-control`, etc.). `switch-root` already
   moved off CDK `_IdGenerator` to the `core` generator during its Base UI rewrite.
   Pure prep, aligns with the documented CDK phase-out, shrinks the upgrade surface.

Progress: **1 ✅ → 2 ✅ → 3 ✅ → 4 ✅** done, **plus** both structural collisions
resolved — the `value` split (switch + checkbox) and the checkbox `indeterminate`
split. All five clean controls (radio, input, number-field, switch, checkbox)
now `implements` and compile. Remaining: the shared **`invalid`/`errors`/`touched`/
`dirty` batch** (collisions #4) across the 🟡 controls; **6** (CDK removal from the
form path) as an isolated side PR; **5** (spike) optional before the Angular 22
bump. Note: `implements` is a **compile-time** guarantee — runtime binding of
`[control]` to these directives stays unverified until the spike / Angular 22.

## Related

- Angular docs: [Custom controls](https://angular.dev/guide/forms/signals/custom-controls),
  [`FormValueControl`](https://angular.dev/api/forms/signals/FormValueControl),
  [`FormField`](https://angular.dev/api/forms/signals/FormField)
- See `architecture.md` for the CDK phase-out plan referenced in prep #6.
