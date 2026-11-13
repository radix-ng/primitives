# ADR 0063: Preserve Dialog when a child Menu backdrop dismisses Menu

- Status: Accepted
- Date: 2026-11-13
- Decision owners: Radix NG maintainers
- Related: ADR 0015, ADR 0026, ADR 0032; `menu`, `dialog`, `dismissable-layer`, `core`

## Context

Menu inside Dialog exposed a native gesture boundary: Menu closes on outside pointerdown, while
modal Dialog waits for an intentional click. A press on Menu's internal backdrop removed Menu,
then the trailing click also closed Dialog. The pinned reference closes Menu alone; another outside
gesture can close Dialog. The parent recognized the child popup and triggers but missed its backdrop.

## Decision

Include an open descendant's existing floatingElements footprint in ancestor dismissal containment.
The backdrop stays outside its own layer, so it still dismisses Menu. For its ancestor, that same
target belongs to the descendant view. The existing press-start capture records containment before
Menu closes; the existing intentional-click guard absorbs the trailing click even if the backdrop
and child node have already been removed. The guard resets for the next gesture.

Reuse the floating tree, owned element registry and local press-start state. No React event flags,
additional public inputs, global gesture ledger or timer is needed. Focus containment and the
current layer's own outside-press policy keep using their existing boundaries.

## Evidence and scope

Eighteen Menu cases / 54 comparisons use matching Dialog → Menu → optional submenu anatomy. They
cover deepest-first Escape, modal/non-modal Menu outside presses, subsequent Dialog dismissal,
selection, Tab/Shift+Tab, vetoes, retained/deferred closes, parent model closure and parent destruction
through open/CSS/deferred states. Recreated parents accept fresh Menu interactions. Dialog records
its own requests and completions; snapshots compare native focus, names, visibility and inert state.
There are no new expected differences.

A dismissal unit regression removes the child backdrop during pointerdown, delivers the native
trailing click on the common ancestor, and proves the next outside gesture can still dismiss the
parent. The Inside Dialog public example adds fresh/retained browser checks for submenu/menu/Dialog
Escape order, backdrop dismissal, focus restoration and explicit deferred completion. Other shared
dismissal consumers receive focused regression checks.

This increment establishes the Menu composition contract with a modal Dialog. Independent Dialog
parity, Menu-triggered Dialog, Popover composition and real-device/assistive-technology evidence
remain separate work.

## Reference

Pinned Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285, prepared from the local checkout's
committed objects. Checkout HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 was also inspected.

- packages/react/src/menu/root/MenuRoot.tsx and MenuRoot.test.tsx
- packages/react/src/menu/positioner/MenuPositioner.tsx
- packages/react/src/utils/popups/InternalBackdrop.tsx
- packages/react/src/utils/popups/interactions/useDismiss.ts
