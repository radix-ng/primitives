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

| Angular declaration                                  | Selector / role                      | Direct input/model/output declarations                                                                                                                                                                                            |
| ---------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxDialogBackdrop`](src/dialog-backdrop.ts)        | `[rdxDialogBackdrop]`                | `forceRender`                                                                                                                                                                                                                     |
| [`RdxDialogClose`](src/dialog-close.ts)              | `button[rdxDialogClose]`             | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxDialogDescription`](src/dialog-description.ts)  | `[rdxDialogDescription]`             | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxDialogPopup`](src/dialog-popup.ts)              | `[rdxDialogPopup]`                   | `escapeKeyDown` (output), `pointerDownOutside` (output), `focusOutside` (output), `interactOutside` (output)                                                                                                                      |
| [`RdxDialogPortal`](src/dialog-portal.ts)            | `ng-template[rdxDialogPortal]`       | `container`, `keepMounted`                                                                                                                                                                                                        |
| [`RdxDialogPortalMisuseGuard`](src/dialog-portal.ts) | `[rdxDialogPortal]:not(ng-template)` | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxDialogRoot`](src/dialog-root.ts)                | `[rdxDialogRoot]`                    | `open` (input), `openChange` (output), `defaultOpen`, `triggerId` (input), `triggerIdChange` (output), `defaultTriggerId`, `modal`, `disablePointerDismissal`, `handle`, `onOpenChange` (output), `onOpenChangeComplete` (output) |
| [`RdxDialogTitle`](src/dialog-title.ts)              | `[rdxDialogTitle]`                   | No direct signal input/model/output declaration.                                                                                                                                                                                  |
| [`RdxDialogTrigger`](src/dialog-trigger.ts)          | `button[rdxDialogTrigger]`           | `handle`, `payload`, `id`, `disabled`                                                                                                                                                                                             |
| [`RdxDialogViewport`](src/dialog-viewport.ts)        | `[rdxDialogViewport]`                | No direct signal input/model/output declaration.                                                                                                                                                                                  |

Inherited classes and composed directives may add state/API. Follow those sources when completing
the comparison; similar part names or selector counts do not prove the same contract.

## State ownership and defaults

Ownership class for this entry: **UI request/controlled state**. The [shared contract](../../../docs/engineering/state-ownership.md)
distinguishes controlled UI requests, editable form models, readonly configuration, native DOM state
and derived/render state. Local writes to required form models are legitimate Angular behavior.
For strict controlled UI state, a request must not mutate the effective value before parent acceptance.

| State field / source                            | Current declaration       | Ownership review                                                                                                                            |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`RdxDialogRoot.open`](src/dialog-root.ts)      | Readonly effective signal | The `open` input owns controlled rendering. `openChange` reports requests after cancellation checks and supports `[(open)]`.                |
| [`RdxDialogRoot.triggerId`](src/dialog-root.ts) | Readonly effective signal | A supplied string overrides internal selection. Null or undefined falls back to that selection. `triggerIdChange` supports `[(triggerId)]`. |

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

| Area                        | Current observation / required target comparison                                                                                                                                                 | Priority        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Open/default ownership      | Controlled values and initial-only defaults for open state and trigger identity are covered below.                                                                                               | Verified        |
| Request versus actual state | Effective open state owns focus, Portal lifetime and scroll locking. The resolved trigger ID owns the registered trigger, its payload and trigger ARIA.                                          | Verified subset |
| Popup lifetime              | Compare modal/non-modal and nested focus, native close/trigger buttons, handles/trigger IDs, retained/manual exits, Portal ranges and hydration. AlertDialog/Drawer delegate into this contract. | P2              |

Also compare the actual emitted per-part attributes/CSS variables with both the pinned declaration
files and runtime state mapping. Check native hosts, event reasons/details/default prevention,
accessibility relationships, keyboard/RTL and cleanup where applicable. Angular framework adapters
are permitted; changed observable behavior needs evidence or an explicitly reviewed deviation.

