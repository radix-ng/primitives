# ADR 0061: Preserve Menu sessions through interrupted trigger exits

- Status: Accepted
- Date: 2026-11-13
- Decision owners: Radix NG maintainers
- Related: ADR 0026, ADR 0027, ADR 0035, ADR 0059; `menu`, `popover`, `core`, `floating-focus-manager`

## Context

Individual trigger, controlled-state, handle and exit behaviors already had pinned comparisons.
Their intersections exposed early Escape focus return, reuse of an earlier session's return target,
and outgoing viewport content disappearing before the popup's own exit finished.

## Decision

Let Menu's existing Focus Scope return focus after the accepted exit. Keep synchronous Escape
handoff only for Menubar's coordinator; canceled exits and explicit finalFocus policies keep their
precedence. CSS and external holds can leave native focus in the closing popup until completion.

Menu already captures native focus before reopening a mounted Popup. Expose that snapshot through
its typed context and let the Focus Manager request a guarded default at actual return time. A
surviving outside control remains preferred for programmatic opens; after a fresh Popup has been
removed, use the current connected owner. A retained view preserves its original scope history.
Evaluate native connectivity at return time, rather than caching it in a computed return policy.
The manager's optional DI configuration callback serves this boundary without adding an input or
another focus-history store; Focus Scope still owns the queue and moved-focus guard.

Give the shared viewport an optional presence getter. Menu and Popover derive it from their existing
presence/closing signals. Logical close alone does not discard an outgoing inert snapshot; finishing
the content transition or the popup exit, replacing the transition, and destroying the view own its
cleanup. No new retained flag or animation polling loop is introduced.

## Evidence

Twelve new pinned cases / 36 comparisons combine CSS/deferred exits, retained portals, controlled
open/trigger models, handle open/close, closing payload updates, trigger removal, repeated switches,
and Root removal/recreation during a content transition. Fixtures change only application data or
call public actions. Native WAAPI finishes paused real CSS after the intermediate checkpoints.
Callback arrays prove that a replaced close never completes the new session. Old hold and unmount
calls while open remain harmless.

Native focus and completion are checked in a two-portal-mode Menu unit regression. Popover checks
snapshot retention through a deferred close and cleanup at explicit completion. The public Switch
During Exit example exercises Angular models and handles with semantic Tailwind utilities; browser
checks cover keepMounted on and off and preserve deliberate focus on Finish exit.
An independent Popover browser check holds real content/exit animations and verifies that the
outgoing inert content survives close-start and disappears after the animations complete.

The reference retains aria-labelledby on a settled hidden Popup when triggerId is externally
controlled. Angular keeps its existing closed-association policy; one exact
controlled-retained-label exception records this hidden attribute, not focus or visible semantics.
Angular models remain the state owner, with event cancellation for vetoes; no React controlled-prop
ownership detection or input mirror is added.

Overlapping handle owners, further overlay composition, real devices and assistive technology remain
outside this increment. Local checks use the selected cases and consumers rather than the full suite.

## Reference

Pinned Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285, prepared from the local checkout's
committed objects. The checkout HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 was also inspected.

- packages/react/src/menu/root/MenuRoot.test.tsx (handles and reopening during close)
- packages/react/src/menu/popup/MenuPopup.tsx
- packages/react/src/utils/popups/focus/FloatingFocusManager.tsx
- packages/react/src/utils/popups/viewport/usePopupViewport.tsx
- packages/react/src/internals/resolvePopupLabel.ts
