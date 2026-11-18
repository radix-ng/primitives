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

| Angular declaration                                  | Selector / role                      | Direct input/model/output declarations                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxDialogBackdrop`](src/dialog-backdrop.ts)        | `[rdxDialogBackdrop]`                | `forceRender`                                                                                                                                                                                         |
| [`RdxDialogClose`](src/dialog-close.ts)              | `button[rdxDialogClose]`             | No direct signal input/model/output declaration.                                                                                                                                                      |
| [`RdxDialogDescription`](src/dialog-description.ts)  | `[rdxDialogDescription]`             | No direct signal input/model/output declaration.                                                                                                                                                      |
| [`RdxDialogPopup`](src/dialog-popup.ts)              | `[rdxDialogPopup]`                   | `escapeKeyDown` (output), `pointerDownOutside` (output), `focusOutside` (output), `interactOutside` (output)                                                                                          |
| [`RdxDialogPortal`](src/dialog-portal.ts)            | `ng-template[rdxDialogPortal]`       | `container`                                                                                                                                                                                           |
| [`RdxDialogPortalMisuseGuard`](src/dialog-portal.ts) | `[rdxDialogPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                                                                                      |
| [`RdxDialogRoot`](src/dialog-root.ts)                | `[rdxDialogRoot]`                    | `open` (input), `openChange` (output), `defaultOpen`, `triggerId` (model), `defaultTriggerId`, `modal`, `disablePointerDismissal`, `handle`, `onOpenChange` (output), `onOpenChangeComplete` (output) |
| [`RdxDialogTitle`](src/dialog-title.ts)              | `[rdxDialogTitle]`                   | No direct signal input/model/output declaration.                                                                                                                                                      |
| [`RdxDialogTrigger`](src/dialog-trigger.ts)          | `button[rdxDialogTrigger]`           | `handle`, `payload`, `id`, `disabled`                                                                                                                                                                 |
| [`RdxDialogViewport`](src/dialog-viewport.ts)        | `[rdxDialogViewport]`                | No direct signal input/model/output declaration.                                                                                                                                                      |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                            | Current declaration           | Ownership review                                                                                                             |
| ----------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [`RdxDialogRoot.open`](src/dialog-root.ts)      | Readonly effective signal     | The `open` input owns controlled rendering. `openChange` reports requests after cancellation checks and supports `[(open)]`. |
| [`RdxDialogRoot.triggerId`](src/dialog-root.ts) | `model<string \| null>(null)` | Define parent-owned UI requests separately from accepted/effective state; no form-model exemption is implied.                |

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

| Area                        | Current observation / required target comparison                                                                                                                                                 | Priority |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Open/default ownership      | Controlled false and initial-only `defaultOpen` are verified. Trigger-ID defaults remain a separate case. See [ownership and lifetime cases](#ownership-and-lifetime-cases).                     | P1       |
| Request versus actual state | Effective open state controls focus, Portal lifetime and body scroll lock. Trigger-ID ownership remains separate.                                                                                | P1       |
| Popup lifetime              | Compare modal/non-modal and nested focus, native close/trigger buttons, handles/trigger IDs, retained/manual exits, Portal ranges and hydration. AlertDialog/Drawer delegate into this contract. | P2       |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Ownership and lifetime cases

The initial 2026-11-18 TestBed audit exposed precedence and request gaps. The open-state increment follows the [shared controlled-state contract](../../../docs/engineering/state-ownership.md). The open and
trigger-ID expectations come from the pinned [popup Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/popupRoot.tsx)
and [store selectors](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/store.ts).

| Scenario                                  | Radix NG observation                                                                                                                                                                              | Reference expectation / comparison                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled false with default true        | `[open]="false" [defaultOpen]="true"` stays closed without an initial request.                                                                                                                    | Verified trigger `aria-expanded=false`, popup absence and no scroll lock.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Late default                              | Uncontrolled Roots consume the first `defaultOpen`, including `false`. Later default changes leave the state unchanged.                                                                           | Verified initial true without an open request, and later true after the initial false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Parent keeps false after clicking Trigger | Root reports `onOpenChange` and, after cancellation checks, `openChange`. Until the parent supplies the requested value, the Portal, focus and scroll lock follow the previously committed state. | Unit and browser cases cover ignored open and close requests followed by parent acceptance. Unit coverage also verifies that the latest trigger request supplies metadata on acceptance.                                                                                                                                                                                                                                                                                                                                                                                                     |
| Active trigger default                    | Source: a first non-null `defaultTriggerId` can seed the local model.                                                                                                                             | With two triggers, an explicit ID `b` takes precedence over default `a`. Check the active trigger, its payload and focus return. Test omitted ID, late defaults and explicit `null` separately. The pin uses `null` as a fallback to internal active identity.                                                                                                                                                                                                                                                                                                                               |
| Whole-view retention and manual unmount   | Source: [Portal](src/dialog-portal.ts) exposes `container`. [Root](src/dialog-root.ts) honors `preventUnmountOnClose()` through its `present` signal.                                             | [Pinned Portal](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/dialog/portal/DialogPortal.tsx) adds `keepMounted`. [Pinned Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/dialog/root/DialogRoot.tsx) exposes manual release through `actionsRef.unmount()`. Compare child initialization/disposal, deferred completion, canceled close and reopening during a hold. [Popover](../popover/PARITY.md#close-lifecycle-increment) covers these behaviors on the shared popup lifecycle. |

## Evidence inventory and next checks

- [Dialog unit tests](__tests__/dialog.spec.ts) cover initial defaults, parent refusal, delayed acceptance, two-way binding and cancellation.
- [Dialog browser tests](../../../apps/visual-regression/tests/dialog.behavior.spec.ts) include a deferred open/close request with focus, Portal and scroll-lock observations.
- No dedicated `suite.json` was found for this entry. Check shared suites for partial consumer evidence; this page claims no new paired comparisons.
- The [AOT hydration suite](../../../apps/radix-ssr-testing/hydration-audit/README.md) covers initially open Dialog in `eager-dialog`.

The directive reference exposes effective `open()` as readonly. Set a bound value to drive a
controlled Dialog, or use `show()` and `close()` for imperative requests. The latest accepted-request
metadata takes effect when the parent commits the matching state. `[(open)]` accepts the request
via its ordinary output binding. Trigger-ID ownership and manual Portal release remain separate.
The open-state regressions failed against the earlier model implementation and pass with the new
ownership contract. Verification passed 77 Dialog/AlertDialog/Drawer units, 101 browser runs
(one existing Android capability skip), and the `eager-dialog` hydration case in each desktop
engine. The targeted Menu run passed 108 pinned comparisons and 12 Portal consumer regressions.
Dedicated paired Dialog coverage remains pending.
See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).
