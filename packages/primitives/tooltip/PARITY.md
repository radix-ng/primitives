# Tooltip — parity matrix

Initial inventory: 2026-11-17. Reference pin: **Base UI 1.9.0**,
`cf696d6f6e08c699c5bda24d5a033430909f2285` ([reference manifest](../../../apps/parity-testing/reference.json)).

Primary counterpart: [tooltip](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tooltip).
Pinned exported parts/functions: `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`, `Arrow`, `Provider`, `Viewport`, `createHandle`, `Handle`.

**Scope: open and trigger ownership, initial defaults, provider timing, disabling, focus, and viewport
handoffs.** The paired suite verifies the scenarios below. Adaptive positioning, remaining part and
lifecycle contracts, and hydration remain open for comparison.

**Breaking changes are permitted; backward compatibility does not constrain the target.** Apply the
[state ownership/defaults contract](../../../docs/engineering/state-ownership.md) per field. Inputs,
models, outputs, defaults and part boundaries may change; do not retain compatibility mirrors or
aliases solely for the old API. Review earlier ADR decisions explicitly when replacing them.

## Public surface inventory

Source of truth: [entry barrel](index.ts). These are directly exported decorated classes, not a
claim that inherited/host-directive APIs or every upstream prop have already been compared. Exported
composition bases, guards and internal helpers are not thereby promoted to stable public widget parts.

| Angular declaration                                    | Selector / role                       | Direct input/model/output declarations                                                                                                                                                                                            |
| ------------------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxTooltip`](src/tooltip.ts)                         | `[rdxTooltip]`                        | `open` and `triggerId` (input aliases), `defaultOpen`, `defaultTriggerId`, `delay`, `closeDelay`, `disableHoverablePopup`, `trackCursorAxis`, `disabled`, `handle`, `onOpenChange`, `openChange`, and `triggerIdChange` (outputs) |
| [`RdxTooltipArrow`](src/tooltip-arrow.ts)              | `[rdxTooltipArrow]`                   | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxTooltipPopup`](src/tooltip-popup.ts)              | `[rdxTooltipPopup]`                   | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxTooltipPortal`](src/tooltip-portal.ts)            | `ng-template[rdxTooltipPortal]`       | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxTooltipPortalMisuseGuard`](src/tooltip-portal.ts) | `[rdxTooltipPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxTooltipPositioner`](src/tooltip-positioner.ts)    | `[rdxTooltipPositioner]`              | `escapeKeyDown` (output), `pointerDownOutside` (output)                                                                                                                                                                           |
| [`RdxTooltipProvider`](src/tooltip-provider.ts)        | `[rdxTooltipProvider]`                | `delay`, `closeDelay`, `timeout`                                                                                                                                                                                                  |
| [`RdxTooltipTrigger`](src/tooltip-trigger.ts)          | `[rdxTooltipTrigger]`                 | `handle`, `payload`, `id`, `closeOnClick`, `disabled`, `delay`, `closeDelay`, `rdxOnPointerDown`                                                                                                                                  |
| [`RdxTooltipViewport`](src/tooltip-viewport.ts)        | `[rdxTooltipViewport]`                | No direct signal input/model/output declaration.                                                                                                                                                                                  |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                       | Declaration                                                     | Ownership                                                                                                                                                                                 |
| ------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxTooltip.open`](src/tooltip.ts)        | `openInput` aliased to `open`, effective `open()`, `openChange` | A supplied Boolean controls rendering. Undefined releases control to the local state. Uncanceled requests emit `openChange`, including for `[(open)]`. Parent writes emit neither output. |
| [`RdxTooltip.defaultOpen`](src/tooltip.ts) | `input<boolean, BooleanInput>(false)`                           | Snapshots the initial uncontrolled state once. Controlled false takes precedence over a true default. A late default leaves the effective state unchanged.                                |

`onOpenChange` carries the event, reason, and trigger for a cancellable request. The popup,
trigger description, and active trigger/payload follow the committed state. To migrate a consumer
that called `root.open.set(value)`, update the state bound to `[open]`. Angular coerces supported
Boolean input strings. Tooltip has no form-value or reset contract.

An explicit `triggerId` resolves before the local selection. A nullish input releases control
to that local selection. `defaultTriggerId` is sampled once. Registered IDs supply the anchor and
live payload for inline and detached triggers. Angular also exposes `triggerIdChange` for accepted
requests to change the selection. An open with multiple registered triggers and no selected ID
stays unassociated. In the detached-trigger fixture, pinned Base UI claims the first registration
in that case. If a resolved trigger unregisters, the root waits a microtask for a same-ID
replacement before requesting a close. A veto retains the ID and payload while the element is absent.

## Family-specific comparison matrix

“Source” identifies a local implementation fact. “Compare/verify/audit” is pending work. Priorities
describe the target work, not a certificate or a reproduced defect count.

| Area                   | Current observation / required target comparison                                                                                                                     | Priority |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Open/default ownership | The paired suite covers controlled precedence and release, initial/late defaults, delayed hover, keyboard focus, and canceled, ignored, and later accepted requests. | Verified |
| Provider versus state  | The suite covers live delay overrides and timeout, sibling handoff, disabled requests and veto, and focus loss and re-entry.                                         | Verified |
| Trigger identity       | Controlled and default IDs, live payload and anchor, late registration, same-ID replacement, active removal and veto, and detached handle handoff.                   | Verified |
| Viewport handoff       | Direction, outgoing snapshot and dimensions, resize, rapid switches, and motion cleanup.                                                                             | Verified |
| Tooltip behavior       | Compare pointer grace, adaptive positioning, Arrow, completion outputs and SSR/hydration.                                                                            | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Evidence inventory and next checks

- [Tooltip units](__tests__/tooltip.spec.ts) cover directives, handle/provider behavior, and deferred commit of the active trigger and payload.
- [Angular browser regressions](../../../apps/visual-regression/tests/tooltip.behavior.spec.ts) exercise Tooltip in Storybook.
- [Pinned comparisons](../../../apps/parity-testing/primitives/tooltip/README.md) cover open ownership, interaction, trigger selection, and viewport handoff in seventeen scenarios across Chromium, Firefox, and WebKit. The [reviewed differences](../../../apps/parity-testing/primitives/tooltip/expected-differences.json) cover Angular's popup role and description link, its return to local state when a controlled binding becomes undefined, its handling of pending hover and trigger markers on disable, and implicit selection with multiple detached triggers.
- [Viewport story](stories/tooltip-viewport.ts) matches the pinned detached-trigger demo's content motion. Angular uses an authored current wrapper and keeps measured popup sizes in CSS variables. The pin creates the wrapper and returns the popup size variables to `auto` after the animation.
- Adaptive positioning from the far edge for top and left placements during resizing, and Tooltip SSR/hydration comparison, are pending.

See the [verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md), and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
