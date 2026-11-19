# Radio — Base UI compatibility

Updated 2026-11-19 against Base UI **1.9.0** at
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
The Angular entry covers both **RadioGroup** and **Radio**. Menu RadioGroup has its own matrix.

G1 resolves initial selection and late defaults. G2 separates parent-owned selection from the
Angular form model and fixes rejected native activation. G3 aligns keyboard activation and
the focus position used by Tab. The [paired browser suite](../../../apps/parity-testing/primitives/radio/README.md) compares rendered
selection, native serialization and the outcomes of accepted, refused and canceled requests.

**Breaking changes are permitted.** Apply the [state ownership contract](../../../docs/engineering/state-ownership.md)
per field. Use the writable form model for Angular Forms and the readonly controlled input for parent
ownership. [ADR 0089](../../../docs/adr/0089-radio-selection-ownership.md) explains that boundary.

## Public parts

| Pinned counterpart                                                                                                                                    | Angular part                                                                               | Boundary                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [RadioGroup](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio-group/RadioGroup.tsx)              | [RdxRadioGroupDirective](src/radio-root.directive.ts)                                      | One group-owned selection. Angular uses `controlledValue` for strict ownership and `value`/`valueChange` for the editable model, CVA and Signal Forms. Both expose `defaultValue`, `onValueChange`, `name`, `form`, `disabled`, `readOnly` and `required`. |
| [Radio.Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio/root/RadioRoot.tsx)                | [RdxRadioItemDirective](src/radio-item.directive.ts)                                       | Consumer supplies the host. Angular infers a native button and requires a group. The pin also renders a standalone Root and supports arbitrary value identity. Angular item values are strings.                                                            |
| Generated radio input per Root; `inputRef` on Root and Group                                                                                          | [RdxRadioItemInputDirective](src/radio-item-input.directive.ts) plus the group form bridge | Angular's authored input is optional. It enables native constraints and implicit label activation. The group supplies serialized entries when the selected item has no registered input.                                                                   |
| [Radio.Indicator](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio/indicator/RadioIndicator.tsx) | [RdxRadioIndicatorDirective](src/radio-indicator.directive.ts)                             | Both expose `keepMounted`, with different view lifetimes. See G5.                                                                                                                                                                                          |

## Evidence and priorities

**S** = source audit, **U** = Angular unit, **B** = paired browser observation, **SSR** = Angular
server render. Each row is scoped to the stated contract.

| ID                                         | Status                                                | Evidence and remaining comparison                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — initial selection and defaults        | Resolved, scoped B/U/SSR                              | A defined model/form value wins, including `null` and `''`. An uncontrolled default seeds once, including the initially absent case. Later changes preserve selection. B checks ARIA and checked attributes, native checked state, FormData, silent request initialization/external writes and veto versus accepted click. U checks CVA, ngModel, Signal Forms and reset baselines. SSR checks selected markup for bound null, form null and default.                                                         |
| G2 — editable value and change transaction | Resolved ownership and activation defects, scoped B/U | `controlledValue` governs rendered and submitted state. B covers ignore/repeat, delay, replacement, clear, label veto/refusal, accepted native label edit and one Space activation on a native button. U covers canceled label rollback, trigger metadata, prevented click and controlled reset/release. Angular forwards the originating event. Native event trust and notification details are recorded separately. Broader callback order, Field touch timing and activation combinations remain in G3/G4. |
| G3 — native activation and composite focus | Resolved scoped B/U                                   | Native and custom hosts select on Space release. Composite owns arrow focus and supplies the actual navigation destination. B checks native Tab and re-entry, LTR/RTL and Shift arrows, wrap, disabled/read-only behavior, canceled requests, parent writes, Enter/Home/End and prevented Space keyup. U covers ignored arrows followed by unrelated focus and keyboard ownership for nested composed roots. Broader host variations, live collection/focus policies and devices remain open.                 |
| G4 — native forms, labels and Field state  | Partial, S/B/U                                        | B compares one named local form with authored Angular inputs. U also covers an external form, generated fallback, implicit label and reset. Compare constraints, invalid focus, external-form changes, removed/disabled selected items, nesting and label/description wiring. The pin routes Radio through Field/Fieldset and forwards representative inputs. Angular primarily exposes validation/interaction state on Group and has no equivalent generated per-item input/ref contract.                    |
| G5 — Indicator lifetime and CSS hooks      | Source divergence                                     | The pin retains an exiting view until motion completes, then unmounts unless kept. Angular keeps the authored element, hides it synchronously by default and uses persistent checked/unchecked state as starting/ending hooks. Compare initial state, appearance, exit, reopen and retained view identity before changing part ownership.                                                                                                                                                                     |
| G6 — values, collection and hydration      | Partial, S/SSR                                        | The Angular group accepts `string \| null`; Base UI also compares non-string identities before serialization. Compare dynamic item identity, duplicate tokens, reorder/removal, orphan selection and isolated groups. SSR checks initial markup only. Client hydration, IDs, focus and retained/animated Indicator coverage remain open.                                                                                                                                                                      |

Group exposes `role="radiogroup"`, `aria-required`, `aria-disabled`, `aria-readonly` and local
validation/interaction attributes. Item exposes `role="radio"`, `aria-checked`,
`data-composite-item-active`, `data-checked`, `data-unchecked`, `data-disabled`, `data-readonly`
and `data-required`. Indicator mirrors item state plus its motion hooks. The pin's Item and
Indicator also expose Field validity and interaction state. No Radio CSS variable contract was found
in either implementation. These are source observations beyond the attributes asserted in G1.

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

## Verification

```bash
pnpm test-parity radio
pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/radio/__tests__
pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts -t 'resolves Radio form'
pnpm agents:check
```

Initial Chromium comparison reproduced two Angular failures: `bound-null` and `initially-empty`.
The expanded suite passed **27 scenarios × 3 engines (81 comparisons)**, without
expected-difference exceptions. Checkpoints compare selection, FormData and request value/reason.
Raw observations retain the originating event and native notifications. Angular uses the actual
host or native input event. Base UI forwards a visible host click through its hidden input.
[Radio unit suite](__tests__/radio.spec.ts): **33 passing tests**.
[SSR render suite](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts): **1 focused pass**.
