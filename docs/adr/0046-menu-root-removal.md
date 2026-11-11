# ADR 0046: Compare whole-root removal through native application lifetimes

- Status: Accepted
- Date: 2026-11-11
- Decision owners: Radix NG maintainers
- Related: ADR 0017, ADR 0035, ADR 0037, ADR 0043, ADR 0045, packages/primitives/menu, packages/primitives/context-menu, packages/primitives/menubar, apps/parity-testing

## Context

The Menu-family suites covered closing popups and changing collections, but not conditional removal
of an entire owning Root. A disappearing Root must release resources even when its logical state
is still open, an exit is paused or an application has requested deferred unmounting.

## Decision

Share ten removal scenarios between Menu and Menubar, with nine applicable to Context Menu. Base UI
omits `modal` from Context Menu Root's public props and forces modal behavior; do not send an
unsupported non-modal prop to manufacture an equivalent case. Keep the existing Angular extension
outside this comparison.

F3/F4 are native application commands for conditional removal/recreation. Angular uses `@if` in the
owning view and React conditionally renders the original pinned components. Do not invoke a close
action during destruction, move primitive state into the application, force rendering or redispatch
synthetic input. Menubar cases remove the whole bar and all owned Menu roots.

Compare ordinary/modal ownership, an open child, retained DOM, paused CSS exits, deferred closing,
pending child hover and explicit final focus. Resolve final focus to an existing outside control or
remove that control in the same application update. Record actual native focus and callbacks.

Compare observable background accessibility hiding, native hit testing and scroll blocking. Preserve
raw markup counts as measurements: Angular's existing native `inert` and the pin's `aria-hidden`,
and differences in retained guard markup during exit, do not require identical implementation DOM.
After destruction, both must have no leftover isolation attributes, markers, guards or internal
backdrops. Require original document styles, real keyboard/pointer use and native wheel scrolling.

Use a real CSS animation paused via Tailwind for the exit cases. Install the shared Playwright clock
before navigation; after recreation advance 31 seconds past old hover/exit deadlines. The fresh Root
must stay open with no revived child, stale focus transfer or abandoned completion callback. CSS and
framework state are not replaced by the clock.

Deliver pending-hover movement and the native removal command in one bounded clock frame, then
resume normal rendering. Protocol latency must not decide whether the hover deadline expired first.

The full Linux run also exposed the existing Menu late-hold test racing its 400 ms CSS exit before
the later F10 command. Reuse the paused exit for that case, request the late hold, then finish the
real animation through native WAAPI. The second ordinary close also finishes its real CSS animation.
Do not lengthen test timeouts, synthesize completion events or change primitive timing.
Popover's equivalent late-hold scenario reuses the same held CSS and native WAAPI completion.

## Consequences

The increment adds 29 scenarios / 87 comparisons across three browser engines. Menu has 83 cases /
249 comparisons, Menubar 87 / 261, and Context Menu 45 cases / 135 planned comparisons. Native input
capabilities allow 117 Context Menu comparisons on macOS and 118 on Linux.

Root teardown uses the existing Angular lifetimes. The repeated late-hold comparison also exposed
a shared Presence race: an animation could finish after `present` changed but before its effect ran,
destroying and then recreating the view. Native completion now adopts the current presence through
the existing MOUNT transition before it can unmount, preserving DOM, local values and focus. Disposal
invalidates old animation-promise versions. Deterministic unit regressions cover both boundaries.
No new public lifecycle API, destruction callback or expected-difference exception is needed. Connected explicit targets receive focus;
when that target is removed, native focus falls to the body in the compared cases. Existing native
event records, callback order and completion arrays remain part of the comparison.

Independent nested Context Menu Roots, empty-list keyboard promotion, further API combinations and
real device/assistive-technology verification remain separate work.

## Alternatives Considered

- Emit a synthetic close on destruction: rejected; disposal is an application lifetime boundary.
- Require the same focus-guard/hidden DOM in both frameworks: rejected; compare actual interaction
  and accessibility effects, record raw markup and require complete cleanup after destruction.
- Duplicate teardown scenarios for each family: rejected; only fixture identities and native opening
  actions vary, while the application commands and observable resource assertions are shared.

## Acceptance Criteria

1. Native Root removal and recreation agree with the unmodified pin in three engines.
2. Open, retained, deferred and paused-exit views leave no portal or isolation resources behind.
3. Native keyboard, background activation and wheel scrolling work after destruction.
4. Surviving and removed final-focus targets retain the pin's observable policy.
5. Advancing old deadlines cannot act on a fresh Root or emit abandoned callbacks.
6. Existing Menu-family scenarios and reviewed exceptions remain valid.

## Base UI References

Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`, unmodified:
`context-menu/root/ContextMenuRoot.tsx`, `menu/root/MenuRoot.tsx`, `menu/popup/MenuPopup.tsx`,
`menu/positioner/MenuPositioner.tsx`, `utils/popups/focus/FloatingFocusManager.tsx` and
`utils/popups/InternalBackdrop.tsx` under `packages/react/src`.