## Ownership and lifetime cases

The initial 2026-11-18 TestBed audit exposed precedence and request gaps. The open-state increment follows the [shared controlled-state contract](../../../docs/engineering/state-ownership.md). The open and
trigger-ID expectations come from the pinned [popup Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/popupRoot.tsx)
and [store selectors](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/store.ts).

| Scenario                                  | Radix NG observation                                                                                                                                                                              | Reference expectation / comparison                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled false with default true        | `[open]="false" [defaultOpen]="true"` stays closed without an initial request.                                                                                                                    | Verified trigger `aria-expanded=false`, popup absence and no scroll lock.                                                                                                                |
| Late default                              | Uncontrolled Roots consume the first `defaultOpen`, including `false`. Later default changes leave the state unchanged.                                                                           | Verified initial true without an open request, and later true after the initial false.                                                                                                   |
| Parent keeps false after clicking Trigger | Root reports `onOpenChange` and, after cancellation checks, `openChange`. Until the parent supplies the requested value, the Portal, focus and scroll lock follow the previously committed state. | Unit and browser cases cover ignored open and close requests followed by parent acceptance. Unit coverage also verifies that the latest trigger request supplies metadata on acceptance. |
| Active trigger default                    | A supplied ID wins over the initial default. Null releases the override. The default remains an initial snapshot.                                                                                 | Cases cover default Account versus controlled Billing, late defaults, live payloads and the last committed internal ID after release.                                                    |
| Whole-view retention and manual unmount   | Portal retains the Angular view when requested. Root exposes `unmount()` for a held close.                                                                                                        | The [pinned suite](../../../apps/parity-testing/primitives/dialog/README.md) checks retained and disposable Portal views, including release, reopen and motion.                          |

## Evidence inventory and next checks

- [Dialog unit tests](__tests__/dialog.spec.ts) cover initial defaults, parent refusal, delayed acceptance, two-way binding and cancellation.
- [Dialog browser tests](../../../apps/visual-regression/tests/dialog.behavior.spec.ts) include a deferred open/close request with focus, Portal and scroll-lock observations.
- The [pinned Dialog suite](../../../apps/parity-testing/primitives/dialog/README.md) compares 15 scenarios across Chromium, Firefox and WebKit. It covers open ownership, trigger registration, modal background behavior and close lifetime.
- The [AOT hydration suite](../../../apps/radix-ssr-testing/hydration-audit/README.md) covers initially open Dialog in `eager-dialog`.

The directive reference exposes effective `open()` as readonly. Set a bound value to drive a
controlled Dialog, or use `show()` and `close()` for imperative requests. The latest accepted-request
metadata takes effect when the parent commits the matching state. `[(open)]` accepts the request
via its ordinary output binding. The close-lifetime increment below covers manual Portal release.
The open-state regressions failed against the earlier model implementation and pass with the new
ownership contract. Verification passed 77 Dialog/AlertDialog/Drawer units, 101 browser runs
(one existing Android capability skip), and the `eager-dialog` hydration case in each desktop
engine. The targeted Menu run passed 108 pinned comparisons and 12 Portal consumer regressions.
See the
[verification skill](../../../.agents/skills/radix-testing/SKILL.md),
[matrix index](../../../docs/engineering/parity-matrices.md) and
[upstream preparation guide](../../../docs/engineering/upstream-reference.md).

## Trigger identity increment

The [pinned selector](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/store.ts)
resolves the supplied ID before the internal selection. Angular uses that same precedence.
`triggerIdChange` reports accepted trigger requests independently of the `openChange` output.
The effective `triggerId()`, registered trigger and payload are readonly. Explicit parent selection,
initial defaults and registration changes do not emit trigger requests.

