# Radio — Base UI compatibility

Updated 2026-11-19 against Base UI **1.9.0** at
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
The Angular entry covers both **RadioGroup** and **Radio**. Menu RadioGroup has its own matrix.

G1 resolves initial selection and late defaults. G2 separates parent-owned selection from the
Angular form model and fixes rejected native activation. G3 aligns keyboard activation and
the focus position used by Tab. G4 covers native validation focus, which items submit, and Field
composition. G5 aligns the Indicator's transient CSS hooks and structural view lifetime.
G6 separates typed option identity from form serialization and verifies client hydration.
The [paired browser suite](../../../apps/parity-testing/primitives/radio/README.md)
compares the rendered state, native serialization and user interaction.

**Breaking changes are permitted.** Apply the [state ownership contract](../../../docs/engineering/state-ownership.md)
per field. Use the writable form model for Angular Forms and the readonly controlled input for parent
ownership. [ADR 0089](../../../docs/adr/0089-radio-selection-ownership.md) explains that boundary.

## Public parts

| Pinned counterpart                                                                                                                                    | Angular part                                                                                                     | Boundary                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [RadioGroup](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio-group/RadioGroup.tsx)              | [RdxRadioGroupDirective](src/radio-root.directive.ts)                                                            | One group-owned selection. Angular uses `controlledValue` for strict ownership and `value`/`valueChange` for the editable model, CVA and Signal Forms. Both expose `defaultValue`, `onValueChange`, `name`, `form`, `disabled`, `readOnly` and `required`. |
| [Radio.Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio/root/RadioRoot.tsx)                | [RdxRadioItemDirective](src/radio-item.directive.ts)                                                             | Consumer supplies the host. Angular infers a native button and requires a group. Both compare item values by strict equality. Angular reserves null for no selection. The pin also renders a standalone Root.                                              |
| Generated radio input per Root; `inputRef` on Root and Group                                                                                          | [RdxRadioItemInputDirective](src/radio-item-input.directive.ts) plus the group form bridge                       | Angular forwards an authored input through Item or Group `inputRef` and exposes it as `nativeInput()`. The form bridge serializes a selected, enabled, mounted item without an authored input.                                                             |
| [Radio.Indicator](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio/indicator/RadioIndicator.tsx) | [Indicator](src/radio-indicator.directive.ts) and [IndicatorPresence](src/radio-indicator-presence.directive.ts) | The attribute owns state and styling hooks. Add the structural directive to own the Angular view, with optional `keepMounted`. The attribute also supports consumer-owned hosts.                                                                           |

## Evidence and priorities

**S** = source audit, **U** = Angular unit, **B** = paired browser observation, **SSR** = Angular
server render. Each row is scoped to the stated contract.

| ID                                         | Status                                                | Evidence and remaining comparison                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — initial selection and defaults        | Resolved, scoped B/U/SSR                              | A defined model/form value wins, including `null` and `''`. An uncontrolled default seeds once, including the initially absent case. Later changes preserve selection. B checks ARIA and checked attributes, native checked state, FormData, silent request initialization/external writes and veto versus accepted click. U checks CVA, ngModel, Signal Forms and reset baselines. SSR checks selected markup for bound null, form null and default.                                                         |
| G2 — editable value and change transaction | Resolved ownership and activation defects, scoped B/U | `controlledValue` governs rendered and submitted state. B covers ignore/repeat, delay, replacement, clear, label veto/refusal, accepted native label edit and one Space activation on a native button. U covers canceled label rollback, trigger metadata, prevented click and controlled reset/release. Angular forwards the originating event. Native event trust and notification details are recorded separately. Broader callback order, Field touch timing and activation combinations remain in G3/G4. |
| G3 — native activation and composite focus | Resolved scoped B/U                                   | Native and custom hosts select on Space release. Composite owns arrow focus and supplies the actual navigation destination. B checks native Tab and re-entry, LTR/RTL and Shift arrows, wrap, disabled/read-only behavior, canceled requests, parent writes, Enter/Home/End and prevented Space keyup. U covers ignored arrows followed by unrelated focus and keyboard ownership for nested composed roots. Broader host variations, live collection/focus policies and devices remain open.                 |
| G4 — native forms, labels and Field state  | Partial, scoped B/U/SSR                               | B checks required submission and focus, native ownership and eligibility, Field labels and state, Fieldset legend, Group/Item refs, and validation timing. U covers deferred CVA edits and refreshing a live native constraint before submit. Eager hydration covers reset, refs and required submission. Additional nested field and portaled form combinations remain open.                                                                                                                                 |
| G5 — Indicator lifetime and CSS hooks      | Resolved for structural Indicator, scoped B/SSR       | Paired checks cover settled initial markup, transient enter, CSS exit, identity when reselected during exit, recreation after exit, no-motion removal and retained views. The attribute-only host retains its authored DOM and hides after exit. SSR checks selected and retained markup. Client hydration remains in G6.                                                                                                                                                                                     |
| G6 — values, collection and hydration      | Resolved, scoped B/U/SSR and hydration                | B checks typed value identity, equal form strings, same-name groups in separate forms, tracked reorder and focus, an orphaned selection and restoration on the same item. U covers object-valued Signal Forms. Browser hydration checks server node reuse, stable IDs and label links, focus, FormData and Indicator lifetime. Deferred Radio islands and repeated exact option values lie outside this comparison.                                                                                           |

