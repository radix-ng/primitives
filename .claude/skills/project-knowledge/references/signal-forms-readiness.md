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
replacement that we plug into. The `[formField]` directive discovers the control on
its host, detects which interface it structurally implements, and binds form
state through signals:

- `FormValueControl<T>` — control exposes `value = model<T>()`. For text inputs,
  selects, radios, sliders, date/number fields — anything editing a single value.
- `FormCheckboxControl` — control exposes `checked = model<boolean>()`. A control
  implementing this **must NOT** also expose a `value` member.

Both extend `FormUiControl`, which adds optional state as plain signals:

| Kind      | Names                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model()` | `value` / `checked` (the only required member); `touched` (preferred shape — see note)                                                                                                    |
| `input()` | `disabled`, `readonly`, `required`, `invalid`, `hidden`, `pending`, `dirty`, `errors` (`ValidationError[]`), `disabledReasons`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `name` |

> **Stable Angular 22 verified (2026-06-11, angular.dev/api/forms/signals —
> "stable since v22.0"; supersedes both earlier snapshots).** Signal Forms went
> stable in **22.0.0 (released June 2026)** after the extended preview in
> 21.1/21.2. The `touched` contract changed at stabilization: 21.2.9's
> implementation listens to a `touched` **model**'s `touchedChange`, while
> stable 22 reverted to a plain `touched` **input** plus a separate
> **`touch: OutputRef<void>`** output. The dual shape — `touched = model(false)`
> set on blur **plus** an emitted `touch` output — satisfies both generations
> (`ModelSignal` extends `InputSignalWithTransform`, so it type-checks as the 22
> input; each runtime listens to its own notification). 22 also adds an optional
> **`reset(): void`** method, `markAsTouched()` now marks **descendants** by
> default. **Correction (2026-06-21):** an earlier note here claimed `FormValueControl`
> interops with Reactive / template-driven forms _without_ CVA — that is **wrong**
> (verified against angular.dev/guide/forms/signals/custom-controls): a control
> implementing only `FormValueControl` / `FormCheckboxControl` still needs
> `ControlValueAccessor` for Reactive / template-driven binding. This is exactly why
> controls stay **dual** (CVA + Signal Forms) — see ADR 0018. The two interfaces remain
> mutually exclusive at the type level (`checked?: undefined` / `value?: undefined`).

CVA stays for Reactive/Template forms; a control can implement **both** CVA and
`FormValueControl`/`FormCheckboxControl` at once, enabling additive migration.

The shipping prerequisite was **Angular 22** (the API is experimental in 21);
the workspace now satisfies it. Everything in
[Prep work](#prep-work-doable-on-angular-21) remains version-independent.

## Current shipped integration (2026-07-11)

The Angular 22 gate is complete. The opt-in `@radix-ng/primitives/signal-forms`
entry now ships both adapters:

- `rdxSignalField` maps authoritative field state and errors into `Field`.
- `rdxSignalForm` maps aggregate form state and name-routed errors into `Form`.
- `rdxSignalSubmit` optionally delegates native submit to Angular's public
  `submit()` lifecycle. Without it, the existing Base UI-style
  `(onFormSubmit)` path is unchanged.

All controls expose Angular's optional `pending` input. Pending is carried
through the internal state seams as neutral validity (neither `data-valid` nor
`data-invalid`); applications render progress directly from Angular's
`field().pending()` signal. See ADR 0018 and ADR 0020.

All 14 controls are runtime-covered for `FieldState.reset(value)`: the model and
visible control value are restored, Angular touched/dirty return to false, and
control-owned interaction tracking is cleared. Dual controls receive reset
through Angular's CVA path plus the form-owned `dirty=false` write; Signal-only
controls also expose the optional custom-control `reset()` hook. The public
support matrix lives in `packages/primitives/signal-forms/stories/signal-forms.docs.mdx`.

## Conformance matrix

| Control (file)                                                      | Target interface                          | Required signal                    | Optional already present                                                                                                                                               | Missing                                                            | Collisions / risk                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **checkbox-root** (`checkbox/src/checkbox-root.ts`)                 | `FormCheckboxControl`                     | `checked = model<boolean>` ✅      | `disabled`, `readonly`, `required`, `name`                                                                                                                             | `invalid`, `errors`, `touched`, `dirty`                            | 🟢 **`implements RdxFormCheckboxControl` ✅** (compiles) — `value` split (#1) + `indeterminate` split (#2): `checked` is now `model<boolean>`, mixed state moved to a separate `indeterminate = model<boolean>`                                                                                                                                                                                                                                                                                                                                                      |
| **checkbox-group** (`checkbox/src/checkbox-group.ts`)               | `FormValueControl<string[]>`              | `value = model` ✅                 | `disabled`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                                                    | `required`, `readonly`, `name`                                     | 🟢 **batch #4 DONE — `extends RdxFormUiControlBase`, `implements RdxFormValueControl<string[]>` ✅**. **Dual** — CVA implemented directly; `formUiTouchTarget()` bridges `onTouched`, `markDirty()` in `emit()`. Uses `RdxFormUiStateHost` for the `aria-invalid`/`data-*`/`focusout` reflection on the `role=group` host                                                                                                                                                                                                                                            |
| **switch-root** (`switch/src/switch-root.ts`)                       | `FormCheckboxControl`                     | `checked = model<boolean>` ✅      | `disabled`, `required`, `readonly`, `name`                                                                                                                             | `invalid`, `errors`, `touched`, `dirty`                            | 🟢 **`implements RdxFormCheckboxControl` ✅** (compiles) — `value` collision resolved by the #2 split (`submitValue`, aliased `value`); `checked` is already `model<boolean>`                                                                                                                                                                                                                                                                                                                                                                                        |
| **radio-root** (`radio/src/radio-root.directive.ts`)                | `FormValueControl<string \| null>`        | `value = model` ✅                 | `disabled`, `readonly`, `required`, `name`                                                                                                                             | `invalid`, `errors`, `touched`, `dirty`                            | 🟢 most ready — **`implements RdxFormValueControl<string \| null>` ✅** (compiles)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **select-root** (`select/src/select-root.ts`)                       | `FormValueControl<AcceptableValue…>`      | `value = model` ✅                 | `disabled`, `required`, `readOnly`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                            | `name` (no native form submission), `readonly` casing (`readOnly`) | 🟢 **batch #4 DONE — `implements RdxFormValueControl<AcceptableValue \| AcceptableValue[] \| undefined>` ✅** (compiles). **Dual** — a direct `ControlValueAccessor` keeps the root's `value = model()` as the single state owner; runtime specs cover Reactive Forms, `ngModel`, disabled state, reset, cancellation, and multiple object values. State lives on the **trigger** (the combobox button), OR-ed from the root context + Field context; `markAsTouched()` bridges the CVA callback + model + `touch` on trigger blur; `dirty` is tracked in `setValue` |
| **toggle-group** (`toggle-group/src/toggle-group-base.ts`)          | `FormValueControl<string[]>`              | `value = model<string[]>` ✅       | `disabled`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                                                    | `required`, `readonly`, `name`                                     | 🟢 **batch #4 DONE — `implements RdxFormValueControl<string[] \| undefined>` ✅** (compiles). **Dual** — CVA implemented directly on the base (not via `RdxControlValueAccessor`). Uses the shared `createFormUiState` helper; `markAsTouched()` bridges the CVA `onTouched` + `touched` model + `touch`, fired on `focusout`; `dirty` tracked in `toggle()`. State (`aria-invalid` + `data-*`) on the `role=group` host (radio-group parity)                                                                                                                        |
| **slider-root** (`slider/src/slider-root.ts`)                       | `FormValueControl<number \| number[]>`    | `value = model` ✅                 | `disabled`, `min`, `max`, `name`, `form`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                      | `required`, `readonly`                                             | 🟢 **batch #4 DONE — `extends RdxFormUiControlBase`**. **Does NOT `implements RdxFormValueControl`**: the value is a `number \| number[]` union while `min`/`max` are scalar `number`s, and the shim ties `min`/`max` to `NonNullable<TValue>` (collision); the runtime contract still holds. **Dual** (CVA host directive); `formUiTouchTarget()` bridges the CVA, `markDirty()` in `setValue`, `markAsTouched()` on input interaction + `RdxFormUiStateHost` `focusout` on the `role=group` host                                                                   |
| **number-field-root** (`number-field/src/number-field-root.ts`)     | `FormValueControl<number \| null>`        | `value = model<number \| null>` ✅ | `disabled`, `readonly`, `required`, `min`, `max`, `name`, `form`                                                                                                       | `invalid`, `errors`, `touched`, `dirty`                            | 🟢 Base UI rewrite — **`implements RdxFormValueControl<number \| null>` ✅** (compiles); `null` = empty value, added `name`/`form` + hidden `[rdxNumberFieldHiddenInput]`, uses `core` `_IdGenerator`. `readOnly`→`readonly` to match the interface                                                                                                                                                                                                                                                                                                                  |
| **input** (`input/src/input.directive.ts`)                          | `FormValueControl<string>`                | `value = model<string>` ✅         | **full `FormUiControl` surface** ✅ (`disabled`, `readonly`, `required`, `invalid`, `errors`, `touched` **model**, `dirty`, `name`, `minLength`/`maxLength`/`pattern`) | —                                                                  | 🟢 **batch #4 pilot — COMPLETE + runtime-verified by the spike (2026-06-11).** ⚠️ Breaking: `RdxInputValue` narrowed `string \| number \| readonly string[]` → `string` (native inputs round-trip strings; the union broke Signal Forms two-way typing). `pattern` reflects to the native attr only when exactly one regex. `touched = model(false)` + `touch` output, both emitted on blur (dual shape: 21.x listens to `touchedChange`, stable 22 to `touch`); `dirty` input merges with internal edit tracking                                                    |
| **date-field-root** (`date-field/src/date-field-root.directive.ts`) | `FormValueControl<DateValue>`             | `value = model` ✅                 | `disabled`, `readonly`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                                        | `required`, `name`, `min/max`                                      | 🟢 **batch #4 DONE — `extends RdxFormUiControlBase`, `implements RdxFormValueControl<DateValue \| undefined>` ✅**. **No CVA** (Signal-Forms-only). `invalidState` = the built-in range/availability `isInvalid()` **OR** the form-driven invalid (reflected on root + segments); `markAsTouched()` on segment `focusout`; dirty via a `watch` on `value` gated by a "user focused a segment" flag (excludes the form/initial seed)                                                                                                                                  |
| **time-field-root** (`time-field/src/time-field-root.directive.ts`) | `FormValueControl<TimeValue>`             | `value = model` ✅                 | `disabled`, `readonly`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                                        | `required`, `name`, `min/max`                                      | 🟢 **batch #4 DONE — same as date-field** (`extends RdxFormUiControlBase`, `implements RdxFormValueControl<TimeValue \| undefined>`, no CVA, combined `invalidState`, dirty via gated `watch`)                                                                                                                                                                                                                                                                                                                                                                       |
| **editable-root** (`editable/src/editable-root.ts`)                 | `FormValueControl<string>`                | `value = model<string>` ✅         | `disabled`, `readonly`, `required`, `maxLength`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                               | `name`, `minLength`, `pattern`                                     | 🟢 **batch #4 DONE — `extends RdxFormUiControlBase`, `implements RdxFormValueControl<string \| undefined>` ✅**. **No CVA** (Signal-Forms-only). State reflected on `rdxEditableArea` (`data-*`) and `rdxEditableInput` (`aria-invalid`); `markAsTouched()` on `submit()`/`cancel()` (leaving edit mode); `markDirty()` in `submit()` only when the committed value actually changed                                                                                                                                                                                 |
| **combobox-root** (`combobox/src/combobox-root.ts`)                 | `FormValueControl<ComboboxValue \| null>` | `value = model` ✅                 | `disabled`, `readonly`, `required`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                            | `name`                                                             | 🟢 **batch #4 DONE — `extends RdxFormUiControlBase`, `implements RdxFormValueControl<ComboboxValue \| null>` ✅**. **Dual** (`NG_VALUE_ACCESSOR`); `formUiTouchTarget()` bridges `onTouched`, `markDirty()` in `commitValue`. State surfaced via the shared **context** (`invalidState`/`touchedState`/`dirtyState`) and reflected on `RdxComboboxInput` (the `role=combobox` element); `markAsTouched()` on input blur                                                                                                                                              |
| **autocomplete-root** (`autocomplete/src/autocomplete-root.ts`)     | `FormValueControl<string>`                | `value = model<string>` ✅         | `disabled`, `required`, `readonly`, `invalid`, `errors`, `touched` model + `touch`, `dirty`                                                                            | `name`                                                             | 🟢 **batch #4 DONE — `extends RdxFormUiControlBase`, `implements RdxFormValueControl<string>` ✅**. **Dual** (`NG_VALUE_ACCESSOR`); the form value **is** the input string. `formUiTouchTarget()` bridges `onTouched`, `markDirty()` in `commitValue`; `RdxAutocompleteInput` reads the root's state and reflects it + `markAsTouched()` on blur                                                                                                                                                                                                                     |

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
   (`RdxControlValueAccessor.valueInput`/`value`, composite `*Input` aliases).
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
   - `state` → `indeterminateState() ? 'indeterminate' :