A programmatic open with two triggers and no ID stays unassociated. A lone trigger is claimed
after Angular has rendered the registration set. The computed fallback also supports initial
SSR markup. Removing an active registration preserves its ID and the open dialog. Re-registering
that ID restores the element association. The registry supplies live payloads for named triggers.

[Dialog units](__tests__/dialog.spec.ts) compare default precedence, late updates, refused
requests, null fallback, registration and payload. The
[controlled multiple-trigger browser case](../../../apps/visual-regression/tests/dialog.behavior.spec.ts)
checks trigger ARIA, keyboard focus return and an externally supplied ID.

Five trigger identity scenarios failed before the fix. Verification passes 82 family units,
104 browser runs with one existing Android capability skip, the `eager-dialog` hydration case in
each desktop engine, 108 pinned Menu comparisons and 12 Portal consumer regressions.

## Close lifetime increment

Dialog uses the shared [popup lifecycle](../core/src/floating/use-popup-lifecycle.ts) and registers
its structural Portal as the view owner. The pinned
[Portal](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/dialog/portal/DialogPortal.tsx)
accepts `keepMounted` and the pinned
[Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/dialog/root/DialogRoot.tsx)
provides `actionsRef.unmount()`. In Angular, the directive reference provides `unmount()`
and Portal exposes `keepMounted` as a signal input.

| Scenario                | Covered contract                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Automatic close         | Existing CSS exit regressions wait for both Popup and Backdrop. Logical close releases scroll lock and background isolation before removal.                                                                        |
| Manual hold and release | A committed close can retain the view through `preventUnmountOnClose()`. Repeated `unmount()` completes once after a disposable view leaves the DOM. Closing and unmounting in one controlled render is supported. |
| Retained view           | `keepMounted` keeps child instances and form state. Popup, Backdrop and Viewport hide after the exit or manual release. The same view reopens.                                                                     |
| Reopen or veto          | Reopening drops the prior hold. A canceled close leaves the live view and a call to `unmount()` while still open has no effect.                                                                                    |

AlertDialog and Drawer expose the same Portal retention and Root action. Angular requires a
declared input when a host directive re-exposes it through the variant. The Dialog Portal's input
passes one retention signal through the Presence context.

[Unit regressions](__tests__/dialog.spec.ts) cover completion and native form identity. The
[browser regressions](../../../apps/visual-regression/tests/dialog.behavior.spec.ts) exercise
manual release, hidden retained content, real CSS exits and focus. The
[pinned lifetime cases](../../../apps/parity-testing/primitives/dialog/tests/scenarios.ts) also compare
draft preservation, completion order and reopening against Base UI.

Verification passed 157 units, 107 browser cases with one existing Android capability skip,
108 pinned Menu comparisons and 12 Portal consumer checks. The AOT suite passed all 135 cases
across the three desktop engines. WebKit passed on a separate run after the original runner
stalled creating a new page.

## Modal keyboard and background isolation

The [pinned modal case](../../../apps/parity-testing/primitives/dialog/tests/scenarios.ts) exposed
two macOS WebKit differences. Ordinary Tab skipped Close, which Base UI renders with explicit
`tabindex="0"`. Angular now supplies that static default, which authors can override. Option+Tab
reached Close but failed to wrap because the focus scope intercepted the transfer to its boundary
guard. The scope now lets its own registered guards finish the focus transfer. The
[focus manager regression](../floating-focus-manager/__tests__/floating-focus-manager.spec.ts)
also checks that an unrelated guard cannot take focus outside the scope.

The modal comparison checks focus cycling, background isolation, scroll lock and outside press.
Angular uses `inert` for background isolation as described in
[ADR 0017](../../../docs/adr/0017-floating-focus-manager.md). The pinned React runtime uses
`aria-hidden`. The suite records both attributes and compares the observable keyboard and pointer
behavior. Non-modal and `trap-focus` modes, nested dismissal, detached handles, custom focus targets
and Portal destination changes remain pending paired checks.
