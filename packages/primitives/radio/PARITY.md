# Radio — Base UI compatibility

Updated 2026-11-19 against Base UI **1.9.0** at
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
The Angular entry covers both **RadioGroup** and **Radio**. Menu RadioGroup has its own matrix.

The first increment resolves initial selection and late defaults. The
[paired browser suite](../../../apps/parity-testing/primitives/radio/README.md) covers rendered
selection, native serialization and the selection outcome of click cancellation. Angular tests
also cover initial form writes and reset.

**Breaking changes are permitted.** Apply the [state ownership contract](../../../docs/engineering/state-ownership.md)
per field. Keep the writable form model where Angular Forms requires it. Resolve strict parent
ownership separately if it is needed, without mirroring the selection in two writable stores.
Update an existing ADR if a later increment replaces an accepted design.

## Public parts

| Pinned counterpart                                                                                                                                    | Angular part                                                                               | Boundary                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [RadioGroup](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio-group/RadioGroup.tsx)              | [RdxRadioGroupDirective](src/radio-root.directive.ts)                                      | One group-owned selection. Angular exposes `value`/`valueChange`, CVA and a Signal Forms model. Both expose `defaultValue`, `onValueChange`, `name`, `form`, `disabled`, `readOnly` and `required`. |
| [Radio.Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio/root/RadioRoot.tsx)                | [RdxRadioItemDirective](src/radio-item.directive.ts)                                       | Consumer supplies the host. Angular infers a native button and requires a group. The pin also renders a standalone Root and supports arbitrary value identity. Angular item values are strings.     |
| Generated radio input per Root; `inputRef` on Root and Group                                                                                          | [RdxRadioItemInputDirective](src/radio-item-input.directive.ts) plus the group form bridge | Angular's authored input is optional. It enables native constraints and implicit label activation. The group supplies serialized entries when the selected item has no registered input.            |
| [Radio.Indicator](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/radio/indicator/RadioIndicator.tsx) | [RdxRadioIndicatorDirective](src/radio-indicator.directive.ts)                             | Both expose `keepMounted`, with different view lifetimes. See G5.                                                                                                                                   |

## Evidence and priorities

**S** = source audit, **U** = Angular unit, **B** = paired browser observation, **SSR** = Angular
server render. Each row is scoped to the stated contract.

| ID                                         | Status                   | Evidence and remaining comparison                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G1 — initial selection and defaults        | Resolved, scoped B/U/SSR | A defined model/form value wins, including `null` and `''`. An uncontrolled default seeds once, including the initially absent case. Later changes preserve selection. B checks ARIA and checked attributes, native checked state, FormData, silent request initialization/external writes and veto versus accepted click. U checks CVA, ngModel, Signal Forms and reset baselines. SSR checks selected markup for bound null, form null and default.                                      |
| G2 — editable value and change transaction | Partial, S/B/U           | Under the paired fixtures a veto preserves selection and serialization, and an accepted request updates both. Angular's one-way `[value]` still edits a model. The pin keeps controlled state with the parent. Compare ignored/delayed/replaced requests and decide the API boundary around form models. Also compare event trust, trigger, native default prevention, callback order, touch timing and exactly-once notification across host/input paths.                                 |
| G3 — native activation and composite focus | Partial, S/U             | Both delegate roving navigation to Composite, allow Shift with arrows and omit Home/End. Angular selects on Space keydown and handles pointer activation on the host. The pin uses button semantics and forwards selection to the native input. Compare focus entry, LTR/RTL arrows, repeat/release, canceled and modified keys, disabled-item skipping, read-only focus and the tab stop after cancellation or external selection.                                                        |
| G4 — native forms, labels and Field state  | Partial, S/B/U           | B compares one named local form with authored Angular inputs. U also covers an external form, generated fallback, implicit label and reset. Compare constraints, invalid focus, external-form changes, removed/disabled selected items, nesting and label/description wiring. The pin routes Radio through Field/Fieldset and forwards representative inputs. Angular primarily exposes validation/interaction state on Group and has no equivalent generated per-item input/ref contract. |
| G5 — Indicator lifetime and CSS hooks      | Source divergence        | The pin retains an exiting view until motion completes, then unmounts unless kept. Angular keeps the authored element, hides it synchronously by default and uses persistent checked/unchecked state as starting/ending hooks. Compare initial state, appearance, exit, reopen and retained view identity before changing part ownership.                                                                                                                                                  |
| G6 — values, collection and hydration      | Partial, S/SSR           | The Angular group accepts `string \| null`; Base UI also compares non-string identities before serialization. Compare dynamic item identity, duplicate tokens, reorder/removal, orphan selection and isolated groups. SSR checks initial markup only. Client hydration, IDs, focus and retained/animated Indicator coverage remain open.                                                                                                                                                   |

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
contract. The paired suite does not assert React/Angular reset equivalence.

## Verification

```bash
pnpm test-parity radio
pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/radio/__tests__
pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts -t 'resolves Radio form'
pnpm agents:check
```

Initial Chromium comparison reproduced two Angular failures: `bound-null` and `initially-empty`.
The corrected suite passed **6 scenarios × 3 engines (18 comparisons)**, without expected-difference
exceptions. Checkpoints compare state and request value/reason. Raw click events are recorded
separately: the Angular handler receives the trusted host click, and the pin handles an untrusted
forwarded click on the hidden input. Event parity remains in G2.
[Radio unit suite](__tests__/radio.spec.ts): **29 passing tests**.
[SSR render suite](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts): **1 focused pass**.