Group exposes `role="radiogroup"`, `aria-required`, `aria-disabled` and `aria-readonly`. Item
exposes `role="radio"`, `aria-checked`, `data-composite-item-active`, `data-checked` and
`data-unchecked`. Group, item and indicator expose `data-disabled`, `data-readonly`,
`data-required` and the Field validity and interaction flags when composed with Field.
Indicator also exposes its motion hooks.

## G1 reset semantics

Native reset restores the initial resolved value of a standalone group. The snapshot is shared with
initial selection, so a conflicting or late `defaultValue` cannot change the baseline. A connected
`NgControl` resets through its Angular control, including a nullable Reactive Forms control's null
baseline or the initial value of a non-nullable control. Signal Forms `reset()` follows its own field
contract. Native reset in parent-owned mode preserves the current parent selection. Removing the
controlled input resumes the existing editable model and its original reset baseline. The paired
suite does not assert React/Angular reset equivalence.

## G3 keyboard focus

Composite seeds its tab stop from the checked item, or from the first enabled item when there is no
selection. It then owns the roving index independently of selection. Vetoes and ignored or external
controlled values preserve the last focus position. A checked disabled custom host can keep the
initial tab stop without accepting activation. The group removes its default tab stop when
disabled. Native disabled buttons retain the browser's disabled focus behavior.

Radio uses the shared Button activation with standalone Space timing on its composite item.
Only focus delivered by Composite arrow navigation can send a selection request. An ignored or
prevented key cannot leave a pending request for a later focus. A keyboard event may bubble after an
inner Radio move. The nearest actual Composite host owns it, including hosts composed by directives
that leave no DOM marker. Angular treats native `preventDefault()` as an arrow-navigation veto.
That cancellation is covered by an Angular regression alongside the paired focus outcomes.

The first Chromium run reproduced four local gaps including checked-disabled entry, external write
repositioning, custom Space on keydown and selection despite keyup prevention. The G3 comparison
adds twelve scenarios and preserves the earlier G1/G2 cases.

## G4 form and label composition

The same Composite registration used for keyboard navigation supplies the mounted radios for form
submission. A disabled or removed item can remain the logical selection, and contributes no
FormData entry. The optional authored native input handles browser constraints and label activation,
and redirects native focus to the visible radio. Its default ID derives from the item ID.

Field supplies the group name, label, description and displayed validity. Field.Item adds its own
description and label, associated with the item's native input in the paired custom-host case.
The first Chromium run reproduced four Angular failures covering invalid focus, stale submission and
missing Field associations. Base UI passed the same checkpoints.

Radio resolves its accessible label from explicit `aria-labelledby`, Field Label and the enclosing
Fieldset Legend, in that order. The paired fixture checks a live legend ID change, removal,
remounting and both overrides. The eager hydration fixture also checks the generated legend ID.

The Angular reset contract preserves Field's filled state for any restored selection, including an
empty-string option. The standalone editable group restores its starting value and a controlled
group keeps its parent value. Both clear interaction flags on reset. Cancellation preserves the
selection, field interaction state and external errors. The native reset assertions use the
Angular form contract from G1.

