# Preview Card — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [preview-card](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/preview-card).
Pinned exported parts/functions: `Root`, `Portal`, `Trigger`, `Positioner`, `Popup`, `Arrow`, `Backdrop`, `Viewport`, `createHandle`, `Handle`.

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

| Angular declaration                                             | Selector / role                           | Direct input/model/output declarations                                                                                                     |
| --------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [`RdxPreviewCardArrow`](src/preview-card-arrow.ts)              | `[rdxPreviewCardArrow]`                   | No direct signal input/model/output declaration.                                                                                           |
| [`RdxPreviewCardBackdrop`](src/preview-card-backdrop.ts)        | `[rdxPreviewCardBackdrop]`                | No direct signal input/model/output declaration.                                                                                           |
| [`RdxPreviewCardPopup`](src/preview-card-popup.ts)              | `[rdxPreviewCardPopup]`                   | `escapeKeyDown` (output), `pointerDownOutside` (output), `focusOutside` (output), `interactOutside` (output)                               |
| [`RdxPreviewCardPortal`](src/preview-card-portal.ts)            | `ng-template[rdxPreviewCardPortal]`       | No direct signal input/model/output declaration.                                                                                           |
| [`RdxPreviewCardPortalMisuseGuard`](src/preview-card-portal.ts) | `[rdxPreviewCardPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                           |
| [`RdxPreviewCardPositioner`](src/preview-card-positioner.ts)    | `[rdxPreviewCardPositioner]`              | No direct signal input/model/output declaration.                                                                                           |
| [`RdxPreviewCardRoot`](src/preview-card-root.ts)                | `[rdxPreviewCardRoot]`                    | `open` (model), `defaultOpen`, `triggerId` (model), `defaultTriggerId`, `handle`, `onOpenChange` (output), `onOpenChangeComplete` (output) |
| [`RdxPreviewCardTrigger`](src/preview-card-trigger.ts)          | `[rdxPreviewCardTrigger]`                 | `handle`, `payload`, `id`, `disabled`, `delay`, `closeDelay`                                                                               |
| [`RdxPreviewCardViewport`](src/preview-card-viewport.ts)        | `[rdxPreviewCardViewport]`                | No direct signal input/model/output declaration.                                                                                           |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                                       | Current declaration           | Ownership review                                                                                              |
| ---------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`RdxPreviewCardRoot.open`](src/preview-card-root.ts)      | `model(false)`                | Define parent-owned UI requests separately from accepted/effective state; no form-model exemption is implied. |
| [`RdxPreviewCardRoot.triggerId`](src/preview-card-root.ts) | `model<string \| null>(null)` | Define parent-owned UI requests separately from accepted/effective state; no form-model exemption is implied. |

| Declared default / source                                         | Declaration                           | Required comparison                                                                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxPreviewCardRoot.defaultOpen`](src/preview-card-root.ts)      | `input<boolean, BooleanInput>(false)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |
| [`RdxPreviewCardRoot.defaultTriggerId`](src/preview-card-root.ts) | `input<string \| null>(null)`         | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                   | Current observation / required target comparison                                                                                                                                                                                                                                                                                  | Priority |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Open/default ownership | TestBed observed `[open]="false" [defaultOpen]="true"` opening the Root. A late false-to-true default also opens an initially closed uncontrolled Root. The target keeps both closed. With two triggers, compare parent refusal and delayed acceptance, active trigger and payload, followed by a late `defaultTriggerId` update. | P1       |
| Hover transaction      | Compare hover/focus delays, interrupted requests, link activation, pointer grace and focus changes; timers and lifecycle follow actual state.                                                                                                                                                                                     | P1       |
| Popup composition      | Compare multiple triggers/handles, viewport/arrow/positioner, native IDs, nested dismissal, retained/manual exits and hydration with the pinned PreviewCard.                                                                                                                                                                      | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- Named browser regression files: [preview-card.behavior.spec.ts](../../../apps/visual-regression/tests/preview-card.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

The [TestBed audit](../../../docs/engineering/parity-matrices.md#confirmed-state-gaps) checked Root open state. Paired browser comparisons remain pending.
See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
