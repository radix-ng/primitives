# Stepper — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

No direct public counterpart exists in this pin. Record the Angular-specific contract and applicable shared behavior; direct Base UI part parity is **not applicable**, rather than an automatically missing upstream feature.

**Scope: initial source inventory and comparison backlog.** Exported local declarations and evidence
locations were inventoried; complete per-handler, per-attribute and browser equivalence has not been
established. A source observation below is not a newly passing runtime or differential result.

**Breaking changes are permitted; backward compatibility does not constrain the target.** Apply the
[state ownership/defaults contract](../../../docs/engineering/state-ownership.md) per field. Inputs,
models, outputs, defaults and part boundaries may change; do not retain compatibility mirrors or
aliases solely for the old API. Review earlier ADR decisions explicitly when replacing them.

## Public surface inventory

Source of truth: [entry barrel](index.ts). These are directly exported decorated classes, not a
claim that inherited/host-directive APIs or every upstream prop have already been compared. Exported
composition bases, guards and internal helpers are not thereby promoted to stable public widget parts.

| Angular declaration                                                      | Selector / role             | Direct input/model/output declarations                                                    |
| ------------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------------- |
| [`RdxStepperDescriptionDirective`](src/stepper-description.directive.ts) | `[rdxStepperDescription]`   | No direct signal input/model/output declaration.                                          |
| [`RdxStepperIndicatorDirective`](src/stepper-indicator.directive.ts)     | `[rdxStepperIndicator]`     | No direct signal input/model/output declaration.                                          |
| [`RdxStepperItemDirective`](src/stepper-item.directive.ts)               | `[rdxStepperItem]`          | `step`, `disabled`, `completed`                                                           |
| [`RdxStepperRootDirective`](src/stepper-root.directive.ts)               | `[rdxStepperRoot]`          | `defaultValue`, `value` (model), `linear`, `dir`, `orientation`, `onValueChange` (output) |
| [`RdxStepperSeparatorDirective`](src/stepper-separator.directive.ts)     | `[rdxStepperSeparator]`     | `orientation`                                                                             |
| [`RdxStepperTitleDirective`](src/stepper-title.directive.ts)             | `[rdxStepperTitle]`         | No direct signal input/model/output declaration.                                          |
| [`RdxStepperTriggerDirective`](src/stepper-trigger.directive.ts)         | `button[rdxStepperTrigger]` | No direct signal input/model/output declaration.                                          |

Separator follows Root orientation by default. An explicit Separator `orientation` overrides the
Root, and clearing it restores the reactive fallback. See the [Stepper unit regression](__tests__/stepper.spec.ts).

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                             | Current declaration                               | Ownership review                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`RdxStepperRootDirective.value`](src/stepper-root.directive.ts) | `model<number \| undefined>(this.defaultValue())` | Define navigation/draft/presentation ownership separately from the form or business value. |

| Declared default / source                                               | Declaration                             | Required comparison                                                                                                                                         |
| ----------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxStepperRootDirective.defaultValue`](src/stepper-root.directive.ts) | `input<number, NumberInput>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area              | Current observation / required target comparison                                                                                                                                                                                                                                                                                   | Priority |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Step ownership    | TestBed observed `[defaultValue]="2"` leaving Root `value()` undefined. The model reads the initializer before Angular binds the input. For this Angular-specific API, an omitted value should seed `2` once. Check an explicit valid bound step, ignored/delayed requests and the eligibility of subsequent steps in linear mode. | P1       |
| Step requests     | No public Stepper entry exists in the pin. Define canceled/refused navigation, linear validation, disabled/completed state and item insertion/removal behavior.                                                                                                                                                                    | P1       |
| Native navigation | Verify button/keyboard activation, focus, orientation/RTL, title/description associations and external step changes against the Angular-specific contract.                                                                                                                                                                         | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- No same-family named browser behavior file was found. Cross-family consumer or shared-mechanism checks may exist; locate them before claiming absence or coverage.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

The [TestBed audit](../../../docs/engineering/parity-matrices.md#confirmed-state-gaps) checked initial Root step value. Paired browser comparisons remain pending.
See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
