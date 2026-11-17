# Tooltip — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [tooltip](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tooltip).
Pinned exported parts/functions: `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`, `Arrow`, `Provider`, `Viewport`, `createHandle`, `Handle`.

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

| Angular declaration                                    | Selector / role                       | Direct input/model/output declarations                                                                                                          |
| ------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxTooltip`](src/tooltip.ts)                         | `[rdxTooltip]`                        | `open` (model), `defaultOpen`, `delay`, `closeDelay`, `disableHoverablePopup`, `trackCursorAxis`, `disabled`, `handle`, `onOpenChange` (output) |
| [`RdxTooltipArrow`](src/tooltip-arrow.ts)              | `[rdxTooltipArrow]`                   | No direct signal input/model/output declaration.                                                                                                |
| [`RdxTooltipPopup`](src/tooltip-popup.ts)              | `[rdxTooltipPopup]`                   | No direct signal input/model/output declaration.                                                                                                |
| [`RdxTooltipPortal`](src/tooltip-portal.ts)            | `ng-template[rdxTooltipPortal]`       | No direct signal input/model/output declaration.                                                                                                |
| [`RdxTooltipPortalMisuseGuard`](src/tooltip-portal.ts) | `[rdxTooltipPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                                |
| [`RdxTooltipPositioner`](src/tooltip-positioner.ts)    | `[rdxTooltipPositioner]`              | `escapeKeyDown` (output), `pointerDownOutside` (output)                                                                                         |
| [`RdxTooltipProvider`](src/tooltip-provider.ts)        | `[rdxTooltipProvider]`                | `delay`, `closeDelay`, `timeout`                                                                                                                |
| [`RdxTooltipTrigger`](src/tooltip-trigger.ts)          | `[rdxTooltipTrigger]`                 | `handle`, `payload`, `id`, `closeOnClick`, `disabled`, `delay`, `closeDelay`, `rdxOnPointerDown`                                                |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                | Current declaration | Ownership review                                                                                              |
| ----------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`RdxTooltip.open`](src/tooltip.ts) | `model(false)`      | Define parent-owned UI requests separately from accepted/effective state; no form-model exemption is implied. |

| Declared default / source                  | Declaration                           | Required comparison                                                                                                                                         |
| ------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxTooltip.defaultOpen`](src/tooltip.ts) | `input<boolean, BooleanInput>(false)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                   | Current observation / required target comparison                                                                                                                                     | Priority |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Open/default ownership | Source: open is a model with a first-truthy defaultOpen latch. Compare explicit false, parent refusal, delayed acceptance and a late false-to-true default.                          | P1       |
| Provider versus state  | Provider delay/close/hover defaults are configuration, distinct from initial open. Timed hover/focus requests, active trigger and lifecycle must follow the effective open contract. | P1       |
| Tooltip behavior       | Compare provider grouping, multiple triggers/handles, native description IDs, disabled/interactive content, pointer grace, viewport/arrow, dismissal and SSR/hydration.              | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- Named browser regression files: [tooltip.behavior.spec.ts](../../../apps/visual-regression/tests/tooltip.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