Group and Item forward their native radio through `inputRef` after browser rendering. The Group
uses the enabled selected input when available. On initialization or clearing it can pick an
eligible fallback. A detached representative clears its binding even when an unchecked sibling
remains mounted. Selection or a newly eligible registration can supply another input. Angular
releases a representative that becomes disabled and uses authored radio inputs for refs. Callback
references release previous bindings by calling the returned cleanup or passing `null`. These
refs remain independent of the registry that drives validation and form submission.

### Validation timing

Reactive Forms validators own the validation result in the Angular fixtures. Field reveals the
result on a whole-group blur, a committed value change or a Form submit, according to its mode.
Moving between radios leaves the blur boundary pending. Programmatic model writes reveal the
result in `onChange` mode even when the form is pristine, including a return to the initial value.
An `updateOn: 'blur'` control commits and becomes touched when focus leaves Radio Group.

The paired submit case checks that both implementations return focus to a visible radio.
Angular focused the checked Beta item and Base UI focused Alpha in all three engines. Base UI
selects its focus target from the eligible validation inputs. These tests compare display timing
and form outcomes with Angular-owned validators and Base UI's Field validator.

### Native required constraints

Radio Group publishes browser `valueMissing` errors from its mounted, authored native inputs
to Field. The Form registry refreshes this result before submission, and Field uses its own
validation mode to reveal the message and associated ARIA state. A blocked submit focuses the
first visible radio with an eligible invalid input.

The paired fixtures cover successful recovery, disabling a fieldset, changing the native form
owner and removing the registered items. A disabled but checked radio can satisfy the browser's
required constraint while being absent from submitted values. Angular derives FormData and
native constraint participation from native form ownership. Portaled inputs without a native
owner remain outside this scoped comparison.

## G5 Indicator view and motion

`*rdxRadioIndicatorPresence` on the Indicator host owns its Angular view through the shared
[render lifecycle](../../../docs/adr/0084-signal-render-lifecycle.md). The host registers as an
animation participant. An outgoing view stays mounted during CSS motion. Reselecting it interrupts
exit and preserves the same view. After exit the structural owner destroys the view, or retains it
when configured with `{ keepMounted: true }`.

Existing attribute-only templates retain the authored host. The host hides after exit by default and
stays displayed with `keepMounted`. Both compositions use transient `data-starting-style` and
`data-ending-style` hooks. Apply settled styling through `data-checked` and `data-unchecked`.
The paired suite checks lifecycle milestones. Exact frame timing of the hooks during reversal is
outside the comparison.

## G6 value identity and live collections

Both sides compare selected values by strict equality. An object or array selected through Angular
Forms, the editable model or `controlledValue` keeps its reference. Angular reserves `null` for
no selection and uses `undefined` to release `controlledValue`. Give each option a distinct value.

Native Radio inputs and the fallback form bridge serialize a single item with the same rules. A
string passes through, an object is serialized in full, and an array produces one JSON form entry.
Browser comparisons cover equal serialized strings for distinct values. The tracked move keeps
the same item and focus. Updating its bound value can temporarily leave the model selection without
a matching item. Restoring that value makes it selectable and submittable again without a new request.

The [AOT hydration fixture](../../../apps/radix-ssr-testing/hydration-audit/README.md) verifies
claiming the actual server group, items, labels, inputs and both kinds of Indicator. The audit
checks focus and the tab stop after boot and exercises keyboard and native label selection after
hydration. A reselected Indicator keeps its server node during exit, and a completed exit removes
its view before the next selection creates a new node.

## Verification

```bash
pnpm test-parity radio
pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/radio/__tests__
pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts -t Radio
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-radio
pnpm agents:check
```

Initial Chromium comparison reproduced two Angular failures: `bound-null` and `initially-empty`.
The expanded suite passed **45 scenarios × 3 engines (135 comparisons)**, without
expected-difference exceptions. Checkpoints compare selection, FormData and request value/reason.
Raw observations retain the originating event and native notifications. Angular uses the actual
host or native input event. Base UI forwards a visible host click through its hidden input.
[Radio unit suite](__tests__/radio.spec.ts): **42 passing tests**.
[SSR render suite](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts): **3 focused passes**.
[Storybook behavior suite](../../../apps/visual-regression/tests/radio.behavior.spec.ts):
**2 scenarios × 3 engines** for Default motion, interrupted exit and reduced motion.