checkedState() ? 'checked' : 'unchecked'` (a `state` computed kept as an internal
     helper; the **shipped** checkbox exposes boolean `data-checked`/`data-unchecked`/
     `data-indeterminate` host attributes, not a `data-state` enum — see `architecture.md`).
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
   batch — close it with one shared pattern (see prep #3). **Pilot landed on
   `input` (runtime-verified 2026-06-11)**: the pattern to copy is — `errors`
   input feeding the `invalidState` computed; **`touched = model(false)` set on
   blur PLUS a `touch = output<void>()` emitted on blur** (dual shape: 21.x
   listens to the model's `touchedChange`, stable 22 listens to `touch`);
   `dirty` input merged with internally tracked edit state into `dirtyState`
   (+ `data-touched`/`data-dirty`); `name` reflected to the native attribute.
   Includes one breaking type narrow (`RdxInputValue` → `string`) justified by
   Signal Forms two-way typing.

## Readiness ranking

- 🟢 **input, radio, checkbox, switch, number-field — fully conformant** (batch #4
  complete: optional `FormUiControl` surface — `invalid` / `errors` / `touched`
  model + `touch` output / `dirty`, reflected as `data-*` + `aria-invalid`; Signal
  Forms value binding verified in specs). Per-control notes:
  - **input** — runtime-verified by the spike; native-input archetype.
  - **radio** — group root; `touched` set + `touch` emitted on `focusout`, `dirty`
    tracked on select.
  - **checkbox** — state on both the root and `rdxCheckboxButton` (`aria-invalid` on
    the button); `touched` + `touch` and `dirty` set on toggle (visible control is the
    button, so blur is unreliable — interaction-based, matching the CVA `markAsTouched`).
  - **switch** — root **is** the button (role=switch), so `aria-invalid` sits there;
    unified `markAsTouched()` fires the CVA + `touched` model + `touch` output on blur
    (root button and the hidden input), `dirty` tracked on toggle.
  - **number-field** — `div` root (role=group); `data-*` on the root and input,
    `aria-invalid` on the input (combined with the existing required+empty heuristic);
    `markAsTouched()` on input blur, `dirty` tracked in `applyValue`.

All five keep CVA (dual: Reactive/template-driven **and** Signal Forms).

- 🟢 **select — batch #4 DONE + dual forms support** (optional `FormUiControl` surface reflected as
  `data-*` + `aria-invalid` on the **trigger**; Signal Forms value/reset binding verified in
  `select-attributes.spec.ts`). Its direct `ControlValueAccessor` keeps `value = model()` as the single
  state owner and adds Reactive Forms / `ngModel`; `select-forms.spec.ts` runtime-covers form-owned
  writes, disabled state, user changes, touched, cancellation, reset, and multiple object arrays.
  `markAsTouched()` bridges the CVA callback + touched model + `touch`; `dirty` is tracked in `setValue`.
- 🟢 **toggle-group — batch #4 DONE** (optional `FormUiControl` surface on the `role=group` host;
  `aria-invalid` + `data-*` there, radio-group parity). **Dual** — CVA is implemented directly on
  `RdxToggleGroupBase`, so `markAsTouched()` bridges the CVA `onTouched` _and_ the `touched` model +
  `touch` (Signal Forms), fired on `focusout`. First control built on **both** shared mechanisms (see
  below): `createFormUiState` for the derivation and the `RdxFormUiStateHost` host directive for the
  `data-*`/`aria-invalid`/`focusout` reflection. Signal Forms value binding verified in
  `toggle-group.spec.ts`.
- 🟢 **checkbox-group — batch #4 DONE** (`extends RdxFormUiControlBase`; `RdxFormUiStateHost` reflects
  `aria-invalid`/`data-*` + `focusout` on the `role=group` host; dual via direct CVA). Signal Forms
  value binding verified in `checkbox-group.spec.ts`.
- 🟢 **slider — batch #4 DONE** (`extends RdxFormUiControlBase`; `RdxFormUiStateHost` on the `role=group`
  host; dual via the CVA host directive). Skips the compile-time `implements RdxFormValueControl` because
  the `number | number[]` value union collides with the shim's scalar `min`/`max` coupling. Signal Forms
  value binding verified in `slider.spec.ts`.
- 🟢 **combobox, autocomplete — batch #4 DONE** (both `extends RdxFormUiControlBase`, `implements`,
  dual via `NG_VALUE_ACCESSOR`). The form binds to the **root** (CVA + value), so the optional state
  lives there and is reflected on the **input** part (`role=combobox`): combobox via the shared context
  (`invalidState`/`touchedState`/`dirtyState`), autocomplete via the injected root. `markAsTouched()`
  fires on input blur; `markDirty()` in `commitValue`. Verified in `combobox-forms.spec.ts` /
  `autocomplete-forms.spec.ts`.
- 🟢 **date-field, time-field — batch #4 DONE** (both `extends RdxFormUiControlBase`, `implements`,
  **no CVA** — Signal-Forms-only). The combined `invalidState` merges the built-in range/availability
  check with the form-driven invalid and is reflected on the root and segments; `markAsTouched()` on
  segment focus-out; dirty via a `watch` on `value` gated by a "user focused a segment" flag so the
  form/initial seed is excluded. Verified in `date-field.spec.ts` / `time-field.spec.ts`.
- 🟢 **editable — batch #4 DONE** (`extends RdxFormUiControlBase`, **no CVA** — Signal-Forms-only).
  State reflected on `rdxEditableArea` (`data-*`) and `rdxEditableInput` (`aria-invalid`);
  `markAsTouched()` on leaving edit mode (`submit`/`cancel`), `markDirty()` in `submit()` only on an
  actual value change. Verified in `editable-root.directive.spec.ts`.

**🎉 Batch #4 is COMPLETE across every form control** — `invalid`/`pending`/`errors`/`touched`/`dirty` (+ the
`touch` output) ship on all of: input, radio, checkbox, switch, number-field, select, toggle-group,
checkbox-group, slider, combobox, autocomplete, date-field, time-field, editable. The Angular 22 gate
and real `@angular/forms/signals` adapter entry have landed. Remaining conformance work is the optional
secondary surface (`name` / `required` / `readonly` / `min`/`max` where a control still lacks them).

### Shared batch-#4 mechanisms (`@radix-ng/primitives/core`)

Three reusable pieces remove the per-control duplication. **On the base `@Directive()`, June 2026:**
**select, switch, radio, number-field, toggle-group, checkbox-group, slider, combobox, autocomplete,
date-field, time-field, editable** all `extends RdxFormUiControlBase` (compodoc resolves the inherited
inputs, so ArgTypes/api-contract are intact). slider extends the base but skips the `implements` check
(union value vs scalar `min`/`max`).

- **`RdxFormUiControlBase`** (abstract `@Directive()`) — declares the optional `FormUiControl` inputs
  (`invalid`/`pending`/`errors`/`touched`/`dirty` + `touch` output) **once** and builds `formUi` from them, so a
  control inherits the whole surface with one `extends`. Inputs must live on a decorated directive
  class (the Angular compiler only discovers `input()`/`model()` as field initializers, and Signal
  Forms binds form-written state onto the single directive that carries the `value`/`checked` model) —
  inheritance keeps them on that directive, which a host directive could not. The control still
  declares its own `value`/`checked` model and overrides `formUiTouchTarget()` to bridge its CVA.
  Limitation: one `extends` slot — fine for the form roots (most extend nothing); toggle-group already
  had a base, so it is a 3-level chain (`RdxToggleGroup → RdxToggleGroupBase → RdxFormUiControlBase`),
  which works.
- **`createFormUiState({ invalid, pending, errors, touched, touch, dirty, cva? })`** → `{ invalidState,
pendingState, touchedState, dirtyState, markAsTouched, markDirty }`. The derivation + dual `markAsTouched` engine
  the base calls (also usable directly by a control that cannot extend the base). Compound controls
  also get `RdxFormUiStateContext` + `formUiStateContext()` to spread the five state fields into their
  context for child parts (select → trigger).
- **`RdxFormUiStateHost`** host directive + **`provideFormUiState(() => inject(MyControl).formUi)`** —
  owns the identical `aria-invalid` + `data-invalid/valid/touched/dirty` bindings and the
  `(focusout)="markAsTouched()"` listener, reading the state from DI. Compose it via `hostDirectives`
  on controls whose own host element carries the attributes (toggle-group uses it; switch/radio/
  number-field keep their own bindings because their touched-trigger differs — switch/number-field
  blur, radio's `relatedTarget` guard). **Not** for compound controls that reflect on a child part via
  context (select → trigger). `providers`/`hostDirectives` are not inherited, so for the
  inheritance-based toggle-group both concrete subclasses wire it.
- 🔴 none of the structural blockers remain — what's left is the homogeneous
  `invalid/errors/touched/dirty` batch (collisions #4) across the 🟡 controls.

## Open question — ANSWERED by the runtime spike (2026-06-11, vs 21.2.9)

~~Whether the binding directive discovers a directive-based control via DI~~ —
**resolved: yes.** Spike spec (9 specs, green vs 21.2.9) is **archived at
`docs/spikes/signal-forms-spike.spec.ts`**, out of the test glob — keeping a pin
on the experimental API in CI was noise once stable 22 was known to differ.
Copy it back into `input/__tests__/` and re-run against stable 22 at the
workspace bump (the remaining gate step). Findings:

- **Attribute directives ARE discovered as custom controls.** `@angular/core`
  scans **all directives on the node** (not just the host component) and picks
  the first with a `value`/`checked` model (`initializeCustomControlStatus`).
  `<input rdxInput [formField]>` runtime-verified: form writes the directive's
  `value` model; typing flows back; `errors`/`name`/`disabled` are written into
  the directive's inputs via `setInputOnDirectives`.
- **Path precedence: CVA → custom control → native.** CVA injected
  `{ self: true }` → our CVA controls (switch/checkbox/radio/…) bind through
  CVA; runtime-verified with `button[rdxSwitchRoot]`.
- **`touched` notification differs per generation** — 21.2.9 listens to a
  `touched` model's `touchedChange`; **stable 22 reverted to a `touch` output**
  (verified against the v22.0 API docs the same day). Resolution: `rdxInput`
  ships the **dual shape** — `touched = model(false)` set on blur plus a
  `touch = output<void>()` — covering both runtimes; the shim documents this.
  Bonus fix: `rdxSwitchRoot` marks touched on button blur (was only on the
  hidden input's blur — a gap that also hit Reactive Forms).
- **Wrapper components are unnecessary** — that rung is pruned from ADR 0004's
  fallback ladder.

The gate is satisfied for the 21.x experimental API; re-run the spike + one-pass
naming re-verification against stable Angular 22 before claiming compatibility.

### Naming / API drift (re-verify in one pass on stable Angular 22)

Project documents disagree because they snapshot different points of the
experimental API: ADR 0004 and current angular.dev use **`[formField]`**; this
document and `forms.docs.mdx` have used `[field]` / `[control]` in places.
Member shapes drift too: `touched` has been observed both as a form-written
`input()` + separate `touch` output (earlier snapshot of this document) and as a
control-owned `model()` (June 2026 custom-controls guide). Treat every name in
this file as provisional; the `implements` checks in the matrix are compile-time
guarantees against **our shim**, which itself must be re-verified against the
stable API before the Angular 22 bump.

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
5. ✅ **Runtime integration gate — DONE.** The original 21.2.9 experimental
   spike remains archived at `docs/spikes/signal-forms-spike.spec.ts`. The
   shipped primitive suites now cover custom-control discovery, value
   round-trip, validation state, errors/name delivery, touched/dirty, pending,
   and the opt-in submission lifecycle against stable Angular 22.
6. ✅ **Remove CDK from the form path** — done as part of removing `@angular/cdk`
   from the whole library. `BooleanInput`/`NumberInput` now come from
   `@radix-ng/primitives/core` (`core/src/types.ts`), id generation uses the `core`
   `injectId`/`RdxIdGenerator`, and the remaining non-form usages were replaced too
   (`RdxLiveAnnouncer`, `isPlatformBrowser`, the `Direction` type). `@angular/cdk` is
   no longer a peer dependency. See `architecture.md` for the full breakdown.

Progress: **1 ✅ → 2 ✅ → 3 ✅ → 4 ✅ → 5 ✅ → 6 ✅**. Both structural collisions
are resolved, the shared form UI state (including `pending`) ships across the
control set, runtime `[formField]` integration is covered by the primitive
suites on Angular 22, and CDK is fully removed from the library.

## Form layer (shipped 2026-06-11)

`RdxFormRoot` (`@radix-ng/primitives/form`, `form[rdxFormRoot]`) ships with an
**`RdxFormState`** provider seam — the form-level counterpart of prep #4
(`invalid`/`dirty`/`touched`/`submitting`/`errorsFor`, structural accessors,
`setStateProvider`/`hasStateProvider`). `RdxFieldState` also gained an optional
`errors` accessor (`() => RdxValidationError[]`) so Signal Forms
`ValidationError[]` _content_ (not just the invalid boolean) flows into
`rdxFieldError` (`messages()`, provider messages before Form messages). The
Angular 22 adapter is a pair: `[rdxSignalField]` (ADR 0004) + `[rdxSignalForm]`
(registers an `RdxFormState`). Adding `rdxSignalSubmit` delegates native
submission to Angular's public `submit()` lifecycle; otherwise the Base UI-style
`(onFormSubmit)` lifecycle stays active. Angular submission errors flow through
Signal Forms field state. Form's own `errors` input remains a separate eager
Base UI-compatible channel and clears on edit independently. The submit guard
reads provider state, while first-invalid **focus** always uses the DOM-ordered
field registry. Adapters allow an explicit `Field.name` to win, since Signal
Forms' path-derived names may not match server error keys. Entry direction is
`field` → `form` (Form never imports Field; the registration interface uses
structural `() =>` accessors to keep the ng-packagr graph acyclic).

## Related

- Angular docs: [Custom controls](https://angular.dev/guide/forms/signals/custom-controls),
  [`FormValueControl`](https://angular.dev/api/forms/signals/FormValueControl),
  [`FormField`](https://angular.dev/api/forms/signals/FormField)
- See `architecture.md` for the completed CDK removal referenced in prep #6.
