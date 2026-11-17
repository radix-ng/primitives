# Dialog — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [dialog](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/dialog).
Pinned exported parts/functions: `Backdrop`, `Close`, `Description`, `Popup`, `Portal`, `Root`, `Viewport`, `Title`, `Trigger`, `createHandle`, `Handle`.

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

| Angular declaration                                  | Selector / role                      | Direct input/model/output declarations                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`RdxDialogBackdrop`](src/dialog-backdrop.ts)        | `[rdxDialogBackdrop]`                | `forceRender`                                                                                                                                                                  |
| [`RdxDialogClose`](src/dialog-close.ts)              | `button[rdxDialogClose]`             | No direct signal input/model/output declaration.                                                                                                                               |
| [`RdxDialogDescription`](src/dialog-description.ts)  | `[rdxDialogDescription]`             | No direct signal input/model/output declaration.                                                                                                                               |
| [`RdxDialogPopup`](src/dialog-popup.ts)              | `[rdxDialogPopup]`                   | `escapeKeyDown` (output), `pointerDownOutside` (output), `focusOutside` (output), `interactOutside` (output)                                                                   |
| [`RdxDialogPortal`](src/dialog-portal.ts)            | `ng-template[rdxDialogPortal]`       | `container`                                                                                                                                                                    |
| [`RdxDialogPortalMisuseGuard`](src/dialog-portal.ts) | `[rdxDialogPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                                                               |
| [`RdxDialogRoot`](src/dialog-root.ts)                | `[rdxDialogRoot]`                    | `open` (model), `defaultOpen`, `triggerId` (model), `defaultTriggerId`, `modal`, `disablePointerDismissal`, `handle`, `onOpenChange` (output), `onOpenChangeComplete` (output) |
| [`RdxDialogTitle`](src/dialog-title.ts)              | `[rdxDialogTitle]`                   | No direct signal input/model/output declaration.                                                                                                                               |
| [`RdxDialogTrigger`](src/dialog-trigger.ts)          | `button[rdxDialogTrigger]`           | `handle`, `payload`, `id`, `disabled`                                                                                                                                          |
| [`RdxDialogViewport`](src/dialog-viewport.ts)        | `[rdxDialogViewport]`                | No direct signal input/model/output declaration.                                                                                                                               |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                            | Current declaration           | Ownership review                                                                                              |
| ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`RdxDialogRoot.open`](src/dialog-root.ts)      | `model(false)`                | Define parent-owned UI requests separately from accepted/effective state; no form-model exemption is implied. |
| [`RdxDialogRoot.triggerId`](src/dialog-root.ts) | `model<string \| null>(null)` | Define parent-owned UI requests separately from accepted/effective state; no form-model exemption is implied. |

| Declared default / source                              | Declaration                           | Required comparison                                                                                                                                         |
| ------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxDialogRoot.defaultOpen`](src/dialog-root.ts)      | `input<boolean, BooleanInput>(false)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |
| [`RdxDialogRoot.defaultTriggerId`](src/dialog-root.ts) | `input<string \| null>(null)`         | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                        | Current observation / required target comparison                                                                                                                                                  | Priority |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Open/default ownership      | Source: open is a writable model; the first-truthy defaultOpen latch does not distinguish explicit false or finish initialization when false/absent. Compare late defaults and parent refusal.    | P1       |
| Request versus actual state | Compare cancellation, controlled ignore/delay/replacement and two-way acceptance. Focus, modality, scroll lock and render lifecycle must follow effective open and active trigger, not a request. | P1       |
| Popup lifetime              | Compare modal/non-modal and nested focus, native close/trigger buttons, handles/trigger IDs, retained/manual exits, Portal ranges and hydration. AlertDialog/Drawer delegate into this contract.  | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- Named browser regression files: [dialog.behavior.spec.ts](../../../apps/visual-regression/tests/dialog.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
