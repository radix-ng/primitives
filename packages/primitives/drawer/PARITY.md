# Drawer — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [drawer](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/drawer).
Pinned exported parts/functions: `Backdrop`, `Close`, `Content`, `Description`, `Indent`, `IndentBackground`, `Popup`, `Portal`, `Provider`, `Root`, `SwipeArea`, `Title`, `Trigger`, `Viewport`, `VirtualKeyboardProvider`, `createHandle`, `Handle`.

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

| Angular declaration                                                           | Selector / role                      | Direct input/model/output declarations                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxDrawerBackdrop`](src/drawer-backdrop.ts)                                 | `[rdxDrawerBackdrop]`                | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerClose`](src/drawer-close.ts)                                       | `button[rdxDrawerClose]`             | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerContent`](src/drawer-content.ts)                                   | `[rdxDrawerContent]`                 | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerDescription`](src/drawer-description.ts)                           | `[rdxDrawerDescription]`             | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerIndent`](src/drawer-indent.ts)                                     | `[rdxDrawerIndent]`                  | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerIndentBackground`](src/drawer-indent-background.ts)                | `[rdxDrawerIndentBackground]`        | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerPopup`](src/drawer-popup.ts)                                       | `[rdxDrawerPopup]`                   | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerPortal`](src/drawer-portal.ts)                                     | `ng-template[rdxDrawerPortal]`       | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerPortalMisuseGuard`](src/drawer-portal.ts)                          | `[rdxDrawerPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerProviderDirective`](src/drawer-provider.ts)                        | `[rdxDrawerProvider]`                | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerRoot`](src/drawer-root.ts)                                         | `[rdxDrawerRoot]`                    | `swipeDirection`, `snapPoints`, `snapPoint` (model), `defaultSnapPoint`, `snapToSequentialPoints`, `onSnapPointChange` (output) |
| [`RdxDrawerSwipeArea`](src/drawer-swipe-area.ts)                              | `[rdxDrawerSwipeArea]`               | `swipeDirection`, `disabled`                                                                                                    |
| [`RdxDrawerTitle`](src/drawer-title.ts)                                       | `[rdxDrawerTitle]`                   | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerTrigger`](src/drawer-trigger.ts)                                   | `button[rdxDrawerTrigger]`           | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerViewport`](src/drawer-viewport.ts)                                 | `[rdxDrawerViewport]`                | No direct signal input/model/output declaration.                                                                                |
| [`RdxDrawerVirtualKeyboardProvider`](src/drawer-virtual-keyboard-provider.ts) | `[rdxDrawerVirtualKeyboardProvider]` | No direct signal input/model/output declaration.                                                                                |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **Several ownership contracts**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                            | Current declaration                       | Ownership review                                                                                              |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`RdxDrawerRoot.snapPoint`](src/drawer-root.ts) | `model<RdxDrawerSnapPoint \| null>(null)` | Define parent-owned UI requests separately from accepted/effective state; no form-model exemption is implied. |

| Declared default / source                              | Declaration                            | Required comparison                                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxDrawerRoot.defaultSnapPoint`](src/drawer-root.ts) | `input<RdxDrawerSnapPoint>(undefined)` | Initial supplied/falsy/empty/form priority, initial-only snapshot, late changes and reset baseline. Distinguish state defaults from reactive configuration. |

Always include allowed `false`, `0`, `''`, `[]` and `null` cases; initial parent/CVA/Signal Forms
writes; default changes after initialization; ignored/delayed/replaced controlled requests; cancellation
and native/form reset. Not every case applies to readonly or infrastructure entries: mark those
boundaries explicitly instead of converting all models to readonly inputs.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                          | Current observation / required target comparison                                                                                                                                                                | Priority |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Delegated open and snap point | Source: Dialog is composed for open/defaultOpen; snapPoint is a separate model with defaultSnapPoint. Define controlled open, controlled snap and transient drag preview separately; these are not form values. | P1       |
| Gesture acceptance            | Compare ignored/replaced snap requests, canceled close, drag release, velocity/direction thresholds, keyboard/native close and snap default changes.                                                            | P1       |
| Mobile/lifetime               | Compare viewport/content/indent parts, scroll handoff, nested modal focus, virtual keyboard, multi-root exits and hydration. Dialog results do not certify Drawer gestures.                                     | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Local unit files](__tests__): **2 files discovered**; not a passing-test count.
- Named browser regression files: [drawer.behavior.spec.ts](../../../apps/visual-regression/tests/drawer.behavior.spec.ts). Scenario scope and freshness still need review; none was run by this inventory.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- No conventional same-family SSR page was found; inspect shared SSR/hydration fixtures for applicable cases. No SSR/hydration result is claimed here.

No runtime suite was executed for this initial matrix sweep. Complete focused state/DI units,
native/layout browser cases and SSR/hydration checks before promoting rows; add a paired pinned
fixture before certifying equivalent observable behavior. See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
