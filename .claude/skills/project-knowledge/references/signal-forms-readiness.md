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
> default, and — strategically big — **`FormValueControl` now interops with
> Reactive and template-driven forms without CVA**. The two interfaces remain
> mutually exclusive at the type level (`checked?: undefined` /
> `value?: undefined`).

CVA stays for Reactive/Template forms; a control can implement **both** CVA and
`FormValueControl`/`FormCheckboxControl` at once, enabling additive migration.

Prerequisite for shipping real integration: **Angular 22** (the API is
experimental in 21). Everything in [Prep work](#prep-work-doable-on-angular-21)
is version-independent.

## Conformance matrix

| Control (file)                                                      | Target interface                          | Required signal                    | Optional already present                                                                                                                                               | Missing                                                                 | Collisions / risk                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **checkbox-root** (`checkbox/src/checkbox-root.ts`)                 | `FormCheckboxControl`                     | `checked = model<boolean>` ✅      | `disabled`, `readonly`, `required`, `name`                                                                                                                             | `invalid`, `errors`, `touched`, `dirty`                                 | 🟢 **`implements RdxFormCheckboxControl` ✅** (compiles) — `value` split (#1) + `indeterminate` split (#2): `checked` is now `model<boolean>`, mixed state moved to a separate `indeterminate = model<boolean>`                                                                                                                                                                                                                                                                                                   |
| **checkbox-group** (`checkbox/src/checkbox-group.ts`)               | `FormValueControl<string[]>`              | `value = model` ✅                 | `disabled`                                                                                                                                                             | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name` | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **switch-root** (`switch/src/switch-root.ts`)                       | `FormCheckboxControl`                     | `checked = model<boolean>` ✅      | `disabled`, `required`, `readonly`, `name`                                                                                                                             | `invalid`, `errors`, `touched`, `dirty`                                 | 🟢 **`implements RdxFormCheckboxControl` ✅** (compiles) — `value` collision resolved by the #2 split (`submitValue`, aliased `value`); `checked` is already `model<boolean>`                                                                                                                                                                                                                                                                                                                                     |
| **radio-root** (`radio/src/radio-root.directive.ts`)                | `FormValueControl<string \| null>`        | `value = model` ✅                 | `disabled`, `readonly`, `required`, `name`                                                                                                                             | `invalid`, `errors`, `touched`, `dirty`                                 | 🟢 most ready — **`implements RdxFormValueControl<string \| null>` ✅** (compiles)                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **select-root** (`select/src/select-root.ts`)                       | `FormValueControl<AcceptableValue…>`      | `value = model` ✅                 | `disabled`                                                                                                                                                             | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name` | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **toggle-group** (`toggle-group/src/toggle-group-base.ts`)          | `FormValueControl<string[]>`              | `value = model<string[]>` ✅       | `disabled`                                                                                                                                                             | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`, `name` | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **slider-root** (`slider/src/slider-root.ts`)                       | `FormValueControl<number \| number[]>`    | `value = model` ✅                 | `disabled`, `min`, `max`, `name`, `form`                                                                                                                               | `required`, `readonly`, `invalid`, `errors`, `touched`, `dirty`         | 🟢 Base UI rewrite renamed `modelValue`→`value`, added `name`/`form`, uses `core` `_IdGenerator`; value is a `number \| number[]` union (single/range)                                                                                                                                                                                                                                                                                                                                                            |
| **number-field-root** (`number-field/src/number-field-root.ts`)     | `FormValueControl<number \| null>`        | `value = model<number \| null>` ✅ | `disabled`, `readonly`, `required`, `min`, `max`, `name`, `form`                                                                                                       | `invalid`, `errors`, `touched`, `dirty`                                 | 🟢 Base UI rewrite — **`implements RdxFormValueControl<number \| null>` ✅** (compiles); `null` = empty value, added `name`/`form` + hidden `[rdxNumberFieldHiddenInput]`, uses `core` `_IdGenerator`. `readOnly`→`readonly` to match the interface                                                                                                                                                                                                                                                               |
| **input** (`input/src/input.directive.ts`)                          | `FormValueControl<string>`                | `value = model<string>` ✅         | **full `FormUiControl` surface** ✅ (`disabled`, `readonly`, `required`, `invalid`, `errors`, `touched` **model**, `dirty`, `name`, `minLength`/`maxLength`/`pattern`) | —                                                                       | 🟢 **batch #4 pilot — COMPLETE + runtime-verified by the spike (2026-06-11).** ⚠️ Breaking: `RdxInputValue` narrowed `string \| number \| readonly string[]` → `string` (native inputs round-trip strings; the union broke Signal Forms two-way typing). `pattern` reflects to the native attr only when exactly one regex. `touched = model(false)` + `touch` output, both emitted on blur (dual shape: 21.x listens to `touchedChange`, stable 22 to `touch`); `dirty` input merges with internal edit tracking |
| **date-field-root** (`date-field/src/date-field-root.directive.ts`) | `FormValueControl<DateValue>`             | `value = model` ✅                 | `disabled`, `readonly`                                                                                                                                                 | `required`, `invalid`, `errors`, `touched`, `dirty`, `name`, `min/max`  | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **time-field-root** (`time-field/src/time-field-root.directive.ts`) | `FormValueControl<TimeValue>`             | `value = model` ✅                 | `disabled`, `readonly`                                                                                                                                                 | `required`, `invalid`, `errors`, `touched`, `dirty`, `name`, `min/max`  | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **editable-root** (`editable/src/editable-root.ts`)                 | `FormValueControl<string>`                | `value = model<string>` ✅         | `disabled`, `readonly`, `required`, `maxLength`                                                                                                                        | `invalid`, `errors`, `touched`, `dirty`, `name`, `minLength`, `pattern` | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **combobox-root** (`combobox/src/combobox-root.ts`)                 | `FormValueControl<ComboboxValue \| null>` | `value = model` ✅                 | `disabled`, `readonly`, `required`                                                                                                                                     | `invalid`, `errors`, `touched`, `dirty`, `name`                         | 🟡 CVA implemented (`NG_VALUE_ACCESSOR`); exposes a **separate** `inputValue = model<string>` for the typed query, distinct from the selected `value` object. Not yet `implements` — homogeneous batch #4 (`invalid/errors/touched/dirty` + `name`), copy the input pilot                                                                                                                                                                                                                                         |
| **autocomplete-root** (`autocomplete/src/autocomplete-root.ts`)     | `FormValueControl<string>`                | `value = model<string>` ✅         | `disabled`, `required`                                                                                                                                                 | `invalid`, `errors`, `touched`, `dirty`, `readonly`, `name`             | 🟡 CVA implemented (`NG_VALUE_ACCESSOR`); the form value **is** the input string (no separate selection object, unlike combobox), so `FormValueControl<string>` is a clean target. Not yet `implements` — batch #4; `touched` set on blur belongs in `RdxAutocompleteInput`                                                                                                                                                                                                                                       |

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

- 🟢 **input — fully conformant and runtime-verified** (batch #4 pilot complete:
  entire optional `FormUiControl` surface, `touched` as model; bound end-to-end
  by the spike spec).
- 🟢 **radio, number-field, switch, checkbox** — `implements` applied and
  compiles. radio/number-field via prep #3; **switch** via the `value`
  split (#1); **checkbox** via the `value` split (#1) + `indeterminate` split (#2).
  Still missing the batch-#4 optional members — copy the input pilot pattern.
- 🟡 **select, combobox, autocomplete, toggle-group, checkbox-group, date/time-field, editable, slider** — need `invalid/errors/touched/dirty` (+ `required/name` where missing; slider may also add optional `required`/`readonly`). Copy the input pilot pattern. **combobox**/**autocomplete** already ship CVA and the `value` model (autocomplete's value is the input string; combobox keeps a separate `inputValue`), so they are a clean `FormValueControl` target — only the batch-#4 optional surface is missing.
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
5. ✅ **Runtime spike — DONE for 21.x experimental** (2026-06-11; was the
   mandatory gate from the ADR 0004 amendment). 9 specs (custom-control
   discovery of `rdxInput`, value round-trip, errors/name delivery, touched on
   blur, CVA path via switch) ran green against 21.2.9; the spec is **archived
   at `docs/spikes/signal-forms-spike.spec.ts`** out of the test glob — it
   pinned the experimental API, and the stable-22 contract diff is already
   known and documented. At the Angular 22 bump: copy back into
   `input/__tests__/`, re-run against stable (the last gate step), then swap
   the `core` shim for real imports (prep #3 note). See "Open question —
   ANSWERED" above for the findings.
6. ✅ **Remove CDK from the form path** — done as part of removing `@angular/cdk`
   from the whole library. `BooleanInput`/`NumberInput` now come from
   `@radix-ng/primitives/core` (`core/src/types.ts`), id generation uses the `core`
   `injectId`/`RdxIdGenerator`, and the remaining non-form usages were replaced too
   (`RdxLiveAnnouncer`, `isPlatformBrowser`, the `Direction` type). `@angular/cdk` is
   no longer a peer dependency. See `architecture.md` for the full breakdown.

Progress: **1 ✅ → 2 ✅ → 3 ✅ → 4 ✅** done, **plus** both structural collisions
resolved — the `value` split (switch + checkbox) and the checkbox `indeterminate`
split. All five clean controls (radio, input, number-field, switch, checkbox)
now `implements` and compile. **6** (CDK removal from the form path) is done — CDK
is fully removed from the library. Remaining: the shared **`invalid`/`errors`/
`touched`/`dirty` batch** (collisions #4) across the 🟡 controls; **5** (spike) —
now a **mandatory gate** before the Angular 22 bump is announced as Signal
Forms-compatible. Note: `implements` is a **compile-time** guarantee — runtime
binding of `[formField]` to these directives stays unverified until the spike.

## Form layer (shipped 2026-06-11)

`RdxFormRoot` (`@radix-ng/primitives/form`, `form[rdxFormRoot]`) ships with an
**`RdxFormState`** provider seam — the form-level counterpart of prep #4
(`invalid`/`dirty`/`touched`/`submitting`/`errorsFor`, structural accessors,
`setStateProvider`/`hasStateProvider`). `RdxFieldState` also gained an optional
`errors` accessor (`() => RdxValidationError[]`) so Signal Forms
`ValidationError[]` _content_ (not just the invalid boolean) flows into
`rdxFieldError` (`messages()`, provider messages before Form messages). The
Angular 22 adapter then becomes a pair: `[rdxSignalField]` (ADR 0004) +
`[rdxSignalForm]` (registers an `RdxFormState`). Signal Forms' `submit()` owns
the submit lifecycle and server-error application — while an `RdxFormState`
provider owns `errorsFor`, Form's own `errors`-input/clear-on-edit machinery is
inert by design; the submit guard reads `provider.invalid()` when owned, but
first-invalid **focus** always uses the DOM-ordered field registry. Adapters must
allow an explicit `Field.name` to win, since Signal Forms' path-derived names may
not match server error keys. Entry direction is `field` → `form` (Form never
imports Field; the registration interface uses structural `() =>` accessors to
keep the ng-packagr graph acyclic).

## Related

- Angular docs: [Custom controls](https://angular.dev/guide/forms/signals/custom-controls),
  [`FormValueControl`](https://angular.dev/api/forms/signals/FormValueControl),
  [`FormField`](https://angular.dev/api/forms/signals/FormField)
- See `architecture.md` for the completed CDK removal referenced in prep #6.
