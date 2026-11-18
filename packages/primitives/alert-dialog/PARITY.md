# Alert Dialog — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [alert-dialog](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/alert-dialog).
Pinned exported parts/functions: `Root`, `Backdrop`, `Close`, `Description`, `Popup`, `Portal`, `Title`, `Trigger`, `Viewport`, `Handle`, `createHandle`.

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

| Angular declaration                                             | Selector / role                           | Direct input/model/output declarations           |
| --------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| [`RdxAlertDialogBackdrop`](src/alert-dialog-backdrop.ts)        | `[rdxAlertDialogBackdrop]`                | No direct signal input/model/output declaration. |
| [`RdxAlertDialogClose`](src/alert-dialog-close.ts)              | `button[rdxAlertDialogClose]`             | No direct signal input/model/output declaration. |
| [`RdxAlertDialogDescription`](src/alert-dialog-description.ts)  | `[rdxAlertDialogDescription]`             | No direct signal input/model/output declaration. |
| [`RdxAlertDialogPopup`](src/alert-dialog-popup.ts)              | `[rdxAlertDialogPopup]`                   | No direct signal input/model/output declaration. |
| [`RdxAlertDialogPortal`](src/alert-dialog-portal.ts)            | `ng-template[rdxAlertDialogPortal]`       | No direct signal input/model/output declaration. |
| [`RdxAlertDialogPortalMisuseGuard`](src/alert-dialog-portal.ts) | `[rdxAlertDialogPortal]:not(ng-template)` | No direct signal input/model/output declaration. |
| [`RdxAlertDialogRoot`](src/alert-dialog-root.ts)                | `[rdxAlertDialogRoot]`                    | No direct signal input/model/output declaration. |
| [`RdxAlertDialogTitle`](src/alert-dialog-title.ts)              | `[rdxAlertDialogTitle]`                   | No direct signal input/model/output declaration. |
| [`RdxAlertDialogTrigger`](src/alert-dialog-trigger.ts)          | `button[rdxAlertDialogTrigger]`           | No direct signal input/model/output declaration. |
| [`RdxAlertDialogViewport`](src/alert-dialog-viewport.ts)        | `[rdxAlertDialogViewport]`                | No direct signal input/model/output declaration. |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

[Alert Dialog Root](src/alert-dialog-root.ts) exposes the composed Dialog inputs `open`,
`defaultOpen`, `triggerId`, `defaultTriggerId` and `handle`, and the outputs `openChange`,
`triggerIdChange`, `onOpenChange` and `onOpenChangeComplete`. Its exported `open` and
`triggerId` refer to Dialog’s readonly effective state signals. The variant fixes the role, modality
and outside-pointer dismissal policy.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area              | Current observation / required target comparison                                                                                                                                                                                                     | Priority |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Delegated state   | AlertDialog forwards Dialog’s readonly controlled `open` input and `openChange` requests. Dialog’s initial-only defaults and parent-owned open and trigger ID apply through the composition. Alert-specific paired cases remain open.                | P1       |
| Alert interaction | Compare mandatory alert-dialog role, modal isolation, cancel/confirm actions, outside dismissal and Escape against AlertDialog rather than assuming ordinary Dialog behavior.                                                                        | P1       |
| Composed lifetime | Portal exposes `keepMounted` and Root exposes `unmount()` through Dialog’s [shared lifecycle](../dialog/PARITY.md#close-lifetime-increment). Unit coverage verifies the retained view through this adapter. Alert-specific paired cases remain open. | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **1 file discovered**; not a passing-test count.
- Named browser regression files: [alert-dialog.behavior.spec.ts](../../../apps/visual-regression/tests/alert-dialog.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

The [TestBed audit](../../../docs/engineering/parity-matrices.md#confirmed-state-gaps) checked Root open state through the Dialog adapter. Paired browser comparisons remain pending.
See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
