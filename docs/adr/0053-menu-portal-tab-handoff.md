# ADR 0053: Hand off Menu Tab focus through the portal declaration

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0017, ADR 0035, ADR 0052, `portal`, `floating-focus-manager`, `menu`

## Context

ADR 0052 identified forward Tab from a reopened retained submenu returning to More with both menus
still open. Base UI closes the chain and focuses the following page control. Angular's content
guard searched beside the reference element, with no logical outside boundary for a submenu.
Structural portals relocate independent embedded views into body siblings; their physical order
cannot represent the nested template's Tab order.

## Decision

Expose the structural portal's existing ViewContainerRef comment through an internal DI token.
The token factory reads only the anchor: injecting the portal directive itself can cycle while
its presence machine is constructing an initially present embedded view. No wrapper, copied React
portal state or new consumer input is needed. DI retains the declaration relationship after relocation.

The shared Floating Focus Manager installs a pair of outside guards around that anchor for an open,
enabled, non-modal popup. Its existing content guards hand off to those logical boundaries unless
the consumer supplies an explicit neighboring focus target. Outside guards resolve the next/previous
tabbable from the currently focused boundary, preserving native controls inside the parent as well
as departures from the whole chain. Existing trigger-side entry guards remain compatible.

Document focus-out listeners accept sources from the manager's own popup, triggers and open
descendants; ancestor surfaces are related destinations, not sources of a child's close request.
Each outside guard owns its native handoff and close request, so its focusout is not a second
request. Menu retains SubTrigger identity for the explicit native focus request from its guards.
Root closes before child when Tab leaves the chain; moving to an input in the parent closes only
the child. Shift+Tab retains the existing trigger-return policy and leaves the parent open.

Guards are disposed with the existing effect on close, modal changes and destruction. Retained
closed content has no guards or active item Tab stops. Tab keydown remains a browser operation;
Menu does not prevent it, synthesize events, or manually close the chain in its key handler.

## Evidence

Six new cases plus the existing retained-submenu case compare forward/backward departure from fresh
and reopened sessions, including an intervening native input in the parent. Checkpoints compare
focus, open/highlight state, actual tabindex values, close reasons, trigger identity and completions.
Native End requests settle through the same recorded checkpoint before issuing a distinct Tab request.

The Menu suite now defines 181 cases / 543 planned comparisons: 495 executable and the existing 48
touch capability skips. Focused checks cover the three desktop engines on macOS and Linux, with
additional Menu-family, Select and Popover consumer checks for the shared mechanism. The public
Initial Focus example includes a nested toggle and a following page control; browser tests use real
Tab/Shift+Tab and assert guard cleanup after fresh and retained closes.

Three focused Angular units exercise the real structural portal with a separate container, native
guard focus and exactly one close request, plus retained/modal/destruction cleanup. They fail on
the previous focus manager and pass with the shared declaration bridge. They also catch the direct
portal-instance injection cycle during immediate mounting.

One exact completion pair extends the existing nested-exit-completion category. A fresh whole-chain
Tab close drops the pin's child onOpenChangeComplete(false), as with its known nested CSS disposal
case; Angular preserves the callback through embedded-view ownership. Focus, requests, reasons and
trigger identity match. Retained and backward cases match without new exceptions. Do not reproduce
the pin's dropped callback or normalize completions in a fixture.

## Remaining scope

Update: [ADR 0054](0054-menu-focus-out-and-final-focus.md) covers focus-out cancellation and finalFocus.
It also refines the keyboard split: forward Tab stays native; Shift+Tab is an explicit cancelable
owner-return request, as in Base UI list navigation.

Cancelable focus-out, explicit finalFocus combinations across nested portals and further projected
wrappers remain separate audits. Real devices and assistive technology are not certified by these
DOM comparisons. This increment does not complete all Menu APIs or the full portal-focus matrix.

## Base UI references

Base UI 1.9.0, commit `cf696d6f6e08c699c5bda24d5a033430909f2285`:

- `packages/react/src/utils/popups/portal/FloatingPortal.tsx`
- `packages/react/src/utils/popups/focus/FloatingFocusManager.tsx`
- `packages/react/src/utils/popups/focus/tabbable.ts`
- `packages/react/src/menu/popup/MenuPopup.tsx`
